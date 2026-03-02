'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { href: '/', label: 'สำรวจ', icon: '🏠' },
    { href: '/community', label: 'ชุมชน', icon: '👥' },
    { href: '/chat', label: 'ถาม AI', icon: '🤖' },
    { href: '/emergency', label: 'ฉุกเฉิน', icon: '🚨' },
  ];

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">🐾</div>
          <span className="text-lg font-bold text-gray-900">Pet Health</span>
        </a>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3">
          <a href="/profile" className="user-avatar">
            {user.email?.charAt(0).toUpperCase()}
          </a>
          <button
            onClick={() => { signOut(auth); router.push('/login'); }}
            className="text-sm text-gray-400 hover:text-red-500 transition"
          >
            ออกจากระบบ
          </button>
        </div>

      </div>
    </header>
  );
}