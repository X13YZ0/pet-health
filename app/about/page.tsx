'use client';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  const pipeline = [
    { step: '1', label: 'รับคำถาม', desc: 'ผู้ใช้พิมพ์คำถามเกี่ยวกับสัตว์เลี้ยง', color: '#0d9488' },
    { step: '2', label: 'ค้น Knowledge Base', desc: 'ระบบค้นหาจากฐานความรู้ที่คัดกรองมาแล้ว 15+ หัวข้อ', color: '#0d9488' },
    { step: '3', label: 'ค้นเว็บจริง', desc: 'ถ้าข้อมูลไม่พอ ค้นเพิ่มผ่าน Tavily Search API', color: '#7c3aed' },
    { step: '4', label: 'ตรวจสอบฉุกเฉิน', desc: 'ตรวจ keyword ฉุกเฉิน เช่น ชัก หายใจลำบาก เลือดออก', color: '#dc2626' },
    { step: '5', label: 'Gemini สรุป', desc: 'ส่งข้อมูลทั้งหมดให้ Gemini ประมวลผลเป็นภาษาไทย', color: '#2563eb' },
    { step: '6', label: 'แสดงพร้อม Citation', desc: 'ตอบพร้อมแหล่งอ้างอิงที่คลิกไปดูต้นฉบับได้', color: '#0d9488' },
  ];

  const techStack = [
    { name: 'Next.js 15', role: 'Frontend + API Routes', why: 'เก็บ API keys ฝั่ง server ได้ปลอดภัย' },
    { name: 'Firebase Auth', role: 'ระบบ Authentication', why: 'ปลอดภัย ไม่ต้องสร้าง auth เอง' },
    { name: 'Firestore', role: 'Database', why: 'Realtime, scalable, ไม่ต้องจัดการ server' },
    { name: 'Gemini API', role: 'AI สรุปและตอบคำถาม', why: 'รองรับภาษาไทยได้ดี' },
    { name: 'Tavily API', role: 'ค้นเว็บจริง', why: 'ออกแบบมาสำหรับ AI search โดยเฉพาะ' },
    { name: 'Vercel', role: 'Deployment', why: 'รองรับ Next.js ได้ดีที่สุด' },
  ];

  const sources = [
    { name: 'VCA Animal Hospitals', url: 'https://vcahospitals.com', desc: 'ฐานความรู้สัตวแพทย์' },
    { name: 'ASPCA', url: 'https://aspca.org', desc: 'สารพิษและความปลอดภัย' },
    { name: 'PetMD', url: 'https://petmd.com', desc: 'โรคและอาการต่างๆ' },
    { name: 'Cornell Feline Health Center', url: 'https://vet.cornell.edu', desc: 'ข้อมูลสุขภาพแมว' },
    { name: 'AKC (American Kennel Club)', url: 'https://akc.org', desc: 'ข้อมูลสุขภาพสุนัข' },
  ];

  return (
    <div style={{
      background: '#f9fafb', minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    }}>
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#f0fdfa', border: '1px solid #99f6e4',
            borderRadius: '999px', padding: '4px 14px',
            fontSize: '12px', fontWeight: '600', color: '#0f766e',
            marginBottom: '16px',
          }}>
            เกี่ยวกับโปรเจกต์
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', letterSpacing: '-0.04em', margin: '0 0 12px' }}>
            PetHealth คืออะไร?
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.7', margin: 0 }}>
            แพลตฟอร์มที่รวม AI assistant และชุมชนเจ้าของสัตว์เลี้ยง เพื่อให้ข้อมูลด้านสุขภาพสัตว์ที่มีแหล่งอ้างอิงและเชื่อถือได้ — แก้ปัญหาข้อมูลผิดพลาดจากโซเชียลมีเดีย
          </p>
        </div>

        {/* ปัญหาที่แก้ */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            🔍 ปัญหาที่โปรเจกต์นี้แก้
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { problem: 'ข้อมูลสุขภาพสัตว์ออนไลน์ไม่มีแหล่งอ้างอิง', solution: 'ทุกคำตอบมี citation ที่คลิกดูต้นฉบับได้' },
              { problem: 'คำแนะนำจากกลุ่ม Facebook อาจผิดพลาด', solution: 'AI ค้นจากแหล่งสัตวแพทย์จริงก่อนเสมอ' },
              { problem: 'เวลาฉุกเฉินหาข้อมูลช้า', solution: 'ระบบตรวจ keyword และแสดงเบอร์โทรทันที' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '10px', background: '#f9fafb' }}>
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  <span style={{ fontSize: '13px', color: '#ef4444' }}>✕</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 4px', textDecoration: 'line-through' }}>{item.problem}</p>
                  <p style={{ fontSize: '13px', color: '#0d9488', margin: 0, fontWeight: '500' }}>✓ {item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Pipeline */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            🤖 AI Pipeline ทำงานอย่างไร?
          </h2>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 20px' }}>
            ไม่ใช่แค่ส่งคำถามให้ AI ตอบ — มีขั้นตอนคัดกรองและเสริมข้อมูลก่อนเสมอ
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {pipeline.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: p.color, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '700',
                  }}>{p.step}</div>
                  {i < pipeline.length - 1 && (
                    <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '4px 0' }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < pipeline.length - 1 ? '0' : '0', paddingTop: '4px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 2px' }}>{p.label}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: i < pipeline.length - 1 ? '0 0 16px' : '0' }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            🛠 Tech Stack
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {techStack.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', background: '#f9fafb', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827', minWidth: '120px' }}>{t.name}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{t.role}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'right', flexShrink: 0 }}>{t.why}</span>
              </div>
            ))}
          </div>
        </div>

        {/* แหล่งอ้างอิง */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            📚 แหล่งข้อมูลใน Knowledge Base
          </h2>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 16px' }}>
            AI จะค้นจากแหล่งเหล่านี้ก่อนเสมอ
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb',
                textDecoration: 'none', background: 'white', transition: 'all 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#f0fdfa'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'white'}
              >
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0 0 2px' }}>{s.name}</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{s.desc}</p>
                </div>
                <span style={{ fontSize: '12px', color: '#0d9488' }}>↗</span>
              </a>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px', marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', color: '#92400e', margin: 0, lineHeight: '1.6' }}>
            ⚠️ <strong>ข้อจำกัด:</strong> PetHealth ไม่ใช่ระบบวินิจฉัยโรคและไม่ใช่การแทนที่สัตวแพทย์ ข้อมูลทั้งหมดมีไว้เพื่อเป็นแนวทางเบื้องต้นเท่านั้น หากสัตว์เลี้ยงมีอาการผิดปกติควรพบสัตวแพทย์เสมอ
          </p>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/chat')} style={{
            padding: '10px 24px', borderRadius: '10px', border: 'none',
            background: '#0d9488', color: 'white', fontSize: '14px',
            fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            ลองถาม AI →
          </button>
          <button onClick={() => router.push('/community')} style={{
            padding: '10px 24px', borderRadius: '10px',
            border: '1px solid #e5e7eb', background: 'white',
            color: '#374151', fontSize: '14px', fontWeight: '500',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            ดูชุมชน
          </button>
        </div>

      </main>
    </div>
  );
}