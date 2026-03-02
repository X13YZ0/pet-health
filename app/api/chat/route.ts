import { NextRequest, NextResponse } from 'next/server';
import { isEmergency } from '@/lib/emergencyKeywords';
import { readFileSync } from 'fs';
import { join } from 'path';

const knowledgeBase = JSON.parse(
  readFileSync(join(process.cwd(), 'public/knowledge_base.json'), 'utf-8')
);

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
          { name: 'คลินิกฉุกเฉิน 24 ชม.', number: '02-123-4567' },
        ],
      });
    }

    // STEP 2: Search Knowledge Base
    const kbResults = searchKB(message);
    let context = '';
    let citations: { title: string; source: string; url: string }[] = [];

    if (kbResults.length > 0) {
      context = kbResults.map((r: any) => r.content).join('\n\n');
      citations = kbResults.map((r: any) => ({
        title: r.topic,
        source: r.source,
        url: r.sourceUrl,
      }));
    } else {
      // STEP 3: Tavily Search (fallback)
      try {
        const tavilyRes = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: `${message} pet dog cat veterinary health`,
            max_results: 3,
            include_domains: ['aspca.org', 'avma.org', 'akc.org', 'vcahospitals.com', 'icatcare.org'],
          }),
        });
        const tavilyData = await tavilyRes.json();
        if (tavilyData.results?.length > 0) {
          context = tavilyData.results.map((r: any) => r.content).join('\n\n');
          citations = tavilyData.results.map((r: any) => ({
            title: r.title,
            source: new URL(r.url).hostname,
            url: r.url,
          }));
        }
      } catch (err) {
        console.log('Tavily error:', err);
      }
    }

    if (!context) context = 'ไม่พบข้อมูลที่เกี่ยวข้อง';

    // STEP 4: Gemini AI
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `คุณคือผู้ช่วยให้ข้อมูลเกี่ยวกับสุขภาพสัตว์เลี้ยง
ตอบคำถามโดยใช้ข้อมูลจาก Context ที่ให้มาเป็นหลัก
ถ้า Context ไม่มีข้อมูลที่เกี่ยวข้อง ให้ตอบจากความรู้ทั่วไปเกี่ยวกับสัตว์เลี้ยงได้
ห้ามวินิจฉัยโรคหรือสั่งยา
ถ้าอาการรุนแรงให้แนะนำพบสัตวแพทย์
ตอบเป็นภาษาเดียวกับคำถาม ให้กระชับและเป็นประโยชน์

Context:
${context}

คำถาม: ${message}`,
            }],
          }],
        }),
      }
    );

    const geminiData = await geminiRes.json();

    if (geminiData.error) {
      return NextResponse.json({
        type: 'answer',
        message: geminiData.error.code === 429
          ? '⏳ AI กำลังมีผู้ใช้งานจำนวนมาก กรุณารอสักครู่แล้วลองใหม่'
          : '❌ เกิดข้อผิดพลาดจาก AI กรุณาลองใหม่',
        citations: [],
      });
    }

    const reply =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      'ไม่สามารถสร้างคำตอบได้';

    return NextResponse.json({ type: 'answer', message: reply, citations });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      type: 'answer',
      message: '🚨 ระบบขัดข้อง กรุณาลองใหม่ภายหลัง',
      citations: [],
    }, { status: 500 });
  }
}