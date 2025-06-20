import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Types for auth state
interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignout: boolean;
  error: string | null;
}

// Types for auth context
interface AuthContextType extends AuthState {
  signIn: (data: { email: string; password: string }) => Promise<void>;
  signUp: (data: { email: string; password: string; name?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to transform Supabase user to our User type
const transformUser = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || 'User'
});

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isSignout: false,
    error: null
  });

  // Set up auth state listener
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        user: session?.user ? transformUser(session.user) : null,
        isLoading: false
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setState(prev => ({
          ...prev,
          user: session?.user ? transformUser(session.user) : null,
          isLoading: false,
          isSignout: event === 'SIGNED_OUT'
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Define the auth actions
  const authContext: AuthContextType = {
    ...state,
    signIn: async (data) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          throw error;
        }

        // User state will be updated by the auth state listener
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          isSignout: false
        }));
      } catch (error: any) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: error.message || 'An error occurred during sign in'
        }));
        throw error;
      }
    },
    
    signUp: async (data) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name || 'User',
              full_name: data.name || 'User'
            }
          }
        });

        if (error) {
          throw error;
        }

        // Check if email confirmation is required
        if (authData.user && !authData.session) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: 'Please check your email to confirm your account before signing in.'
          }));
          return;
        }

        // User state will be updated by the auth state listener
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          isSignout: false
        }));
      } catch (error: any) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: error.message || 'An error occurred during sign up'
        }));
        throw error;
      }
    },
    
    signOut: async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          throw error;
        }

        // User state will be updated by the auth state listener
        setState(prev => ({
          ...prev,
          isLoading: false,
          isSignout: true,
          error: null
        }));
      } catch (error: any) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: error.message || 'An error occurred during sign out'
        }));
        throw error;
      }
    },
    
    resetPassword: async (email) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          throw error;
        }

        setState(prev => ({ ...prev, isLoading: false }));
      } catch (error: any) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: error.message || 'An error occurred while sending reset email'
        }));
        throw error;
      }
    },
    
    clearError: () => {
      setState(prev => ({ ...prev, error: null }));
    }
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}