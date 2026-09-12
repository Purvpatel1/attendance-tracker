import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

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

    // Check URL hash for password recovery token
    if (typeof window !== 'undefined' && window.location.hash) {
      if (window.location.hash.includes('type=recovery') || window.location.hash.includes('type=magiclink')) {
        setIsPasswordRecovery(true);
      }
    }

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

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }

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

    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail || !password || !fullName) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

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

      if (signUpErr) {
        console.error('Raw Supabase SignUp Error:', signUpErr);
        const msg = signUpErr.message?.toLowerCase() || '';
        if (msg.includes('already registered') || msg.includes('user already exists')) {
          return { success: false, error: 'An account with this email already exists.' };
        }
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
          return { success: false, error: 'Unable to connect. Please check your internet connection.' };
        }
        return { success: false, error: signUpErr.message || 'Registration failed.' };
      }

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
        return { success: true, user: currentUser, session: currentSession, requiresConfirmation: false };
      }

      // 4. If account created but no session provided
      if (currentUser && !currentSession) {
        return {
          success: true,
          user: currentUser,
          session: null,
          requiresConfirmation: true,
          message: 'Account created! Please check your email to confirm your account before logging in.',
        };
      }

      return { success: true, user: currentUser, session: currentSession, requiresConfirmation: false };
    } catch (err) {
      console.error('Sign up unexpected error:', err);
      setError(err.message || 'Failed to sign up');
      return { success: false, error: 'Something went wrong while creating your account. Please try again.' };
    }
  };

  // Sign In Student
  const signIn = async ({ email, password }) => {
    setError(null);

    const normalizedEmail = (email || '').trim().toLowerCase();

    // 1. Client Validation: Empty Email or Password
    if (!normalizedEmail || !password) {
      return { success: false, error: 'Please enter your student ID/email and password.' };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return { success: false, error: 'Please enter a valid student email address.' };
    }

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase client is not configured.');
      }

      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInErr) {
        console.error('Raw Supabase SignIn Error:', signInErr);
        const msg = (signInErr.message || '').toLowerCase();

        if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('grant_type') || signInErr.status === 400) {
          return { success: false, error: 'Invalid student ID or password.' };
        }

        if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
          return { success: false, error: 'Unable to connect. Please check your internet connection.' };
        }

        return { success: false, error: 'Invalid student ID or password.' };
      }

      if (data?.user) {
        setSession(data.session);
        setUser(data.user);

        const studentProfile = await loadProfileForUser(data.user);
        setProfile(studentProfile);
      }

      return { success: true, user: data.user };
    } catch (err) {
      console.error('Sign in unexpected error:', err);
      setError(err.message || 'Failed to sign in');
      return { success: false, error: 'Something went wrong while signing in. Please try again.' };
    }
  };

  // Request Password Reset Email (Privacy-safe)
  const requestPasswordReset = async (email) => {
    setError(null);

    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return { success: false, error: 'Please enter your registered student email.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured.');
      }

      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}` : undefined;

      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: redirectUrl,
      });

      if (resetErr) {
        console.error('Raw Supabase Reset Password Error:', resetErr);
        const msg = (resetErr.message || '').toLowerCase();
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
          return { success: false, error: 'Unable to connect. Please check your internet connection.' };
        }
      }

      // Privacy-safe message: Always return success message to prevent email enumeration
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      };
    } catch (err) {
      console.error('Unexpected password reset error:', err);
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      };
    }
  };

  // Update Password (Password Reset Flow completion)
  const updatePassword = async (newPassword) => {
    setError(null);

    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured.');
      }

      const { data, error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        console.error('Raw Supabase Password Update Error:', updateErr);
        const msg = (updateErr.message || '').toLowerCase();

        if (msg.includes('session') || msg.includes('jwt') || msg.includes('expired') || msg.includes('invalid')) {
          return { success: false, error: 'The password reset link is invalid or has expired. Please request a new one.' };
        }

        if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
          return { success: false, error: 'Unable to connect. Please check your internet connection.' };
        }

        return { success: false, error: updateErr.message || 'Could not update password. Please try again.' };
      }

      setIsPasswordRecovery(false);
      if (typeof window !== 'undefined' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      return { success: true, message: 'Password updated successfully! You can now log in with your new password.' };
    } catch (err) {
      console.error('Unexpected password update error:', err);
      return { success: false, error: 'Something went wrong while updating your password. Please try again.' };
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
      setIsPasswordRecovery(false);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearRecoveryMode = () => {
    setIsPasswordRecovery(false);
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    isPasswordRecovery,
    signUp,
    signIn,
    signOut,
    requestPasswordReset,
    updatePassword,
    clearRecoveryMode,
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

