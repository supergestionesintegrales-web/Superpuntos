import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch,
  onSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { app } from './firebaseAuth';
import { 
  User, 
  Product, 
  CommercialCampaign, 
  ReportedGestion, 
  RedemptionOrder, 
  PointsTransaction, 
  AppNotification, 
  AccessLog 
} from '../types';

// Initialize Firestore
export const db = getFirestore(app);

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CAMPAIGNS: 'campaigns',
  GESTIONES: 'gestiones',
  ORDERS: 'orders',
  TRANSACTIONS: 'transactions',
  NOTIFICATIONS: 'notifications',
  ACCESS_LOGS: 'accessLogs'
};

// ==================== USERS ====================

export const saveUser = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, user.id);
    await setDoc(userRef, {
      ...user,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    throw error;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as User) : null;
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    return null;
  }
};

export const getUserByDocument = async (documentId: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where('documentId', '==', documentId.trim()), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by document from Firestore:', error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where('email', '==', email.toLowerCase().trim()), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by email from Firestore:', error);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const querySnapshot = await getDocs(usersRef);
    return querySnapshot.docs.map(doc => doc.data() as User);
  } catch (error) {
    console.error('Error getting all users from Firestore:', error);
    return [];
  }
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user from Firestore:', error);
    throw error;
  }
};

// ==================== PRODUCTS ====================

export const saveProduct = async (product: Product): Promise<void> => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
    await setDoc(productRef, {
      ...product,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving product to Firestore:', error);
    throw error;
  }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    const productSnap = await getDoc(productRef);
    return productSnap.exists() ? (productSnap.data() as Product) : null;
  } catch (error) {
    console.error('Error getting product from Firestore:', error);
    return null;
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const querySnapshot = await getDocs(productsRef);
    return querySnapshot.docs.map(doc => doc.data() as Product);
  } catch (error) {
    console.error('Error getting all products from Firestore:', error);
    return [];
  }
};

export const updateProduct = async (productId: string, data: Partial<Product>): Promise<void> => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await updateDoc(productRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating product in Firestore:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
    throw error;
  }
};

// ==================== CAMPAIGNS ====================

