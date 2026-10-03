import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction, Budget, SavingsGoal, UserProfile } from '../types/finance';
import { initialBudgets } from '../data/initialData';

// Firestore collection references
const TRANSACTIONS_COLLECTION = 'transactions';
const BUDGETS_COLLECTION = 'budgets';
const GOALS_COLLECTION = 'goals';
const USERS_COLLECTION = 'users';

export async function fetchTransactionsFromDb(): Promise<Transaction[]> {
  try {
    const querySnapshot = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
    const list: Transaction[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as Transaction;
      if (data && data.id) {
        list.push(data);
      }
    });
    return list;
  } catch (error) {
    console.warn('Error fetching transactions from Firestore:', error);
    return [];
  }
}

export async function saveTransactionToDb(transaction: Transaction): Promise<void> {
  try {
    const docRef = doc(db, TRANSACTIONS_COLLECTION, transaction.id);
    await setDoc(docRef, transaction, { merge: true });
  } catch (error) {
    console.warn('Error saving transaction to Firestore:', error);
  }
}

export async function deleteTransactionFromDb(id: string): Promise<void> {
  try {
    const docRef = doc(db, TRANSACTIONS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Error deleting transaction from Firestore:', error);
  }
}

export async function fetchBudgetsFromDb(): Promise<Budget[]> {
  try {
    const querySnapshot = await getDocs(collection(db, BUDGETS_COLLECTION));
    if (querySnapshot.empty) {
      return initialBudgets;
    }
    const list: Budget[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Budget);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching budgets from Firestore:', error);
    return initialBudgets;
  }
}

export async function saveBudgetToDb(budget: Budget): Promise<void> {
  try {
    const docRef = doc(db, BUDGETS_COLLECTION, budget.id);
    await setDoc(docRef, budget, { merge: true });
  } catch (error) {
    console.warn('Error saving budget to Firestore:', error);
  }
}

export async function fetchGoalsFromDb(): Promise<SavingsGoal[]> {
  try {
    const querySnapshot = await getDocs(collection(db, GOALS_COLLECTION));
    const list: SavingsGoal[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as SavingsGoal);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching goals from Firestore:', error);
    return [];
  }
}

export async function saveGoalToDb(goal: SavingsGoal): Promise<void> {
  try {
    const docRef = doc(db, GOALS_COLLECTION, goal.id);
    await setDoc(docRef, goal, { merge: true });
  } catch (error) {
    console.warn('Error saving goal to Firestore:', error);
  }
}

export async function deleteGoalFromDb(id: string): Promise<void> {
  try {
    const docRef = doc(db, GOALS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Error deleting goal from Firestore:', error);
  }
}

export async function clearAllDataFromFirestore(): Promise<void> {
  try {
    const batch = writeBatch(db);
    const txSnap = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
    txSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    const goalsSnap = await getDocs(collection(db, GOALS_COLLECTION));
    goalsSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
    console.log('Firestore transactions and goals cleared successfully.');
  } catch (error) {
    console.warn('Error clearing Firestore documents:', error);
  }
}
