'use client';

export default function EmergencyPage() {
  const contacts = [
    { name: 'สายด่วนสัตวแพทย์', number: '1669', hours: '24 ชั่วโมง', open: true },
    { name: 'คลินิกสัตว์ฉุกเฉิน', number: '02-123-4567', hours: '24 ชั่วโมง', open: true },
    { name: 'โรงพยาบาลสัตว์จุฬา', number: '02-218-9740', hours: 'จ–ศ 8:00–20:00', open: false },
    { name: 'โรงพยาบาลสัตว์กาสิกร', number: '02-579-7692', hours: '24 ชั่วโมง', open: true },
  ];

  const symptoms = [
    { icon: '😵', text: 'ชักหรือหมดสติ', critical: true },
    { icon: '😮‍💨', text: 'หายใจลำบากหรือหอบ', critical: true },
    { icon: '🤢', text: 'กินสารพิษหรือยาเข้าไป', critical: true },
    { icon: '🩸', text: 'เลือดออกไม่หยุด', critical: true },
    { icon: '🤕', text: 'ถูกรถชนหรือบาดเจ็บรุนแรง', critical: false },
    { icon: '🌡️', text: 'ไข้สูงหรืออุณหภูมิต่ำผิดปกติ', critical: false },
    { icon: '🚫', text: 'ไม่กินอาหารเกิน 24 ชั่วโมง', critical: false },
    { icon: '😿', text: 'เจ็บปวดรุนแรง ร้องไม่หยุด', critical: false },
  ];

  const steps = [
    'ตั้งสติ — สัตว์เลี้ยงจะรับรู้ความตื่นตระหนกของเรา',
    'โทรแจ้งสัตวแพทย์ก่อนออกเดินทาง เพื่อให้เตรียมพร้อมรับ',
    'อย่าให้อาหารหรือน้ำถ้ามีอาการอาเจียนหรือชัก',
    'ห่อตัวด้วยผ้านุ่มๆ เพื่อให้ความอบอุ่นและลดการดิ้น',
    'เดินทางให้เร็วที่สุด — ทุกนาทีมีความสำคัญ',
  ];

  return (
    <div style={{background: '#f9fafb', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'}}>
      <main style={{maxWidth: '640px', margin: '0 auto', padding: '32px 24px'}}>

        {/* Hero */}
        <div style={{background: 'linear-gradient(135deg, #dc2626, #b91c1c)', borderRadius: '16px', padding: '28px', marginBottom: '20px', color: 'white'}}>
          <h1 style={{fontSize: '20px', fontWeight: '700', margin: '0 0 8px', letterSpacing: '-0.02em'}}>
            🚨 ฉุกเฉินสัตว์เลี้ยง
          </h1>
          <p style={{fontSize: '14px', margin: '0 0 24px', opacity: 0.9, lineHeight: '1.6'}}>
            อย่ารอ — หากสัตว์เลี้ยงมีอาการฉุกเฉิน ติดต่อสัตวแพทย์ทันที
          </p>
          <a href="tel:1669" style={{display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', color: '#dc2626', padding: '11px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '16px'}}>
            📞 โทร 1669 ทันที
          </a>
        </div>

        {/* Contacts */}
        <div style={{background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'}}>
          <h2 style={{fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 14px', letterSpacing: '-0.01em'}}>📞 เบอร์ติดต่อฉุกเฉิน</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {contacts.map((c, i) => (
              <a key={i} href={`tel:${c.number}`} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', textDecoration: 'none', transition: 'all 0.15s', background: 'white'}}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#f9fafb'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'white'}
              >
                <div>
                  <p style={{fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 2px'}}>{c.name}</p>
                  <p style={{fontSize: '12px', color: '#9ca3af', margin: 0}}>{c.hours}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{fontFamily: 'monospace', fontWeight: '700', fontSize: '15px', color: '#dc2626', margin: '0 0 4px'}}>{c.number}</p>
                  <span style={{fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '999px', background: c.open ? '#dcfce7' : '#fef9c3', color: c.open ? '#15803d' : '#a16207'}}>
                    {c.open ? 'เปิดอยู่' : 'เวลาทำการ'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div style={{background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'}}>
          <h2 style={{fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 14px', letterSpacing: '-0.01em'}}>⚠️ อาการที่ต้องพบสัตวแพทย์ทันที</h2>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
            {symptoms.map((s, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: s.critical ? '#fef2f2' : '#fffbeb', borderLeft: `3px solid ${s.critical ? '#ef4444' : '#f59e0b'}`}}>
                <span style={{fontSize: '18px', flexShrink: 0}}>{s.icon}</span>
                <span style={{fontSize: '13px', color: '#374151', lineHeight: '1.4'}}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* First Aid */}
        <div style={{background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'}}>
          <h2 style={{fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 14px', letterSpacing: '-0.01em'}}>🩺 สิ่งที่ควรทำก่อนถึงสัตวแพทย์</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {steps.map((step, i) => (
              <div key={i} style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                <div style={{width: '22px', height: '22px', borderRadius: '50%', background: '#0d9488', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0, marginTop: '1px'}}>
                  {i + 1}
                </div>
                <p style={{fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0}}>{step}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}