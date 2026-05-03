import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  runTransaction,
  serverTimestamp,
  query,
  orderBy,
  increment,
} from 'firebase/firestore';
import { firestore } from 'src/libs/firebase';

const CONFIG_COLLECTION = 'paid_features_config';
const PURCHASES_COLLECTION = 'user_paid_features';
const TRANSACTIONS_COLLECTION = 'loyalty_transactions';

export const DEFAULT_SHOP_ITEMS = [
  {
    featureKey: 'TSHIRT',
    displayName: 'T-Shirt',
    description: 'Shipping within Massachusetts is included.',
    category: 'merch',
    enabled: true,
    isOneTime: false,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Ft-shirt-white.jpg?alt=media&token=b071f3dd-dbb2-4d96-9d39-7e9153a2ae4e',
    pricing: { basePrice: 500, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 500 },
    metadata: {},
    sortOrder: 1,
  },
  {
    featureKey: 'BASEBALL_CAP',
    displayName: 'Baseball Cap',
    description: 'Shipping within Massachusetts is included.',
    category: 'merch',
    enabled: true,
    isOneTime: false,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fcap-white.jpg?alt=media&token=7eb1ade0-c66d-47b6-990c-fd5f460f5495',
    pricing: { basePrice: 400, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 400 },
    metadata: {},
    sortOrder: 2,
  },
  {
    featureKey: 'HOODIE',
    displayName: 'Hoodie',
    description: 'Shipping within Massachusetts is included.',
    category: 'merch',
    enabled: true,
    isOneTime: false,
    imageUrl: '',
    pricing: { basePrice: 1000, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 1000 },
    metadata: {},
    sortOrder: 3,
  },
  {
    featureKey: 'CUP',
    displayName: 'Cup',
    description: 'Shipping within Massachusetts is included.',
    category: 'merch',
    enabled: true,
    isOneTime: false,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fcup.jpg?alt=media&token=0ffe6404-8493-4750-a6c9-f0cc35c8dbe4',
    pricing: { basePrice: 400, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 400 },
    metadata: {},
    sortOrder: 4,
  },
  {
    featureKey: 'LANDING_PAGE',
    displayName: 'Landing page',
    description: 'For 5000 coins you\'ll get 50% discount on a landing page. Price range: 5000–20000 coins depending on scope.',
    category: 'IT Service',
    enabled: true,
    isOneTime: false,
    imageUrl: '',
    pricing: {
      basePrice: 5000,
      currency: 'COINS',
      discount: null,
      packages: [
        { id: 'basic', quantity: 1, price: 5000, displayName: 'Basic Landing Page', isRecommended: false },
        { id: 'premium', quantity: 1, price: 20000, displayName: 'Premium Landing Page', isRecommended: true },
      ],
    },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 5000 },
    metadata: {},
    sortOrder: 5,
  },
  {
    featureKey: 'STRETCH_CEILING',
    displayName: 'Stretch ceiling in the bathroom',
    description: 'For 1000 coins you\'ll get 50% discount on stretch ceiling installation in the bathroom.',
    category: 'construction',
    enabled: true,
    isOneTime: false,
    imageUrl: '',
    pricing: { basePrice: 1000, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 1000 },
    metadata: {},
    sortOrder: 6,
  },
  {
    featureKey: 'GROUPON',
    displayName: 'Groupon',
    description: 'Have a great deal? Post your service at your best price for free.',
    category: 'groupon',
    enabled: true,
    isOneTime: false,
    imageUrl: '',
    pricing: { basePrice: 0, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 0 },
    metadata: {},
    sortOrder: 7,
  },
];

