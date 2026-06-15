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

export const SHOP_CATEGORIES = {
  MERCHANDISE: 'Merchandise Shop',
  IT_SERVICES: 'IT & Digital Services',
  CONSTRUCTION: 'Construction Deals',
  SPECIAL_OFFER: 'Special Offer',
};

export const SHOP_CATEGORY_DESCRIPTIONS = {
  [SHOP_CATEGORIES.MERCHANDISE]: 'For merchandise, products, retail offers, electronics, home items, apparel, etc.',
  [SHOP_CATEGORIES.IT_SERVICES]: 'For software, websites, automation, AI, tech support, development, hosting, marketing, etc.',
  [SHOP_CATEGORIES.CONSTRUCTION]: 'For contractors, renovations, building services, materials, equipment, etc.',
  [SHOP_CATEGORIES.SPECIAL_OFFER]: 'Submit your own deal — post local services, products, or quick deals to your community.',
};

export const DEFAULT_SHOP_ITEMS = [
  {
    featureKey: 'TSHIRT',
    displayName: 'T-Shirt',
    description: 'Shipping within Massachusetts is included.',
    category: SHOP_CATEGORIES.MERCHANDISE,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Ft-shirt2New.jpg?alt=media&token=2e44f493-395e-4923-91c6-65765d56ef6b',
    imageUrl2: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Ft-shirtOldOne.jpg?alt=media&token=8b9adb08-3367-455a-a4a6-b06cd4609abc',
    imageUrl3: '',
    pricing: { basePrice: 2500, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 2500 },
    metadata: { sizeOptions: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] },
    sortOrder: 1,
  },
  {
    featureKey: 'BASEBALL_CAP',
    displayName: 'Baseball Cap',
    description: 'Shipping within Massachusetts is included.',
    category: SHOP_CATEGORIES.MERCHANDISE,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FbaseballCapWorkerNew.jpg?alt=media&token=ad49aa17-9422-449b-91c2-17cdf789150a',
    imageUrl2: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fcap-white.jpg?alt=media&token=7eb1ade0-c66d-47b6-990c-fd5f460f5495',
    imageUrl3: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FbaseballCapClean.jpg?alt=media&token=0764fe3e-9941-461d-825c-694ccd21c2b7',
    pricing: { basePrice: 2000, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 2000 },
    metadata: {
      sizeOptions: [
        'One Size (Adjustable)',
        'S/M',
        'L/XL',
        '7',
        '7 1/8',
        '7 1/4',
        '7 3/8',
        '7 1/2',
        '7 5/8',
        '7 3/4',
      ],
    },
    sortOrder: 2,
  },
  {
    featureKey: 'HOODIE',
    displayName: 'Hoodie',
    description: 'Shipping within Massachusetts is included.',
    category: SHOP_CATEGORIES.MERCHANDISE,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fhoodie.jpg?alt=media&token=0ba4d0cc-c75f-4f8e-8771-6189e9f8be3a',
    imageUrl2: '',
    imageUrl3: '',
    pricing: { basePrice: 5000, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 5000 },
    metadata: { sizeOptions: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] },
    sortOrder: 3,
  },
  {
    featureKey: 'CUP',
    displayName: 'Cup',
    description: 'Shipping within Massachusetts is included.',
    category: SHOP_CATEGORIES.MERCHANDISE,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FcupNew.jpg?alt=media&token=4920d895-eb2b-4302-9a31-6fa7dbda67fa',
    imageUrl2: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FcupOld.jpg?alt=media&token=09e83e90-a041-461d-af5f-13b3850f256e',
    imageUrl3: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fcup2New.jpg?alt=media&token=26dcc0fc-dc44-44bb-a301-7453ae0edfe8',
    pricing: { basePrice: 2000, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 2000 },
    metadata: { sizeOptions: [] },
    sortOrder: 4,
  },
    {
    featureKey: 'STRETCH_CEILING',
    displayName: 'Stretch Ceiling in the Bathroom',
    description: 'For 5000 coins you\'ll get 50% discount on stretch ceiling installation in the bathroom.',
    category: SHOP_CATEGORIES.CONSTRUCTION,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fceiling.jpg?alt=media&token=68322b36-cc33-4c71-af59-fc3dcd17c13d',
    imageUrl2: '',
    imageUrl3: '',
    pricing: { basePrice: 5000, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 5000 },
    metadata: {},
    sortOrder: 5,
  },
  {
    featureKey: 'LANDING_PAGE',
    displayName: 'Landing Page',
    description: 'For 8000 coins you\'ll get 50% discount on a landing page. Price range: 8000–20000 coins depending on scope.',
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FlandingPage1.jpg?alt=media&token=19466b92-e576-4df4-a6a8-60a7dd5b734f',
    imageUrl2: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FlandingPage2.jpg?alt=media&token=4eb84e08-e08a-47a3-a2fe-0ac687b59494',
    imageUrl3: '',
    pricing: {
      basePrice: 8000,
      currency: 'COINS',
      discount: null,
      packages: [
        { id: 'basic', quantity: 1, price: 8000, displayName: 'Basic Landing Page', isRecommended: false },
        { id: 'premium', quantity: 1, price: 20000, displayName: 'Premium Landing Page', isRecommended: true },
      ],
    },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 8000 },
    metadata: {},
    sortOrder: 6,
  },
  {
    featureKey: 'MOBILE_APP',
    displayName: 'Mobile App Development',
    description: 'Native and cross-platform iOS / Android apps for your business — booking apps, customer apps, contractor apps and more.',
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fmobile.jpg?alt=media&token=bf9aab4c-2406-4838-92b7-966783bfb7e0',
    imageUrl2: '',
    imageUrl3: '',
    pricing: {
      basePrice: 15000,
      currency: 'COINS',
      discount: null,
      packages: [
        { id: 'mvp', quantity: 1, price: 15000, displayName: 'MVP App', isRecommended: false },
        { id: 'full', quantity: 1, price: 40000, displayName: 'Full-Featured App', isRecommended: true },
      ],
    },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 15000 },
    metadata: {},
    sortOrder: 7,
  },
  {
    featureKey: 'BACKEND_DB',
    displayName: 'Backend & Database Integration',
    description: 'Custom backend, API integrations, database design and cloud setup to power your products.',
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fbackend.jpg?alt=media&token=7a87ec97-2ba6-4b7f-b775-56b2b07dd3ff',
    imageUrl2: '',
    imageUrl3: '',
    pricing: { basePrice: 22000, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 22000 },
    metadata: {},
    sortOrder: 8,
  },
  {
    featureKey: 'CRM_SYSTEM',
    displayName: 'Custom CRM System',
    description: 'A tailor-made CRM to manage clients, jobs, invoices and pipelines — built around how your business actually works.',
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FCRM.jpg?alt=media&token=35487c56-1b91-467f-ba43-8d7ffbac0b30',
    imageUrl2: '',
    imageUrl3: '',
    pricing: { basePrice: 24000, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 24000 },
    metadata: {},
    sortOrder: 9,
  },
  {
    featureKey: 'MINI_GAME',
    displayName: 'Mini-Game / Interactive Experience',
    description: 'Engaging mini-games, quizzes and interactive web experiences — great for marketing campaigns and customer engagement.',
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fmini-game.jpg?alt=media&token=1c23e6c6-ed77-4e65-8136-4d01ec89b851',
    imageUrl2: '',
    imageUrl3: '',
    pricing: { basePrice: 9000, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 9000 },
    metadata: {},
    sortOrder: 10,
  },
  {
    featureKey: 'AI_AUTOMATION',
    displayName: 'AI Automation & Chatbots',
    description: 'Smart chatbots, AI assistants, workflow automation and integrations with OpenAI, Gemini, Anthropic, and more.',
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fchatbot.jpg?alt=media&token=def58143-1054-4466-947d-ddf0e6dfc19d',
    imageUrl2: '',
    imageUrl3: '',
    pricing: { basePrice: 7000, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 7000 },
    metadata: {},
    sortOrder: 11,
  },
  {
    featureKey: 'ECOMMERCE_STORE',
    displayName: 'E-Commerce Store Setup',
    description: 'Full online store: catalog, payments, inventory, shipping integrations and admin panel.',
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fstore.jpg?alt=media&token=c86d4060-e4fc-496c-abaa-7d7f1c84f7e5',
    imageUrl2: '',
    imageUrl3: '',
    pricing: { basePrice: 30000, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 30000 },
    metadata: {},
    sortOrder: 12,
  },
  {
    featureKey: 'WEB_APP',
    displayName: 'Custom Web Application',
    description: 'SaaS dashboards, internal tools and any complex web app tailored to your workflow.',
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2FcustomWebApp.jpg?alt=media&token=c4caadee-8aec-4c0b-92d4-da144119d4ca',
    imageUrl2: '',
    imageUrl3: '',
    pricing: { basePrice: 11000, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 11000 },
    metadata: {},
    sortOrder: 13,
  },
  {
    featureKey: 'TECH_SUPPORT',
    displayName: 'Tech Support & Maintenance',
    description: 'Ongoing technical support, bug fixes, performance tuning and feature updates for your existing systems.',
    category: SHOP_CATEGORIES.IT_SERVICES,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Ftech-support.jpg?alt=media&token=4ac9f4f1-cc39-45f2-a313-f8041218bee6',
    imageUrl2: '',
    imageUrl3: '',
    pricing: { basePrice: 3000, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 3000 },
    metadata: {},
    sortOrder: 14,
  },
  {
    featureKey: 'GROUPON',
    displayName: 'Add Your Offer',
    description: 'Post affordable local services, products, or quick deals for homeowners and contractors in your community.',
    category: SHOP_CATEGORIES.SPECIAL_OFFER,
    enabled: true,
    isOneTime: false,
    imageUrl1: 'https://firebasestorage.googleapis.com/v0/b/ctmasstest.appspot.com/o/shop-images%2Fgroupon.jpg?alt=media&token=6d7d6159-763d-4e80-96ea-01f3e2a1acb5',
    imageUrl2: '',
    imageUrl3: '',
    pricing: { basePrice: 0, currency: 'COINS', discount: null, packages: null },
    availability: { roles: ['homeowner', 'contractor', 'partner'], requireVerified: false, minBalance: 0 },
    metadata: {},
    sortOrder: 15,
  },
];

