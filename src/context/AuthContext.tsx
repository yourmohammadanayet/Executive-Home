import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserAccessRecord, UserRole } from '../types';
import { validateUserAccess, getUserAccessRecords } from '../lib/accessControlService';

interface AuthContextType {
  user: any | null;
  userAccess: UserAccessRecord | null;
  role: UserRole;
  isAdmin: boolean;
  isMember: boolean;
  loading: boolean;
  accessDeniedMessage: string | null;
  signOut: () => Promise<void>;
  refreshUserAccess: () => void;
  switchRoleMode: (targetRole: UserRole) => void;
  loginLocalUser: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userAccess: null,
  role: 'admin',
  isAdmin: true,
  isMember: false,
  loading: true,
  accessDeniedMessage: null,
  signOut: async () => {},
  refreshUserAccess: () => {},
  switchRoleMode: () => {},
  loginLocalUser: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userAccess, setUserAccess] = useState<UserAccessRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  const [activeRoleOverride, setActiveRoleOverride] = useState<UserRole | null>(null);

  const fetchSessionAndAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      let email = session?.user?.email;

      // Fallback to local user session if Supabase auth session is not active
      if (!email) {
        const localEmail = localStorage.getItem('eh_active_local_user_email');
        if (localEmail) {
          email = localEmail;
        } else {
          // Default initial session for admin
          email = 'yourmohammadanayet@gmail.com';
          localStorage.setItem('eh_active_local_user_email', email);
        }
      }

      const validation = validateUserAccess(email);
      if (!validation.canLogin) {
        setAccessDeniedMessage(validation.message);
        localStorage.removeItem('eh_active_local_user_email');
        await supabase.auth.signOut();
        setUser(null);
        setUserAccess(null);
      } else {
        setAccessDeniedMessage(null);
        setUser({ id: validation.user?.id || 'local-user', email });
        setUserAccess(validation.user);
      }
    } catch (err) {
      console.error('Error in AuthProvider:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchSessionAndAccess();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Periodic session validity check (revokes active session if admin disabled or suspended account mid-session)
  useEffect(() => {
    if (!userAccess) return;
    const interval = setInterval(() => {
      const records = getUserAccessRecords();
      const current = records.find(r => r.id === userAccess.id || r.email.toLowerCase() === userAccess.email.toLowerCase());
      if (current) {
        const validation = validateUserAccess(current.email);
        if (!validation.canLogin) {
          setAccessDeniedMessage(validation.message);
          localStorage.removeItem('eh_active_local_user_email');
          supabase.auth.signOut();
          setUser(null);
          setUserAccess(null);
        } else {
          setUserAccess(current);
        }
      }
    }, 5000); // Check every 5s

    return () => clearInterval(interval);
  }, [userAccess]);

  const loginLocalUser = (email: string): boolean => {
    const validation = validateUserAccess(email);
    if (!validation.canLogin) {
      setAccessDeniedMessage(validation.message);
      return false;
    }
    localStorage.setItem('eh_active_local_user_email', email);
    setUser({ id: validation.user?.id || 'local-user', email });
    setUserAccess(validation.user);
    setAccessDeniedMessage(null);
    return true;
  };

  const signOut = async () => {
    localStorage.removeItem('eh_active_local_user_email');
    await supabase.auth.signOut();
    setUser(null);
    setUserAccess(null);
    setAccessDeniedMessage(null);
  };

  const refreshUserAccess = () => {
    if (userAccess) {
      const records = getUserAccessRecords();
      const current = records.find(r => r.id === userAccess.id || r.email.toLowerCase() === userAccess.email.toLowerCase());
      if (current) {
        setUserAccess(current);
      }
    }
  };

  const switchRoleMode = (targetRole: UserRole) => {
    setActiveRoleOverride(targetRole);
  };

  const currentRole: UserRole = activeRoleOverride || userAccess?.role || 'admin';
  const isAdmin = currentRole === 'admin' || currentRole === 'super_admin';
  const isMember = currentRole === 'member';

  return (
    <AuthContext.Provider
      value={{
        user,
        userAccess,
        role: currentRole,
        isAdmin,
        isMember,
        loading,
        accessDeniedMessage,
        signOut,
        refreshUserAccess,
        switchRoleMode,
        loginLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
