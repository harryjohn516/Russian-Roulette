import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export async function logGameResult(gameId: string, winner: string, stake: number) {
  try {
    await addDoc(collection(db, 'games'), {
      gameId,
      winner,
      stake,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error logging game result:', error);
  }
}

export async function getGameHistory(userId: string) {
  try {
    const gamesRef = collection(db, 'games');
    const q = query(gamesRef, where('winner', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching game history:', error);
    return [];
  }
}