'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ProfilePage() {

  const { user } = useAuth();
  const router = useRouter();

  if (!user)
    return (
      <div style={{
        textAlign: 'center',
        padding: '80px 24px',
        fontFamily: 'system-ui'
      }}>
        <p style={{ color: '#9ca3af', marginBottom: '16px' }}>
          กรุณาเข้าสู่ระบบก่อน
        </p>

        <a
          href="/login"
          style={{
            background: '#0d9488',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          เข้าสู่ระบบ
        </a>
      </div>
    );

  return (
    <div
      style={{
        background: '#f9fafb',
        minHeight: '100vh',
        fontFamily: 'system-ui'
      }}
    >
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Profile */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            padding: '24px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px'
            }}
          >

            {/* Avatar */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#0d9488',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: '700'
              }}
            >
              {user.email?.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  margin: '0 0 3px'
                }}
              >
                {user.displayName || user.email?.split('@')[0]}
              </h1>

              <p
                style={{
                  fontSize: '13px',
                  color: '#9ca3af',
                  margin: 0
                }}
              >
                {user.email}
              </p>
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                signOut(auth);
                router.push('/');
              }}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: 'white',
                color: '#9ca3af',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              ออกจากระบบ
            </button>

          </div>

          {/* Menu */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              paddingTop: '20px',
              borderTop: '1px solid #f3f4f6'
            }}
          >

            <button
              onClick={() => router.push('/symptom-check')}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              ตรวจอาการสัตว์
            </button>

            <button
              onClick={() => router.push('/articles')}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              บทความสุขภาพ
            </button>

          </div>
        </div>

      </main>
    </div>
  );
}
