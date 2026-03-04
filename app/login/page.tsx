'use client';

import { useState, useEffect, CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError,
} from 'firebase/auth';
import { useAuth } from '@/lib/AuthContext';
import { auth } from '@/lib/firebase';

/**
 * Authentication mode type
 */
type AuthMode = 'login' | 'signup';

/**
 * Firebase auth error messages mapping
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว',
  'auth/weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
  'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
  'auth/user-not-found': 'ไม่พบบัญชีนี้ในระบบ',
  'auth/too-many-requests': 'ลองเข้าสู่ระบบมากเกินไป กรุณารอสักครู่',
  'auth/operation-not-allowed': 'วิธีการเข้าสู่ระบบนี้ยังไม่เปิดใช้',
};

/**
 * Style constants for login page
 */
const LOGIN_STYLES = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 50%, #f0fdf4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  } as CSSProperties,

  wrapper: {
    width: '100%',
    maxWidth: '420px',
  } as CSSProperties,

  logoSection: {
    textAlign: 'center',
    marginBottom: '40px',
  } as CSSProperties,

  logoBadge: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #0d9488, #0f766e)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    margin: '0 auto 16px',
    boxShadow: '0 8px 24px rgba(13, 148, 136, 0.3)',
  } as CSSProperties,

  logoTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.03em',
    margin: '0 0 6px',
  } as CSSProperties,

  logoSubtitle: {
    color: '#6b7280',
    fontSize: '15px',
    margin: 0,
  } as CSSProperties,

  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '36px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid rgba(255,255,255,0.8)',
  } as CSSProperties,

  tabContainer: {
    display: 'flex',
    background: '#f3f4f6',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '28px',
  } as CSSProperties,

  fieldGroup: {
    marginBottom: '16px',
  } as CSSProperties,

  passwordFieldGroup: {
    marginBottom: '24px',
  } as CSSProperties,

  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  } as CSSProperties,

  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  } as CSSProperties,

  inputFocus: {
    borderColor: '#0d9488',
  } as CSSProperties,

  inputBlur: {
    borderColor: '#e5e7eb',
  } as CSSProperties,

  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#dc2626',
    fontSize: '13px',
    marginBottom: '16px',
  } as CSSProperties,

  submitButton: {
    width: '100%',
    padding: '12px',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  } as CSSProperties,

  footer: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '13px',
    marginTop: '24px',
  } as CSSProperties,
};

/**
 * Email validation using simple regex
 * @param email - Email address to validate
 * @returns boolean - True if email is valid
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Login Page Component
 *
 * Provides authentication interface for login and signup.
 * Allows users to:
 * - Sign in with existing account
 * - Create new account
 * - Handle Firebase authentication errors
 *
 * @component
 * @returns {React.ReactNode} Login page UI
 *
 * @example
 * ```tsx
 * <LoginPage />
 * ```
 */
export default function LoginPage(): React.ReactNode {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  /**
   * Validate form inputs
   * @returns boolean - True if validation passes
   */
  const validateForm = (): boolean => {
    // Check empty fields
    if (!email.trim() || !password.trim()) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return false;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }

    // Validate password length
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }

    return true;
  };

  /**
   * Handle login or signup submission
   */
  const handleSubmit = async (): Promise<void> => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      // Firebase will handle redirect via useAuth hook
      router.push('/');
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage =
        AUTH_ERROR_MESSAGES[authError.code] || 'เกิดข้อผิดพลาด กรุณาลองใหม่';

      setError(errorMessage);
      console.error('Auth error:', authError.code, authError.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Switch between login and signup modes
   */
  const handleModeSwitch = (newMode: AuthMode): void => {
    setMode(newMode);
    setError(''); // Clear error when switching modes
    setEmail('');
    setPassword('');
  };

  /**
   * Handle Enter key press in input fields
   */
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div style={LOGIN_STYLES.container}>
        <div style={LOGIN_STYLES.wrapper}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: '#9ca3af' }}>กำลังโหลด...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={LOGIN_STYLES.container}>
      <div style={LOGIN_STYLES.wrapper}>
        {/* Logo Section */}
        <div style={LOGIN_STYLES.logoSection}>
          <div style={LOGIN_STYLES.logoBadge}>🐾</div>
          <h1 style={LOGIN_STYLES.logoTitle}>Pet Health</h1>
          <p style={LOGIN_STYLES.logoSubtitle}>ผู้ช่วยดูแลสัตว์เลี้ยงอัจฉริยะ</p>
        </div>

        {/* Auth Card */}
        <div style={LOGIN_STYLES.card}>
          {/* Mode Tabs */}
          <div style={LOGIN_STYLES.tabContainer}>
            {(['login', 'signup'] as const).map((tabMode) => (
              <button
                key={tabMode}
                onClick={() => handleModeSwitch(tabMode)}
                aria-pressed={mode === tabMode}
                aria-label={tabMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  background: mode === tabMode ? 'white' : 'transparent',
                  color: mode === tabMode ? '#111827' : '#6b7280',
                  boxShadow:
                    mode === tabMode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                } as CSSProperties}
              >
                {tabMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>
            ))}
          </div>

          {/* Email Input */}
          <div style={LOGIN_STYLES.fieldGroup}>
            <label htmlFor="email" style={LOGIN_STYLES.label}>
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#0d9488';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
              }}
              placeholder="your@email.com"
              disabled={loading}
              aria-label="Email address"
              style={LOGIN_STYLES.input}
            />
          </div>

          {/* Password Input */}
          <div style={LOGIN_STYLES.passwordFieldGroup}>
            <label htmlFor="password" style={LOGIN_STYLES.label}>
              รหัสผ่าน
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#0d9488';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
              }}
              placeholder="••••••••"
              disabled={loading}
              aria-label="Password"
              style={LOGIN_STYLES.input}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={LOGIN_STYLES.errorBox} role="alert">
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            aria-label={
              mode === 'login' ? 'Sign in to PetHealth' : 'Create PetHealth account'
            }
            style={{
              ...LOGIN_STYLES.submitButton,
              background: loading
                ? '#9ca3af'
                : 'linear-gradient(135deg, #0d9488, #0f766e)',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading
                ? 'none'
                : '0 4px 12px rgba(13, 148, 136, 0.3)',
            } as CSSProperties}
          >
            {loading
              ? 'กำลังดำเนินการ...'
              : mode === 'login'
                ? 'เข้าสู่ระบบ'
                : 'สมัครสมาชิก'}
          </button>
        </div>

        {/* Security Footer */}
        <p style={LOGIN_STYLES.footer}>
          🔒 ข้อมูลของคุณปลอดภัยและเป็นความลับ
        </p>
      </div>
    </div>
  );
}