export const saveCampaign = async (campaign: CommercialCampaign): Promise<void> => {
  try {
    const campaignRef = doc(db, COLLECTIONS.CAMPAIGNS, campaign.id);
    await setDoc(campaignRef, {
      ...campaign,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving campaign to Firestore:', error);
    throw error;
  }
};

export const getCampaign = async (campaignId: string): Promise<CommercialCampaign | null> => {
  try {
    const campaignRef = doc(db, COLLECTIONS.CAMPAIGNS, campaignId);
    const campaignSnap = await getDoc(campaignRef);
    return campaignSnap.exists() ? (campaignSnap.data() as CommercialCampaign) : null;
  } catch (error) {
    console.error('Error getting campaign from Firestore:', error);
    return null;
  }
};

export const getAllCampaigns = async (): Promise<CommercialCampaign[]> => {
  try {
    const campaignsRef = collection(db, COLLECTIONS.CAMPAIGNS);
    const querySnapshot = await getDocs(campaignsRef);
    return querySnapshot.docs.map(doc => doc.data() as CommercialCampaign);
  } catch (error) {
    console.error('Error getting all campaigns from Firestore:', error);
    return [];
  }
};

export const updateCampaign = async (campaignId: string, data: Partial<CommercialCampaign>): Promise<void> => {
  try {
    const campaignRef = doc(db, COLLECTIONS.CAMPAIGNS, campaignId);
    await updateDoc(campaignRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating campaign in Firestore:', error);
    throw error;
  }
};

export const deleteCampaign = async (campaignId: string): Promise<void> => {
  try {
    const campaignRef = doc(db, COLLECTIONS.CAMPAIGNS, campaignId);
    await deleteDoc(campaignRef);
  } catch (error) {
    console.error('Error deleting campaign from Firestore:', error);
    throw error;
  }
};

// ==================== GESTIONES (SOAT Reports) ====================

export const saveGestion = async (gestion: ReportedGestion): Promise<void> => {
  try {
    const gestionRef = doc(db, COLLECTIONS.GESTIONES, gestion.id);
    await setDoc(gestionRef, {
      ...gestion,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving gestion to Firestore:', error);
    throw error;
  }
};

export const getGestion = async (gestionId: string): Promise<ReportedGestion | null> => {
  try {
    const gestionRef = doc(db, COLLECTIONS.GESTIONES, gestionId);
    const gestionSnap = await getDoc(gestionRef);
    return gestionSnap.exists() ? (gestionSnap.data() as ReportedGestion) : null;
  } catch (error) {
    console.error('Error getting gestion from Firestore:', error);
    return null;
  }
};

export const getAllGestiones = async (): Promise<ReportedGestion[]> => {
  try {
    const gestionesRef = collection(db, COLLECTIONS.GESTIONES);
    const q = query(gestionesRef, orderBy('reportedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as ReportedGestion);
  } catch (error) {
    console.error('Error getting all gestiones from Firestore:', error);
    return [];
  }
};

export const getGestionesByUser = async (userId: string): Promise<ReportedGestion[]> => {
  try {
    const gestionesRef = collection(db, COLLECTIONS.GESTIONES);
    const q = query(gestionesRef, where('reportedByUserId', '==', userId), orderBy('reportedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as ReportedGestion);
  } catch (error) {
    console.error('Error getting user gestiones from Firestore:', error);
    return [];
  }
};

export const updateGestion = async (gestionId: string, data: Partial<ReportedGestion>): Promise<void> => {
  try {
    const gestionRef = doc(db, COLLECTIONS.GESTIONES, gestionId);
    await updateDoc(gestionRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating gestion in Firestore:', error);
    throw error;
  }
};

// ==================== ORDERS (Redemption Orders) ====================

export const saveOrder = async (order: RedemptionOrder): Promise<void> => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, order.id);
    await setDoc(orderRef, {
      ...order,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
    throw error;
  }
};

export const getOrder = async (orderId: string): Promise<RedemptionOrder | null> => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const orderSnap = await getDoc(orderRef);
    return orderSnap.exists() ? (orderSnap.data() as RedemptionOrder) : null;
  } catch (error) {
    console.error('Error getting order from Firestore:', error);
    return null;
  }
};

export const getAllOrders = async (): Promise<RedemptionOrder[]> => {
  try {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const q = query(ordersRef, orderBy('redeemedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as RedemptionOrder);
  } catch (error) {
    console.error('Error getting all orders from Firestore:', error);
    return [];
  }
};

export const getOrdersByUser = async (userId: string): Promise<RedemptionOrder[]> => {
  try {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const q = query(ordersRef, where('userId', '==', userId), orderBy('redeemedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as RedemptionOrder);
  } catch (error) {
    console.error('Error getting user orders from Firestore:', error);
    return [];
  }
};

export const updateOrder = async (orderId: string, data: Partial<RedemptionOrder>): Promise<void> => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(orderRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating order in Firestore:', error);
    throw error;
  }
};

// ==================== TRANSACTIONS ====================

export const saveTransaction = async (transaction: PointsTransaction): Promise<void> => {
  try {
    const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, transaction.id);
    await setDoc(transactionRef, transaction);
  } catch (error) {
    console.error('Error saving transaction to Firestore:', error);
    throw error;
  }
};

export const getTransactionsByUser = async (userId: string): Promise<PointsTransaction[]> => {
  try {
    const transactionsRef = collection(db, COLLECTIONS.TRANSACTIONS);
    const q = query(transactionsRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as PointsTransaction);
  } catch (error) {
    console.error('Error getting user transactions from Firestore:', error);
    return [];
  }
};

// ==================== NOTIFICATIONS ====================

export const saveNotification = async (notification: AppNotification): Promise<void> => {
  try {
    const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notification.id);
    await setDoc(notificationRef, notification);
  } catch (error) {
    console.error('Error saving notification to Firestore:', error);
    throw error;
  }
};

export const getNotificationsByUser = async (userId: string): Promise<AppNotification[]> => {
  try {
    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = query(notificationsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AppNotification);
  } catch (error) {
    console.error('Error getting user notifications from Firestore:', error);
    return [];
  }
};

export const updateNotification = async (notificationId: string, data: Partial<AppNotification>): Promise<void> => {
  try {
    const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(notificationRef, data);
  } catch (error) {
    console.error('Error updating notification in Firestore:', error);
    throw error;
  }
};

// ==================== ACCESS LOGS ====================

export const saveAccessLog = async (log: AccessLog): Promise<void> => {
  try {
    const logRef = doc(db, COLLECTIONS.ACCESS_LOGS, log.id);
    await setDoc(logRef, log);
  } catch (error) {
    console.error('Error saving access log to Firestore:', error);
    // Don't throw - logs are not critical
  }
};

export const getAllAccessLogs = async (): Promise<AccessLog[]> => {
  try {
    const logsRef = collection(db, COLLECTIONS.ACCESS_LOGS);
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(1000));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AccessLog);
  } catch (error) {
    console.error('Error getting access logs from Firestore:', error);
    return [];
  }
};

// ==================== BATCH OPERATIONS ====================

export const initializeData = async (
  users: User[],
  products: Product[],
  campaigns: CommercialCampaign[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    users.forEach(user => {
      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      batch.set(userRef, user);
    });

    products.forEach(product => {
      const productRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
      batch.set(productRef, product);
    });

    campaigns.forEach(campaign => {
      const campaignRef = doc(db, COLLECTIONS.CAMPAIGNS, campaign.id);
      batch.set(campaignRef, campaign);
    });

    await batch.commit();
    console.log('✅ Datos iniciales guardados en Firestore');
  } catch (error) {
    console.error('Error initializing data in Firestore:', error);
    throw error;
  }
};

// ==================== REAL-TIME LISTENERS ====================

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const usersRef = collection(db, COLLECTIONS.USERS);
  return onSnapshot(usersRef, (snapshot) => {
    const users = snapshot.docs.map(doc => doc.data() as User);
    callback(users);
  });
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  return onSnapshot(productsRef, (snapshot) => {
    const products = snapshot.docs.map(doc => doc.data() as Product);
    callback(products);
  });
};

export const subscribeToCampaigns = (callback: (campaigns: CommercialCampaign[]) => void) => {
  const campaignsRef = collection(db, COLLECTIONS.CAMPAIGNS);
  return onSnapshot(campaignsRef, (snapshot) => {
    const campaigns = snapshot.docs.map(doc => doc.data() as CommercialCampaign);
    callback(campaigns);
  });
};

export const subscribeToGestiones = (callback: (gestiones: ReportedGestion[]) => void) => {
  const gestionesRef = collection(db, COLLECTIONS.GESTIONES);
  const q = query(gestionesRef, orderBy('reportedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const gestiones = snapshot.docs.map(doc => doc.data() as ReportedGestion);
    callback(gestiones);
  });
};

export const subscribeToOrders = (callback: (orders: RedemptionOrder[]) => void) => {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(ordersRef, orderBy('redeemedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => doc.data() as RedemptionOrder);
    callback(orders);
  });
};
