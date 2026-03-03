'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError('กรุณากรอกอีเมลและรหัสผ่าน'); return; }
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (e: any) {
      const msg: Record<string, string> = {
        'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว',
        'auth/weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
      };
      setError(msg[e.code] || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 50%, #f0fdf4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    }}>
      <div style={{width: '100%', maxWidth: '420px'}}>

        {/* Logo */}
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #0d9488, #0f766e)',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(13, 148, 136, 0.3)',
          }}>🐾</div>
          <h1 style={{fontSize: '28px', fontWeight: '700', color: '#111827', letterSpacing: '-0.03em', margin: '0 0 6px'}}>
            Pet Health
          </h1>
          <p style={{color: '#6b7280', fontSize: '15px', margin: 0}}>
            ผู้ช่วยดูแลสัตว์เลี้ยงอัจฉริยะ
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          border: '1px solid rgba(255,255,255,0.8)',
        }}>

          {/* Tab Switch */}
          <div style={{
            display: 'flex',
            background: '#f3f4f6',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '28px',
          }}>
            {['เข้าสู่ระบบ', 'สมัครสมาชิก'].map((label, i) => (
              <button
                key={i}
                onClick={() => { setIsLogin(i === 0); setError(''); }}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  background: isLogin === (i === 0) ? 'white' : 'transparent',
                  color: isLogin === (i === 0) ? '#111827' : '#6b7280',
                  boxShadow: isLogin === (i === 0) ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{marginBottom: '16px'}}>
            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px'}}>
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="your@email.com"
              style={{
                width: '100%', padding: '11px 14px',
                border: '1.5px solid #e5e7eb',
                borderRadius: '10px', fontSize: '14px',
                outline: 'none', transition: 'border-color 0.15s',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => e.target.style.borderColor = '#0d9488'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{marginBottom: '24px'}}>
            <label style={{display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px'}}>
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '11px 14px',
                border: '1.5px solid #e5e7eb',
                borderRadius: '10px', fontSize: '14px',
                outline: 'none', transition: 'border-color 0.15s',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => e.target.style.borderColor = '#0d9488'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', padding: '10px 14px',
              color: '#dc2626', fontSize: '13px', marginBottom: '16px',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0d9488, #0f766e)',
              color: 'white', border: 'none',
              borderRadius: '10px', fontSize: '15px',
              fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(13, 148, 136, 0.3)',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'กำลังดำเนินการ...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>

        </div>

        {/* Footer */}
        <p style={{textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '24px'}}>
          🔒 ข้อมูลของคุณปลอดภัยและเป็นความลับ
        </p>

      </div>
    </div>
  );
}