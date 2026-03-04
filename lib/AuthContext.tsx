'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, AuthError } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Authentication Context Type
 * 
 * @interface AuthContextType
 * @property {User | null} user - Current authenticated user or null
 * @property {boolean} loading - Loading state during auth initialization
 * @property {AuthError | null} error - Authentication error if any
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

/**
 * Default context value
 */
const defaultValue: AuthContextType = {
  user: null,
  loading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * 
 * Wraps the entire application to provide authentication state.
 * Listens to Firebase auth state changes and updates context accordingly.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to wrap
 * @returns {ReactNode} Provider component with auth context
 * 
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        try {
          setUser(currentUser);
          setError(null); // Clear error on successful auth state change
          setLoading(false);
        } catch (err) {
          // Handle any synchronous errors
          console.error('Auth state change error:', err);
          setError(err as AuthError);
          setLoading(false);
        }
      },
      (err) => {
        // Handle async errors from Firebase
        console.error('Firebase auth listener error:', err);
        setError(err as AuthError);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const value: AuthContextType = { user, loading, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use authentication context
 * 
 * Must be used within an AuthProvider component
 * 
 * @returns {AuthContextType} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * const { user, loading, error } = useAuth();
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * if (user) return <Dashboard user={user} />;
 * return <LoginPage />;
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Make sure your component is wrapped with <AuthProvider>.'
    );
  }
  
  return context;
};