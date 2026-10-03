import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction, Budget, SavingsGoal } from '../types/finance';
import { initialBudgets } from '../data/initialData';

// Generate or retrieve unique device / workspace ID
export function getOrCreateDeviceId(): string {
  const STORAGE_KEY = 'finsathi_device_id';
  let deviceId = localStorage.getItem(STORAGE_KEY);
  if (!deviceId || deviceId.trim().length === 0) {
    deviceId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Real-time listener for Transactions isolated per device
 */
export function subscribeTransactions(
  deviceId: string,
  onData: (transactions: Transaction[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  const colRef = collection(db, 'devices', deviceId, 'transactions');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Transaction;
        if (data && data.id) {
          list.push(data);
        }
      });
      // Sort by date descending
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(list);
    },
    (error) => {
      console.warn(`[Device ${deviceId}] Transactions listener notice:`, error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for Budgets isolated per device
 */
export function subscribeBudgets(
  deviceId: string,
  onData: (budgets: Budget[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  const colRef = collection(db, 'devices', deviceId, 'budgets');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Budget[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Budget;
        if (data && data.category) {
          list.push(data);
        }
      });
      onData(list.length > 0 ? list : initialBudgets);
    },
    (error) => {
      console.warn(`[Device ${deviceId}] Budgets listener notice:`, error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for Savings Goals isolated per device
 */
export function subscribeGoals(
  deviceId: string,
  onData: (goals: SavingsGoal[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  const colRef = collection(db, 'devices', deviceId, 'goals');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: SavingsGoal[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as SavingsGoal;
        if (data && data.id) {
          list.push(data);
        }
      });
      onData(list);
    },
    (error) => {
      console.warn(`[Device ${deviceId}] Goals listener notice:`, error);
      if (onError) onError(error);
    }
  );
}

export async function fetchTransactionsFromDb(deviceId: string): Promise<Transaction[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'devices', deviceId, 'transactions'));
    const list: Transaction[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Transaction;
      if (data && data.id) {
        list.push(data);
      }
    });
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  } catch (error) {
    console.warn(`[Device ${deviceId}] fetch transactions notice:`, error);
    return [];
  }
}

export async function saveTransactionToDb(deviceId: string, transaction: Transaction): Promise<void> {
  try {
    const docRef = doc(db, 'devices', deviceId, 'transactions', transaction.id);
    await setDoc(docRef, { ...transaction, deviceId }, { merge: true });
  } catch (error) {
    console.error(`[Device ${deviceId}] save transaction error:`, error);
    throw error;
  }
}

export async function deleteTransactionFromDb(deviceId: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, 'devices', deviceId, 'transactions', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`[Device ${deviceId}] delete transaction error:`, error);
    throw error;
  }
}

export async function fetchBudgetsFromDb(deviceId: string): Promise<Budget[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'devices', deviceId, 'budgets'));
    if (querySnapshot.empty) {
      return initialBudgets;
    }
    const list: Budget[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Budget);
    });
    return list;
  } catch (error) {
    console.warn(`[Device ${deviceId}] fetch budgets notice:`, error);
    return initialBudgets;
  }
}

export async function saveBudgetToDb(deviceId: string, budget: Budget): Promise<void> {
  try {
    const docRef = doc(db, 'devices', deviceId, 'budgets', budget.id);
    await setDoc(docRef, { ...budget, deviceId }, { merge: true });
  } catch (error) {
    console.error(`[Device ${deviceId}] save budget error:`, error);
    throw error;
  }
}

export async function fetchGoalsFromDb(deviceId: string): Promise<SavingsGoal[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'devices', deviceId, 'goals'));
    const list: SavingsGoal[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as SavingsGoal);
    });
    return list;
  } catch (error) {
    console.warn(`[Device ${deviceId}] fetch goals notice:`, error);
    return [];
  }
}

export async function saveGoalToDb(deviceId: string, goal: SavingsGoal): Promise<void> {
  try {
    const docRef = doc(db, 'devices', deviceId, 'goals', goal.id);
    await setDoc(docRef, { ...goal, deviceId }, { merge: true });
  } catch (error) {
    console.error(`[Device ${deviceId}] save goal error:`, error);
    throw error;
  }
}

export async function deleteGoalFromDb(deviceId: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, 'devices', deviceId, 'goals', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`[Device ${deviceId}] delete goal error:`, error);
    throw error;
  }
}

/**
 * Clear only THIS device's data from Firestore
 */
export async function clearDeviceDataFromFirestore(deviceId: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    const txSnap = await getDocs(collection(db, 'devices', deviceId, 'transactions'));
    txSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    const goalsSnap = await getDocs(collection(db, 'devices', deviceId, 'goals'));
    goalsSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
    console.log(`[Device ${deviceId}] Data successfully wiped from Firestore.`);
  } catch (error) {
    console.warn(`[Device ${deviceId}] Error clearing device documents:`, error);
  }
}
