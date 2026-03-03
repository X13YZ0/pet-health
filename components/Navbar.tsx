'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/login') return null;

  const navItems = [
    { href: '/', label: 'หน้าหลัก' },
    { href: '/community', label: 'ชุมชน' },
    { href: '/chat', label: 'AI Assistant' },
    { href: '/emergency', label: 'ฉุกเฉิน', danger: true },
  ];

  return (
    <header style={{
      borderBottom: '1px solid #f3f4f6',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: '52px', padding: '0 24px',
      }}>

        {/* Logo */}
        <a href="/" style={{display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0}}>
          <div style={{width: '28px', height: '28px', background: '#0d9488', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'}}>🐾</div>
          <span style={{fontWeight: '700', fontSize: '15px', color: '#111827', letterSpacing: '-0.02em'}}>PetHealth</span>
        </a>

        {/* Nav */}
        <nav style={{display: 'flex', alignItems: 'center', gap: '2px'}}>
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <a key={item.href} href={item.href} style={{
                padding: '5px 12px', borderRadius: '7px',
                fontSize: '13px', fontWeight: active ? '600' : '500',
                textDecoration: 'none',
                color: item.danger ? '#ef4444' : active ? '#0d9488' : '#6b7280',
                background: active ? (item.danger ? '#fef2f2' : '#f0fdfa') : 'transparent',
                transition: 'all 0.15s ease',
              }}>
                {item.danger && '🚨 '}{item.label}
              </a>
            );
          })}
        </nav>

        {/* Right */}
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0}}>
          {user ? (
            <>
              <a href="/profile" style={{width: '30px', height: '30px', background: '#0d9488', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '12px', textDecoration: 'none'}}>
                {user.email?.charAt(0).toUpperCase()}
              </a>
              <button
                onClick={() => { signOut(auth); router.push('/'); }}
                style={{padding: '5px 12px', borderRadius: '7px', border: '1px solid #e5e7eb', background: 'white', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'}}
              >
                ออก
              </button>
            </>
          ) : (
            <div style={{display: 'flex', gap: '6px'}}>
              <a href="/login" style={{padding: '5px 14px', borderRadius: '7px', border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontSize: '13px', fontWeight: '500', textDecoration: 'none'}}>
                เข้าสู่ระบบ
              </a>
              <a href="/login" style={{padding: '5px 14px', borderRadius: '7px', background: '#0d9488', color: 'white', fontSize: '13px', fontWeight: '500', textDecoration: 'none'}}>
                สมัครสมาชิก
              </a>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}