export const getFeatureImages = (feature) => {
  if (!feature) return [];
  const list = [feature.imageUrl1, feature.imageUrl2, feature.imageUrl3, feature.imageUrl]
    .filter((url) => typeof url === 'string' && url.trim().length > 0);
  return Array.from(new Set(list));
};

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

  async purchaseFeature(userId, userRole, feature, selectedPackage = null, options = {}) {
    const { formData = null, ticketNumber = null, totalPrice = null, totalQuantity = 1 } = options;
    const unitPrice = selectedPackage ? selectedPackage.price : feature.pricing.basePrice;
    const price = totalPrice !== null && totalPrice !== undefined ? totalPrice : unitPrice;

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

      if (price > 0) {
        transaction.update(profileRef, { loyaltyBalance: balance - price });
      }

      transaction.set(txRef, {
        userId,
        userRole,
        actionType: 'PURCHASE_FEATURE',
        transactionType: 'spending',
        featureKey: feature.featureKey,
        packageId: selectedPackage?.id || null,
        amount: -price,
        processed: true,
        ticketNumber: ticketNumber || null,
        createdAt: serverTimestamp(),
      });

      const usageData = buildInitialUsageData(feature, selectedPackage);

      const purchaseDetails = {
        transactionId: txRef.id,
        price,
        unitPrice,
        totalQuantity,
        packageId: selectedPackage?.id || null,
        discountApplied: null,
        ticketNumber: ticketNumber || null,
        formData: formData || null,
      };

      if (feature.isOneTime && existingPurchase.exists()) {
        transaction.update(purchaseRef, {
          status: 'active',
          purchasedAt: serverTimestamp(),
          purchaseDetails,
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
          purchaseDetails,
          usageData,
          lastUsedAt: null,
          metadata: {},
        });
      }

      return { transactionId: txRef.id, price, ticketNumber: ticketNumber || null };
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
