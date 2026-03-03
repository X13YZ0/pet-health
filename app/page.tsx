'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  const features = [
    {
      icon: '🤖',
      title: 'AI Assistant',
      desc: 'ถามเรื่องสุขภาพสัตว์เลี้ยงได้ทันที ตอบพร้อมแหล่งอ้างอิงจากผู้เชี่ยวชาญ',
      action: () => router.push('/chat'),
      cta: 'ลองเลย',
      color: '#0d9488',
      bg: '#f0fdfa',
    },
    {
      icon: '👥',
      title: 'ชุมชนเจ้าของสัตว์เลี้ยง',
      desc: 'แชร์ประสบการณ์ ถามตอบ และเรียนรู้จากคนที่เลี้ยงสัตว์เหมือนกัน',
      action: () => router.push('/community'),
      cta: 'ดูชุมชน',
      color: '#7c3aed',
      bg: '#faf5ff',
    },
    {
      icon: '🚨',
      title: 'ข้อมูลฉุกเฉิน',
      desc: 'เบอร์โทรสัตวแพทย์ฉุกเฉิน อาการที่ต้องระวัง และ first aid guide',
      action: () => router.push('/emergency'),
      cta: 'ดูข้อมูล',
      color: '#dc2626',
      bg: '#fff1f2',
    },
  ];

  const faqs = [
    { q: 'สุนัขกินองุ่นได้ไหม?', tag: '🐶' },
    { q: 'แมวควรฉีดวัคซีนอะไรบ้าง?', tag: '🐱' },
    { q: 'สัตว์เลี้ยงมีไข้ทำยังไง?', tag: '🌡️' },
    { q: 'อาหารที่ห้ามให้สุนัขกิน', tag: '🚫' },
    { q: 'วิธีดูแลลูกแมวแรกเกิด', tag: '🍼' },
    { q: 'สัญญาณที่ต้องพาไปหาหมอด่วน', tag: '⚠️' },
  ];

  return (
    <div style={{
      background: '#f9fafb', minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    }}>

      {/* Hero */}
      <section style={{background: 'white', borderBottom: '1px solid #f3f4f6', padding: '72px 24px'}}>
        <div style={{maxWidth: '600px', margin: '0 auto', textAlign: 'center'}}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#f0fdfa', border: '1px solid #99f6e4',
            borderRadius: '999px', padding: '4px 14px',
            fontSize: '12px', fontWeight: '600', color: '#0f766e',
            marginBottom: '28px',
          }}>
            <span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block'}} />
            AI พร้อมตอบตลอด 24 ชั่วโมง
          </div>
          <h1 style={{
            fontSize: '44px', fontWeight: '800', color: '#111827',
            letterSpacing: '-0.04em', lineHeight: '1.1', margin: '0 0 20px',
          }}>
            ดูแลสัตว์เลี้ยง<br/>
            <span style={{color: '#0d9488'}}>ได้ง่ายขึ้น</span>
          </h1>
          <p style={{fontSize: '16px', color: '#6b7280', lineHeight: '1.7', margin: '0 0 36px'}}>
            แพลตฟอร์มที่รวม AI assistant ชุมชนเจ้าของสัตว์เลี้ยง
            และข้อมูลฉุกเฉินไว้ในที่เดียว
          </p>
          <div style={{display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap'}}>
            <button
              onClick={() => router.push('/chat')}
              style={{
                background: '#0d9488', color: 'white', border: 'none',
                borderRadius: '10px', padding: '12px 28px', fontSize: '15px',
                fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(13,148,136,0.3)',
              }}
            >
              ถาม AI เลย →
            </button>
            {!user && (
              <button
                onClick={() => router.push('/login')}
                style={{
                  background: 'white', color: '#374151',
                  border: '1px solid #e5e7eb', borderRadius: '10px',
                  padding: '12px 28px', fontSize: '15px',
                  fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                สมัครสมาชิกฟรี
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{maxWidth: '900px', margin: '0 auto', padding: '60px 24px'}}>
        <p style={{
          textAlign: 'center', fontSize: '12px', fontWeight: '600',
          color: '#9ca3af', letterSpacing: '0.1em',
          textTransform: 'uppercase', margin: '0 0 32px',
        }}>
          ฟีเจอร์หลัก
        </p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px'}}>
          {features.map((f, i) => (
            <div
              key={i}
              onClick={f.action}
              style={{
                background: 'white', borderRadius: '16px',
                border: '1px solid #e5e7eb', padding: '24px',
                cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                el.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '44px', height: '44px', background: f.bg,
                borderRadius: '12px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', marginBottom: '16px',
              }}>{f.icon}</div>
              <h3 style={{fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em'}}>
                {f.title}
              </h3>
              <p style={{fontSize: '13px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 20px'}}>
                {f.desc}
              </p>
              <span style={{fontSize: '13px', fontWeight: '600', color: f.color}}>
                {f.cta} →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Questions */}
      <section style={{background: 'white', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', padding: '60px 24px'}}>
        <div style={{maxWidth: '680px', margin: '0 auto'}}>
          <h2 style={{textAlign: 'center', fontSize: '22px', fontWeight: '700', color: '#111827', letterSpacing: '-0.03em', margin: '0 0 6px'}}>
            คำถามยอดนิยม
          </h2>
          <p style={{textAlign: 'center', fontSize: '14px', color: '#9ca3af', margin: '0 0 32px'}}>
            กดเพื่อถาม AI ได้ทันที
          </p>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px'}}>
            {faqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => router.push('/chat')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderRadius: '10px',
                  border: '1px solid #e5e7eb', background: '#f9fafb',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s ease', fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = '#f0fdfa';
                  el.style.borderColor = '#99f6e4';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = '#f9fafb';
                  el.style.borderColor = '#e5e7eb';
                }}
              >
                <span style={{fontSize: '18px', flexShrink: 0}}>{faq.tag}</span>
                <span style={{fontSize: '13px', color: '#374151', fontWeight: '500', lineHeight: '1.4'}}>{faq.q}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — แสดงเฉพาะตอนยังไม่ login */}
      {!user && (
        <section style={{padding: '72px 24px', textAlign: 'center'}}>
          <div style={{maxWidth: '440px', margin: '0 auto'}}>
            <h2 style={{fontSize: '26px', fontWeight: '700', color: '#111827', letterSpacing: '-0.03em', margin: '0 0 12px'}}>
              เริ่มใช้งานฟรีเลย
            </h2>
            <p style={{fontSize: '15px', color: '#6b7280', margin: '0 0 28px', lineHeight: '1.6'}}>
              สมัครฟรีเพื่อโพสต์ในชุมชนและบันทึกประวัติการสนทนากับ AI
            </p>
            <button
              onClick={() => router.push('/login')}
              style={{
                background: '#111827', color: 'white', border: 'none',
                borderRadius: '10px', padding: '13px 32px', fontSize: '15px',
                fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              สมัครสมาชิกฟรี
            </button>
          </div>
        </section>
      )}

      <footer style={{borderTop: '1px solid #f3f4f6', padding: '24px', textAlign: 'center'}}>
        <p style={{fontSize: '12px', color: '#9ca3af', margin: 0}}>
          © 2024 PetHealth — ข้อมูลนี้ไม่ใช่การวินิจฉัยโรค ควรปรึกษาสัตวแพทย์เสมอ
        </p>
      </footer>
    </div>
  );
}