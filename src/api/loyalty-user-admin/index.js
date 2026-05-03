import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  runTransaction,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';

const PROFILES_COLLECTION = 'profiles';
const TRANSACTIONS_COLLECTION = 'loyalty_transactions';
const ADMIN_MANUAL_COLLECTION = 'admin_manual_transactions';


class LoyaltyUserAdminApi {
  searchUsers = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    const q = searchQuery.trim();
    const results = new Map();

    try {
      const directSnap = await getDoc(doc(firestore, PROFILES_COLLECTION, q));
      if (directSnap.exists()) {
        results.set(directSnap.id, { id: directSnap.id, ...directSnap.data() });
      }
    } catch {
      // not a valid doc id — ignore
    }

    const profilesRef = collection(firestore, PROFILES_COLLECTION);

    const rangeEnd = (s) => s + String.fromCharCode(0xf8ff);

    try {
      const emailLower = q.toLowerCase();
      const emailQ = query(
        profilesRef,
        where('email', '>=', emailLower),
        where('email', '<=', rangeEnd(emailLower)),
        limit(10)
      );
      const emailSnap = await getDocs(emailQ);
      emailSnap.forEach((d) => results.set(d.id, { id: d.id, ...d.data() }));
    } catch {
      // single-field index not ready, skip
    }

    if (results.size < 10) {
      try {
        const nameQ = query(
          profilesRef,
          where('businessName', '>=', q),
          where('businessName', '<=', rangeEnd(q)),
          limit(10 - results.size)
        );
        const nameSnap = await getDocs(nameQ);
        nameSnap.forEach((d) => results.set(d.id, { id: d.id, ...d.data() }));
      } catch {
        // single-field index not ready, skip
      }
    }

    return Array.from(results.values()).slice(0, 10);
  };

  getUserProfile = async (userId) => {
    const snap = await getDoc(doc(firestore, PROFILES_COLLECTION, userId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  };

  getTransactions = async (userId, { pageSize = 25, lastDocSnap = null } = {}) => {
    const transRef = collection(firestore, TRANSACTIONS_COLLECTION);
    let q = query(
      transRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDocSnap) {
      q = query(
        transRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDocSnap),
        limit(pageSize)
      );
    }

    const snap = await getDocs(q);
    return {
      transactions: snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || null,
      })),
      lastDocSnap: snap.docs[snap.docs.length - 1] || null,
    };
  };

  getAllTransactionsForUser = async (userId) => {
    const transRef = collection(firestore, TRANSACTIONS_COLLECTION);
    const q = query(
      transRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() || null,
    }));
  };

  manualAdjustment = async ({ userId, userEmail, amount, reason, notifyUser, adminId, adminEmail }) => {
    const profileRef = doc(firestore, PROFILES_COLLECTION, userId);
    const txRef = doc(collection(firestore, TRANSACTIONS_COLLECTION));
    const manualRef = doc(collection(firestore, ADMIN_MANUAL_COLLECTION));

    await runTransaction(firestore, async (transaction) => {
      const profileSnap = await transaction.get(profileRef);
      if (!profileSnap.exists()) throw new Error('User not found');

      const data = profileSnap.data();
      const currentBalance = data.loyaltyBalance || 0;
      const newBalance = currentBalance + amount;

      if (newBalance < 0) throw new Error('Insufficient balance: cannot go below zero');

      const isPositive = amount > 0;
      const earned = data.loyaltyTotalEarned || 0;
      const spent = data.loyaltyTotalSpent || 0;

      transaction.set(txRef, {
        userId,
        userRole: data.role || null,
        actionType: 'ADMIN_MANUAL_ADJUSTMENT',
        amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceId: null,
        referenceType: 'admin',
        metadata: { reason, adminId, adminEmail, notifyUser: notifyUser || false },
        idempotencyKey: `${userId}:ADMIN_MANUAL_ADJUSTMENT:${Date.now()}`,
        createdAt: serverTimestamp(),
        processed: true,
      });

      transaction.set(manualRef, {
        userId,
        userEmail: userEmail || '',
        amount,
        reason,
        adminId,
        adminEmail,
        notifyUser: notifyUser || false,
        createdAt: serverTimestamp(),
        transactionId: txRef.id,
      });

      transaction.update(profileRef, {
        loyaltyBalance: newBalance,
        loyaltyLastUpdated: serverTimestamp(),
        loyaltyTotalEarned: isPositive ? earned + amount : earned,
        loyaltyTotalSpent: !isPositive ? spent + Math.abs(amount) : spent,
      });
    });

    return txRef.id;
  };

  toggleBalanceFrozen = async (userId, frozen) => {
    const profileRef = doc(firestore, PROFILES_COLLECTION, userId);
    await updateDoc(profileRef, { loyaltyBalanceFrozen: frozen });
  };

  checkConsistency = async (userId) => {
    const profile = await this.getUserProfile(userId);
    if (!profile) throw new Error('User not found');

    const storedBalance = profile.loyaltyBalance || 0;

    const transRef = collection(firestore, TRANSACTIONS_COLLECTION);
    const q = query(transRef, where('userId', '==', userId));
    const snap = await getDocs(q);

    let computedBalance = 0;
    snap.forEach((d) => {
      computedBalance += d.data().amount || 0;
    });

    const discrepancy = storedBalance - computedBalance;

    return {
      storedBalance,
      computedBalance,
      discrepancy,
      isConsistent: Math.abs(discrepancy) < 0.001,
    };
  };

  fixBalance = async (userId, adminEmail, { storedBalance, computedBalance, discrepancy }) => {
    const profileRef = doc(firestore, PROFILES_COLLECTION, userId);
    const txRef = doc(collection(firestore, TRANSACTIONS_COLLECTION));

    await runTransaction(firestore, async (transaction) => {
      transaction.set(txRef, {
        userId,
        actionType: 'SYSTEM_BALANCE_CORRECTION',
        amount: computedBalance - storedBalance,
        balanceBefore: storedBalance,
        balanceAfter: computedBalance,
        referenceId: null,
        referenceType: 'admin',
        metadata: {
          oldBalance: storedBalance,
          newBalance: computedBalance,
          discrepancy,
          triggeredBy: adminEmail,
        },
        idempotencyKey: `${userId}:SYSTEM_BALANCE_CORRECTION:${Date.now()}`,
        createdAt: serverTimestamp(),
        processed: true,
      });

      transaction.update(profileRef, {
        loyaltyBalance: computedBalance,
        loyaltyLastUpdated: serverTimestamp(),
      });
    });
  };
}

export const loyaltyUserAdminApi = new LoyaltyUserAdminApi();
