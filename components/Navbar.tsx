'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { CSSProperties } from 'react';

/**
 * Navigation Item Type Definition
 * 
 * @interface NavItem
 * @property {string} href - URL path for the navigation link
 * @property {string} label - Display text for the navigation item
 * @property {boolean} [danger] - Optional flag to highlight as dangerous action (red color)
 */
interface NavItem {
  href: string;
  label: string;
  danger?: boolean;
}

/**
 * Style constants to avoid repetition and improve maintainability
 */
const NAVBAR_STYLES = {
  header: {
    borderBottom: '1px solid #f3f4f6',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  } as CSSProperties,
  
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '52px',
    padding: '0 24px',
  } as CSSProperties,
  
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    flexShrink: 0,
  } as CSSProperties,
  
  logoBadge: {
    width: '28px',
    height: '28px',
    background: '#0d9488',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  } as CSSProperties,
  
  logoText: {
    fontWeight: '700',
    fontSize: '15px',
    color: '#111827',
    letterSpacing: '-0.02em',
  } as CSSProperties,
  
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  } as CSSProperties,
  
  navLinksContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  } as CSSProperties,
  
  authButtonsContainer: {
    display: 'flex',
    gap: '6px',
  } as CSSProperties,
};

/**
 * Get navigation link style based on active state and danger flag
 */
const getNavLinkStyle = (active: boolean, danger?: boolean): CSSProperties => ({
  padding: '5px 12px',
  borderRadius: '7px',
  fontSize: '13px',
  fontWeight: active ? '600' : '500',
  textDecoration: 'none',
  color: danger ? '#ef4444' : active ? '#0d9488' : '#6b7280',
  background: active ? (danger ? '#fef2f2' : '#f0fdfa') : 'transparent',
  transition: 'all 0.15s ease',
  cursor: 'pointer',
});

/**
 * Get avatar style
 */
const getAvatarStyle = (): CSSProperties => ({
  width: '30px',
  height: '30px',
  background: '#0d9488',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: '700',
  fontSize: '12px',
  textDecoration: 'none',
});

/**
 * Get logout button style
 */
const getLogoutButtonStyle = (): CSSProperties => ({
  padding: '5px 12px',
  borderRadius: '7px',
  border: '1px solid #e5e7eb',
  background: 'white',
  color: '#9ca3af',
  fontSize: '12px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.15s ease',
});

/**
 * Get auth button style (login/signup)
 */
const getAuthButtonStyle = (primary?: boolean): CSSProperties => ({
  padding: '5px 14px',
  borderRadius: '7px',
  border: primary ? 'none' : '1px solid #e5e7eb',
  background: primary ? '#0d9488' : 'white',
  color: primary ? 'white' : '#374151',
  fontSize: '13px',
  fontWeight: '500',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
});

/**
 * Navbar Component
 * 
 * Main navigation bar component that displays:
 * - App logo and branding
 * - Navigation links (Home, Community, Chat, Emergency)
 * - User authentication state (profile/logout or login/signup buttons)
 * 
 * Hidden on login page to avoid redundancy
 * 
 * @component
 * @returns {ReactNode | null} Navigation bar or null if on login page
 * 
 * @example
 * ```tsx
 * <Navbar />
 * ```
 */
export default function Navbar(): React.ReactNode | null {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Hide navbar on login page
  if (pathname === '/login') return null;

  // Navigation items configuration
  const navItems: NavItem[] = [
    { href: '/', label: 'หน้าหลัก' },
    { href: '/community', label: 'ชุมชน' },
    { href: '/chat', label: 'AI Assistant' },
    { href: '/emergency', label: 'ฉุกเฉิน', danger: true },
    { href: '/about', label: 'เกี่ยวกับ' },
  ];

  /**
   * Handle user logout
   * Signs out from Firebase and redirects to home page
   */
  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Logout failed:', authError.message);
      // Optionally show error toast/notification to user
    }
  };

  return (
    <header style={NAVBAR_STYLES.header}>
      <div style={NAVBAR_STYLES.container}>
        {/* Logo Section */}
        <a href="/" style={NAVBAR_STYLES.logo} aria-label="PetHealth home">
          <div style={NAVBAR_STYLES.logoBadge}>🐾</div>
          <span style={NAVBAR_STYLES.logoText}>PetHealth</span>
        </a>

        {/* Navigation Links */}
        <nav style={NAVBAR_STYLES.nav} aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                style={getNavLinkStyle(isActive, item.danger)}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.danger && '🚨 '}
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right Section - Auth Controls */}
        <div style={NAVBAR_STYLES.navLinksContainer}>
          {user ? (
            <>
              {/* User Avatar - Link to Profile */}
              <a
                href="/profile"
                style={getAvatarStyle()}
                aria-label={`Go to profile for ${user.email}`}
                title={user.email || 'User profile'}
              >
                {user.email?.charAt(0).toUpperCase()}
              </a>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                style={getLogoutButtonStyle()}
                aria-label="Sign out"
                title="Sign out from PetHealth"
              >
                ออก
              </button>
            </>
          ) : (
            <div style={NAVBAR_STYLES.authButtonsContainer}>
              {/* Login Button */}
              <a
                href="/login"
                style={getAuthButtonStyle()}
                aria-label="Sign in to PetHealth"
              >
                เข้าสู่ระบบ
              </a>

              {/* Signup Button */}
              <a
                href="/login"
                style={getAuthButtonStyle(true)}
                aria-label="Create new PetHealth account"
              >
                สมัครสมาชิก
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}