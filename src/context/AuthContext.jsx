import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student DB profile from 'profiles' table
  const fetchStudentProfile = async (userId) => {
    try {
      if (!isSupabaseConfigured || !userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Notice fetching student profile:', error.message);
      }

      return data || null;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      return null;
    }
  };

  // Helper to load or persist student profile for an authenticated user
  const loadProfileForUser = async (authUser, fallbackMeta = null) => {
    if (!isSupabaseConfigured || !authUser?.id) return null;

    // 1. Try to fetch existing DB profile
    const existing = await fetchStudentProfile(authUser.id);
    if (existing) {
      return existing;
    }

    // 2. If DB row doesn't exist, construct from user_metadata or fallbackMeta
    const meta = authUser.user_metadata || {};
    const profileToSave = {
      id: authUser.id,
      full_name: fallbackMeta?.full_name || meta.full_name || 'Student',
      roll_number: fallbackMeta?.roll_number || meta.roll_number || '',
      branch: fallbackMeta?.branch || meta.branch || 'Computer Engineering (CE)',
      batch: fallbackMeta?.batch || meta.batch || 'CE1',
    };

    // 3. Upsert to DB table
    try {
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert(profileToSave, { onConflict: 'id' });

      if (upsertErr) {
        console.warn('Notice saving profile to DB:', upsertErr.message);
      }
    } catch (e) {
      console.error('Error saving profile to DB:', e);
    }

    return profileToSave;
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          if (mounted) setLoading(false);
          return;
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession && mounted) {
          setSession(currentSession);
          setUser(currentSession.user);
          const studentProfile = await loadProfileForUser(currentSession.user);
          if (mounted) {
            setProfile(studentProfile);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    let subscription = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          const studentProfile = await loadProfileForUser(currentSession.user);
          if (mounted) {
            setProfile(studentProfile);
          }
        } else {
          if (mounted) setProfile(null);
        }
        if (mounted) setLoading(false);
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Sign Up Student
  const signUp = async ({ email, password, fullName, rollNumber, branch, batch }) => {
    setError(null);
    setLoading(true);

    const normalizedEmail = (email || '').trim().toLowerCase();

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase client is not configured. Please check your .env file.');
      }

      // 1. Execute Supabase signup with user metadata
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            roll_number: rollNumber,
            branch,
            batch,
          },
        },
      });

      if (signUpErr) throw signUpErr;

      let currentSession = data?.session;
      let currentUser = data?.user;

      // 2. If Supabase returns user without session (e.g. unconfirmed email setting), perform auto-login
      if (currentUser && !currentSession) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (!signInErr && signInData?.session) {
          currentSession = signInData.session;
          currentUser = signInData.user;
        }
      }

      // 3. If valid authenticated session exists, update state & persist DB profile
      if (currentUser && currentSession) {
        setSession(currentSession);
        setUser(currentUser);

        const profileData = await loadProfileForUser(currentUser, {
          full_name: fullName,
          roll_number: rollNumber,
          branch,
          batch,
        });

        setProfile(profileData);
        setLoading(false);
        return { success: true, user: currentUser, session: currentSession, requiresConfirmation: false };
      }

      // 4. If account created but no session provided (email confirmation required by Supabase Auth)
      if (currentUser && !currentSession) {
        setLoading(false);
        return {
          success: true,
          user: currentUser,
          session: null,
          requiresConfirmation: true,
          message: 'Account created! Please check your email to confirm your account before logging in.',
        };
      }

      setLoading(false);
      return { success: true, user: currentUser, session: currentSession, requiresConfirmation: false };
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to sign up');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Sign In Student
  const signIn = async ({ email, password }) => {
    setError(null);
    setLoading(true);

    const normalizedEmail = (email || '').trim().toLowerCase();

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase client is not configured.');
      }

      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInErr) throw signInErr;

      if (data?.user) {
        setSession(data.session);
        setUser(data.user);

        const studentProfile = await loadProfileForUser(data.user);
        setProfile(studentProfile);
      }

      setLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Sign Out
  const signOut = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isConfigured: isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