export const paidFeaturesApi = {
  async getAll() {
    const snapshot = await getDocs(
      query(collection(firestore, CONFIG_COLLECTION), orderBy('sortOrder', 'asc'))
    );
    if (snapshot.empty) return [];
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async getEnabled() {
    const all = await this.getAll();
    return all.filter((f) => f.enabled);
  },

  async seedDefaults(adminEmail, adminId) {
    const batch = [];
    for (const item of DEFAULT_SHOP_ITEMS) {
      const ref = doc(firestore, CONFIG_COLLECTION, item.featureKey);
      batch.push(
        setDoc(ref, {
          ...item,
          id: item.featureKey,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: adminEmail || null,
        })
      );
    }
    await Promise.all(batch);
  },

  async update(id, data, adminEmail) {
    const ref = doc(firestore, CONFIG_COLLECTION, id);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail || null,
    });
  },

  async toggle(id, enabled, adminEmail) {
    await this.update(id, { enabled }, adminEmail);
  },

  async create(data, adminEmail) {
    const ref = doc(firestore, CONFIG_COLLECTION, data.featureKey);
    await setDoc(ref, {
      ...data,
      id: data.featureKey,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: adminEmail || null,
    });
  },

  async getUserPurchases(userId) {
    const snapshot = await getDocs(collection(firestore, PURCHASES_COLLECTION));
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((d) => d.userId === userId);
  },

  async purchaseFeature(userId, userRole, feature, selectedPackage = null) {
    const price = selectedPackage ? selectedPackage.price : feature.pricing.basePrice;

    return runTransaction(firestore, async (transaction) => {
      const profileRef = doc(firestore, 'profiles', userId);
      const profileSnap = await transaction.get(profileRef);

      if (!profileSnap.exists()) throw new Error('User profile not found');

      const balance = profileSnap.data().loyaltyBalance || 0;
      if (balance < price) throw new Error('Insufficient coin balance');

      const txRef = doc(collection(firestore, TRANSACTIONS_COLLECTION));
      const purchaseRef = doc(
        firestore,
        PURCHASES_COLLECTION,
        feature.isOneTime ? `${userId}_${feature.featureKey}` : txRef.id
      );

      const existingPurchase = await transaction.get(purchaseRef);

      if (feature.isOneTime && existingPurchase.exists() && existingPurchase.data().status === 'active') {
        throw new Error('This feature is already purchased');
      }

      transaction.update(profileRef, { loyaltyBalance: balance - price });

      transaction.set(txRef, {
        userId,
        userRole,
        actionType: 'PURCHASE_FEATURE',
        transactionType: 'spending',
        featureKey: feature.featureKey,
        packageId: selectedPackage?.id || null,
        amount: -price,
        processed: true,
        createdAt: serverTimestamp(),
      });

      const usageData = buildInitialUsageData(feature, selectedPackage);

      if (feature.isOneTime && existingPurchase.exists()) {
        transaction.update(purchaseRef, {
          status: 'active',
          purchasedAt: serverTimestamp(),
          purchaseDetails: {
            transactionId: txRef.id,
            price,
            packageId: selectedPackage?.id || null,
            discountApplied: null,
          },
          usageData,
          lastUsedAt: null,
          updatedAt: serverTimestamp(),
        });
      } else {
        transaction.set(purchaseRef, {
          userId,
          featureKey: feature.featureKey,
          purchasedAt: serverTimestamp(),
          expiresAt: null,
          status: 'active',
          purchaseDetails: {
            transactionId: txRef.id,
            price,
            packageId: selectedPackage?.id || null,
            discountApplied: null,
          },
          usageData,
          lastUsedAt: null,
          metadata: {},
        });
      }

      return { transactionId: txRef.id, price };
    });
  },

  async setCustomSlug(userId, featureId, slug) {
    const slugRef = doc(firestore, 'custom_profile_slugs', slug);
    const slugSnap = await getDoc(slugRef);
    if (slugSnap.exists() && slugSnap.data().userId !== userId) {
      throw new Error('This URL is already taken');
    }

    const purchaseRef = doc(firestore, PURCHASES_COLLECTION, featureId);
    const purchaseSnap = await getDoc(purchaseRef);
    const prevSlug = purchaseSnap.data()?.usageData?.customSlug || null;

    if (prevSlug && prevSlug !== slug) {
      await updateDoc(doc(firestore, 'custom_profile_slugs', prevSlug), { isActive: false });
    }

    await setDoc(slugRef, {
      userId,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await updateDoc(purchaseRef, {
      'usageData.customSlug': slug,
      'usageData.previousSlug': prevSlug,
      'usageData.changedAt': serverTimestamp(),
      'usageData.changeCount': (purchaseSnap.data()?.usageData?.changeCount || 0) + 1,
      lastUsedAt: serverTimestamp(),
    });
  },

  async checkSlugAvailable(slug) {
    const ref = doc(firestore, 'custom_profile_slugs', slug);
    const snap = await getDoc(ref);
    return !snap.exists() || !snap.data().isActive;
  },
};

const buildInitialUsageData = (feature, selectedPackage) => {
  if (feature.featureKey === 'CUSTOM_PROFILE_URL') {
    return { customSlug: null, previousSlug: null, changedAt: null, changeCount: 0 };
  }
  if (feature.featureKey === 'AI_AVATAR_GENERATION') {
    const qty = selectedPackage ? selectedPackage.quantity : 1;
    return {
      totalPurchased: qty,
      usedPurchased: 0,
      remainingPurchased: qty,
      totalFree: feature.metadata?.freeGenerationsPerUser || 0,
      usedFree: 0,
      remainingFree: feature.metadata?.freeGenerationsPerUser || 0,
    };
  }
  return {};
};
