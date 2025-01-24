import { create } from 'zustand';
import { auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAdminStatus: (user: User) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const isAdmin = await getDoc(doc(db, 'admins', userCredential.user.uid))
        .then(doc => doc.exists());
      set({ user: userCredential.user, isAdmin, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, isAdmin: false });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  checkAdminStatus: async (user: User) => {
    const isAdmin = await getDoc(doc(db, 'admins', user.uid))
      .then(doc => doc.exists());
    set({ isAdmin });
    return isAdmin;
  }
}));