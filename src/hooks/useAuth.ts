import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { auth, db } from '../lib/supabase';

interface AuthUser extends User {
  role?: string;
  name?: string;
  poc?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { user } = await auth.getCurrentUser();
      if (user) {
        // Fetch user profile from public.users table
        const { data: profile } = await db.getUserProfile(user.id);
        if (profile) {
          setUser({ ...user, ...profile } as AuthUser);
        } else {
          setUser(user as AuthUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch user profile from public.users table
          const { data: profile } = await db.getUserProfile(session.user.id);
          if (profile) {
            setUser({ ...session.user, ...profile } as AuthUser);
          } else {
            setUser(session.user as AuthUser);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await auth.signIn(email, password);
    if (data.user && !error) {
      // Fetch user profile from public.users table
      const { data: profile } = await db.getUserProfile(data.user.id);
      if (profile) {
        setUser({ ...data.user, ...profile } as AuthUser);
      }
    }
    setLoading(false);
    return { data, error };
  };

  const signUp = async (email: string, password: string, userData: {
    username: string;
    name: string;
    role?: 'admin' | 'employee';
    poc?: string;
  }) => {
    setLoading(true);
    
    // First, create the auth user
    const { data, error } = await auth.signUp(email, password, userData);
    
    if (data.user && !error) {
      // Then, insert the user profile into public.users table
      const { error: profileError } = await db.insertUser({
        id: data.user.id,
        email: email,
        username: userData.username,
        name: userData.name,
        role: userData.role || 'employee',
        poc: userData.poc || userData.name,
      });
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        setLoading(false);
        return { data, error: profileError };
      }
      
      // Fetch the complete user profile
      const { data: profile } = await db.getUserProfile(data.user.id);
      if (profile) {
        setUser({ ...data.user, ...profile } as AuthUser);
      }
    }
    
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await auth.signOut();
    setUser(null);
    setLoading(false);
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };
};