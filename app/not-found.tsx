'use client';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)',
      background: '#f9fafb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      padding: '24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{
          width: '64px', height: '64px', background: '#f3f4f6',
          borderRadius: '20px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '28px',
          margin: '0 auto 24px',
        }}>🐾</div>

        <h1 style={{
          fontSize: '64px', fontWeight: '800', color: '#e5e7eb',
          letterSpacing: '-0.05em', margin: '0 0 8px', lineHeight: 1,
        }}>404</h1>

        <h2 style={{
          fontSize: '18px', fontWeight: '700', color: '#111827',
          letterSpacing: '-0.02em', margin: '0 0 10px',
        }}>ไม่พบหน้านี้</h2>

        <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 32px', lineHeight: '1.6' }}>
          หน้าที่คุณหาอาจถูกย้ายหรือไม่มีอยู่แล้ว
        </p>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: '9px 20px', borderRadius: '9px',
              border: '1px solid #e5e7eb', background: 'white',
              color: '#374151', fontSize: '14px', fontWeight: '500',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ← ย้อนกลับ
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '9px 20px', borderRadius: '9px',
              border: 'none', background: '#0d9488',
              color: 'white', fontSize: '14px', fontWeight: '500',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
}