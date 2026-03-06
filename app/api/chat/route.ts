import { NextRequest, NextResponse } from 'next/server';
import { isEmergency } from '@/lib/emergencyKeywords';
import { readFileSync } from 'fs';
import { join } from 'path';

const knowledgeBase = JSON.parse(
  readFileSync(join(process.cwd(), 'public/knowledge_base.json'), 'utf-8')
);

// ✅ validate URL จริง — ต้อง https และ domain จริง ไม่ใช่ localhost หรือ example.com
function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.protocol === 'https:' &&
      !u.hostname.includes('example') &&
      !u.hostname.includes('localhost') &&
      !u.hostname.includes('placeholder') &&
      u.hostname.includes('.')
    );
  } catch {
    return false;
  }
}

function searchKB(message: string) {
  const lower = message.toLowerCase();

  const scored = knowledgeBase.map((item: any) => {
    let score = 0;

    item.keywords.forEach((kw: string) => {
      if (lower.includes(kw.toLowerCase())) score += 3;
    });

    if (lower.includes(item.topic.toLowerCase())) score += 2;

    if (lower.includes('แมว') || lower.includes('cat')) {
      if (item.petType === 'cat' || item.petType === 'all') score += 1;
    }
    if (lower.includes('สุนัข') || lower.includes('หมา') || lower.includes('dog')) {
      if (item.petType === 'dog' || item.petType === 'all') score += 1;
    }

    const words = lower.split(/\s+/);
    words.forEach((word: string) => {
      if (word.length > 2) {
        item.keywords.forEach((kw: string) => {
          if (kw.toLowerCase().includes(word)) score += 1;
        });
        if (item.topic.toLowerCase().includes(word)) score += 1;
        if (item.content.toLowerCase().includes(word)) score += 0.5;
      }
    });

    return { item, score };
  });

  return scored
    .filter((s: { item: any; score: number }) => s.score > 0)
    .sort((a: { item: any; score: number }, b: { item: any; score: number }) => b.score - a.score)
    .slice(0, 3)
    .map((s: { item: any; score: number }) => s.item);
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    // STEP 1: Emergency Check
    if (isEmergency(message)) {
      return NextResponse.json({
        type: 'emergency',
        message: '🚨 ตรวจพบอาการฉุกเฉิน! กรุณาติดต่อสัตวแพทย์ทันที อย่ารอ!',
        contacts: [
          { name: 'สายด่วนสัตวแพทย์', number: '1669' },
          { name: 'คลินิกฉุกเฉิน 24 ชม.', number: '02-579-7692' },
        ],
      });
    }

    // STEP 2: Search Knowledge Base
    const kbResults = searchKB(message);
    let context = '';
    let citations: { title: string; source: string; url: string }[] = [];

    if (kbResults.length > 0) {
      context = kbResults.map((r: any) => r.content).join('\n\n');

      // ✅ กรอง citation ที่ URL จริงเท่านั้น ถ้า URL เฟคไม่แสดง
      citations = kbResults
        .filter((r: any) => isValidUrl(r.sourceUrl))
        .map((r: any) => ({
          title: r.topic,
          source: new URL(r.sourceUrl).hostname.replace('www.', ''),
          url: r.sourceUrl,
        }));
    }

    // STEP 3: Tavily Search
    // ทำเสมอถ้า KB ไม่มีผล หรือ KB มีผลแต่ citations URL เฟคหมด
    if (!context || citations.length === 0) {
      try {
        const tavilyRes = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: `${message} สัตว์เลี้ยง สุขภาพ สัตวแพทย์`,
            max_results: 3,
            search_depth: 'basic',
            include_domains: [
              'vcahospitals.com',
              'aspca.org',
              'akc.org',
              'avma.org',
              'icatcare.org',
              'petmd.com',
              'vet.cornell.edu',
            ],
          }),
        });

        const tavilyData = await tavilyRes.json();

        if (tavilyData.results?.length > 0) {
          // ใช้ Tavily context ถ้า KB ว่าง
          if (!context) {
            context = tavilyData.results.map((r: any) => r.content).join('\n\n');
          }
          // ✅ Tavily URL จริงเสมอ แต่ validate ไว้ด้วย
          const tavilyCitations = tavilyData.results
            .filter((r: any) => isValidUrl(r.url))
            .map((r: any) => ({
              title: r.title?.slice(0, 80) || 'แหล่งอ้างอิง',
              source: new URL(r.url).hostname.replace('www.', ''),
              url: r.url,
            }));

          // merge citations — Tavily ไว้หลัง KB
          citations = [...citations, ...tavilyCitations].slice(0, 4);
        }
      } catch (err) {
        console.log('Tavily error:', err);
      }
    }

    if (!context) context = 'ไม่พบข้อมูลที่เกี่ยวข้องในฐานความรู้';

    // STEP 4: Gemini AI
    // ✅ เปลี่ยนเป็น gemini-2.5-flash — stable กว่า และ free tier quota มากกว่า
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `คุณคือผู้ช่วยให้ข้อมูลเกี่ยวกับสุขภาพสัตว์เลี้ยง ตอบเป็นภาษาไทยเสมอ
ใช้ข้อมูลจาก Context เป็นหลัก ถ้า Context ไม่เพียงพอให้ใช้ความรู้ทั่วไป
ห้ามวินิจฉัยโรคหรือสั่งยา ถ้าอาการรุนแรงให้แนะนำพบสัตวแพทย์
ตอบกระชับ ชัดเจน ไม่เกิน 200 คำ

Context:
${context}

คำถาม: ${message}`,
            }],
          }],
          generationConfig: {
            maxOutputTokens: 512,
            temperature: 0.3,
          },
        }),
      }
    );

    const geminiData = await geminiRes.json();

    // ✅ error handling ครบ
    if (geminiData.error) {
      const code = geminiData.error.code;
      const status = geminiData.error.status;

      if (code === 429 || status === 'RESOURCE_EXHAUSTED') {
        return NextResponse.json({
          type: 'answer',
          message: '⏳ AI มีผู้ใช้งานจำนวนมากในขณะนี้ กรุณารอ 1 นาทีแล้วลองใหม่ครับ',
          citations: [],
        });
      }

      console.error('Gemini error:', geminiData.error);
      return NextResponse.json({
        type: 'answer',
        message: '❌ เกิดข้อผิดพลาดจาก AI กรุณาลองใหม่',
        citations: [],
      });
    }

    const reply =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      'ไม่สามารถสร้างคำตอบได้ กรุณาลองใหม่';

    return NextResponse.json({
      type: 'answer',
      message: reply,
      citations,
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      type: 'answer',
      message: '🚨 ระบบขัดข้อง กรุณาลองใหม่ภายหลัง',
      citations: [],
    }, { status: 500 });
  }
}