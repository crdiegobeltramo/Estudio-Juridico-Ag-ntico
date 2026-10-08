import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { UserProfile, UserRole, Jurisdiction } from '../types/index.ts';
import { 
  auth, 
  syncUserProfile, 
  testFirestoreConnection 
} from '../services/firebase.ts';

interface AuthContextType {
  user: UserProfile;
  activeRole: UserRole;
  activeJurisdiction: Jurisdiction;
  workspaceName: string;
  isAuthenticated: boolean;
  isFirebaseUser: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setUserRole: (role: UserRole) => void;
  setActiveJurisdiction: (j: Jurisdiction) => void;
  setWorkspaceName: (ws: string) => void;
  updateUser: (u: Partial<UserProfile>) => void;
}

const defaultUser: UserProfile = {
  id: 'usr-1',
  name: 'Dra. Luciana Cervelli',
  email: 'lucianacervelli40@gmail.com',
  role: 'abogado',
  institution: 'Estudio Jurídico Cervelli & Asociados',
  matricula: 'T° 124 F° 882 CPACF',
  jurisdiction: 'Nacional / Federal',
  plan: 'abogado',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const activeSession = localStorage.getItem('avd_active_session_user');
    if (activeSession) {
      try {
        const parsed = JSON.parse(activeSession);
        if (parsed.id && parsed.email) return parsed;
      } catch {
        // ignore
      }
    }
    const saved = localStorage.getItem('avd_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id && parsed.email) {
          return parsed;
        }
        return defaultUser;
      } catch {
        return defaultUser;
      }
    }
    return defaultUser;
  });

  const [activeRole, setActiveRoleState] = useState<UserRole>(user.role);
  const [activeJurisdiction, setActiveJurisdiction] = useState<Jurisdiction>(user.jurisdiction as Jurisdiction || 'Nacional / Federal');
  const [workspaceName, setWorkspaceName] = useState<string>(user.institution || 'Estudio Jurídico Virtual Multiagente');
  const [isFirebaseUser, setIsFirebaseUser] = useState<boolean>(() => {
    return !!localStorage.getItem('avd_active_session_user');
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Test connection to Firestore on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        setIsFirebaseUser(true);
        try {
          const profile = await syncUserProfile(fbUser);
          setUser(profile);
          setActiveRoleState(profile.role);
          if (profile.jurisdiction) {
            setActiveJurisdiction(profile.jurisdiction as Jurisdiction);
          }
          if (profile.institution) {
            setWorkspaceName(profile.institution);
          }
        } catch (err) {
          console.error('[AuthContext] Error sincronizando usuario:', err);
        }
      } else {
        const hasLocalSession = !!localStorage.getItem('avd_active_session_user');
        setIsFirebaseUser(hasLocalSession);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('avd_user', JSON.stringify(user));
  }, [user]);

  const setUserRole = (role: UserRole) => {
    setActiveRoleState(role);
    setUser(prev => ({ ...prev, role }));
  };

  const updateUser = (u: Partial<UserProfile>) => {
    setIsFirebaseUser(true);
    setUser(prev => {
      const updated = { ...prev, ...u };
      if (u.role) setActiveRoleState(u.role);
      if (u.jurisdiction) setActiveJurisdiction(u.jurisdiction as Jurisdiction);
      if (u.institution) setWorkspaceName(u.institution);
      localStorage.setItem('avd_active_session_user', JSON.stringify(updated));
      return updated;
    });
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        activeJurisdiction,
        workspaceName,
        isAuthenticated: isFirebaseUser || !!user.email,
        isFirebaseUser,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        setUserRole,
        setActiveJurisdiction,
        setWorkspaceName,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
