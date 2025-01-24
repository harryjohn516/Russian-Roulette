import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { encryptPrivateKey } from './encryption';
import { randomBytes } from 'crypto';

export async function setEscrowPrivateKey(adminId: string, privateKey: string) {
  try {
    // Generate a random encryption key
    const encryptionKey = randomBytes(32).toString('hex');
    
    // Encrypt the private key
    const encryptedPrivateKey = encryptPrivateKey(privateKey, encryptionKey);

    // Store the encrypted private key and encryption key
    await setDoc(doc(db, 'admins', adminId), {
      encryptedPrivateKey,
      encryptionKey
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error storing escrow private key:', error);
    return false;
  }
}

// ... rest of the file remains the same