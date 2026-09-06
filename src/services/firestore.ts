import { 
  getFirestore, 
  setLogLevel,
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
  QueryConstraint,
  getDocFromServer
} from 'firebase/firestore';
import { app, auth } from './firebaseAuth';
import firebaseConfig from '../../firebase-applet-config.json';
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

// Silence verbose internal Firestore SDK transport warnings when Cloud Firestore API is offline or not yet enabled
try {
  setLogLevel('silent');
} catch {
  // Ignored
}

// Initialize Firestore with configured databaseId
export const db = getFirestore(app, (firebaseConfig as any)?.firestoreDatabaseId || '(default)');

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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validates connection to Firestore on startup as mandated by the Firebase skill.
 */
export async function testConnection(): Promise<boolean> {
  try {
    await withTimeout(getDocFromServer(doc(db, 'test', 'connection')), 1500);
    return true;
  } catch {
    return false;
  }
}

/**
 * Executes a Promise with a timeout limit so hanging Firebase network calls
 * do not freeze the UI or block asynchronous operations.
 */
export const withTimeout = <T>(promise: Promise<T>, ms: number = 10000, fallbackVal?: T): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        if (fallbackVal !== undefined) {
          resolve(fallbackVal);
        } else {
          reject(new Error(`Timeout de Firestore (${ms}ms)`));
        }
      }
    }, ms);

    promise
      .then((val) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(val);
        }
      })
      .catch((err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          if (fallbackVal !== undefined) {
            resolve(fallbackVal);
          } else {
            reject(err);
          }
        }
      });
  });
};

// ==================== USERS ====================

export const saveUser = async (user: User): Promise<void> => {
  try {
    const payload = {
      ...user,
      updatedAt: new Date().toISOString()
    };

    // Guardar en la colección principal 'users'
    const userRef = doc(db, COLLECTIONS.USERS, user.id);
    await withTimeout(setDoc(userRef, payload, { merge: true }), 12000);

    // Si tiene cédula/documentId distinto al id del documento, guardar también como referencia
    if (user.documentId && user.documentId !== user.id) {
      const docRef = doc(db, COLLECTIONS.USERS, user.documentId);
      await withTimeout(setDoc(docRef, payload, { merge: true }), 12000).catch(() => {});
    }

    // Si es un aliado comercial, guardar también en 'allies' para máxima compatibilidad en Firestore
    if (user.role === 'ally') {
      const allyRef = doc(db, 'allies', user.id);
      await withTimeout(setDoc(allyRef, payload, { merge: true }), 12000).catch(() => {});
    }

    console.log('[Firestore] Usuario guardado exitosamente en Firestore:', user.name, user.documentId);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.USERS}/${user.id}`);
    }
    console.warn('Notice saving user to Firestore (persisted locally):', error?.message || error);
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await withTimeout(getDoc(userRef), 2000, null as any);
    return userSnap && userSnap.exists() ? (userSnap.data() as User) : null;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.USERS}/${userId}`);
    }
    console.warn('Notice getting user from Firestore:', error?.message || error);
    return null;
  }
};

export const getUserByDocument = async (documentId: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where('documentId', '==', documentId.trim()), limit(1));
    const querySnapshot = await withTimeout(getDocs(q), 2000, { empty: true, docs: [] } as any);
    
    if (!querySnapshot.empty && querySnapshot.docs.length > 0) {
      return querySnapshot.docs[0].data() as User;
    }
    return null;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.USERS);
    }
    console.warn('Notice getting user by document from Firestore:', error?.message || error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where('email', '==', email.toLowerCase().trim()), limit(1));
    const querySnapshot = await withTimeout(getDocs(q), 2000, { empty: true, docs: [] } as any);
    
    if (!querySnapshot.empty && querySnapshot.docs.length > 0) {
      return querySnapshot.docs[0].data() as User;
    }
    return null;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.USERS);
    }
    console.warn('Notice getting user by email from Firestore:', error?.message || error);
    return null;
  }
};

export const getUserByPhone = async (phone: string): Promise<User | null> => {
  try {
    const rawClean = phone.replace(/\D/g, '');
    const usersRef = collection(db, COLLECTIONS.USERS);
    
    // Direct match
    const q1 = query(usersRef, where('phone', '==', phone), limit(1));
    const snap1 = await withTimeout(getDocs(q1), 2000, { empty: true, docs: [] } as any);
    if (!snap1.empty && snap1.docs.length > 0) {
      return snap1.docs[0].data() as User;
    }

    // In memory match from all users if formatting differs (+57 vs without +57)
    const all = await getAllUsers();
    return all.find(u => {
      const uDigits = (u.phone || '').replace(/\D/g, '');
      return uDigits === rawClean || (rawClean.length >= 10 && uDigits.endsWith(rawClean.slice(-10)));
    }) || null;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.USERS);
    }
    console.warn('Notice getting user by phone from Firestore:', error?.message || error);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const querySnapshot = await withTimeout(getDocs(usersRef), 12000, { docs: [] } as any);
    let users = querySnapshot.docs.map(doc => doc.data() as User);

    // Also check alternative collections 'allies' and 'aliados' in case they were stored under these names in Firestore
    try {
      const alliesRef = collection(db, 'allies');
      const alliesSnap = await withTimeout(getDocs(alliesRef), 8000, { empty: true, docs: [] } as any);
      if (!alliesSnap.empty) {
        const extraAllies = alliesSnap.docs.map(doc => {
          const data = doc.data() as any;
          return {
            ...data,
            id: data.id || doc.id,
            role: data.role || 'ally'
          } as User;
        });
        users = [...users, ...extraAllies.filter(ea => !users.some(u => u.id === ea.id || u.documentId === ea.documentId))];
      }
    } catch {}

    try {
      const aliadosRef = collection(db, 'aliados');
      const aliadosSnap = await withTimeout(getDocs(aliadosRef), 8000, { empty: true, docs: [] } as any);
      if (!aliadosSnap.empty) {
        const extraAliados = aliadosSnap.docs.map(doc => {
          const data = doc.data() as any;
          return {
            ...data,
            id: data.id || doc.id,
            role: data.role || 'ally'
          } as User;
        });
        users = [...users, ...extraAliados.filter(ea => !users.some(u => u.id === ea.id || u.documentId === ea.documentId))];
      }
    } catch {}

    return users;
  } catch (error) {
    console.warn('Notice reading users from Firestore (falling back to local state):', error);
    return [];
  }
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await withTimeout(updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }), 2500);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.USERS}/${userId}`);
    }
    console.warn('Notice updating user in Firestore:', error?.message || error);
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await withTimeout(deleteDoc(userRef), 2000);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.USERS}/${userId}`);
    }
    console.warn('[Firestore] Aviso al eliminar usuario de Firestore (timeout o red):', error?.message || error);
  }

  // Also clean up from alternative collections if they exist, non-blocking
  try {
    const alliesRef = doc(db, 'allies', userId);
    withTimeout(deleteDoc(alliesRef), 1000).catch(() => {});
  } catch {}
  try {
    const aliadosRef = doc(db, 'aliados', userId);
    withTimeout(deleteDoc(aliadosRef), 1000).catch(() => {});
  } catch {}
};

// ==================== PRODUCTS ====================

export const saveProduct = async (product: Product): Promise<void> => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
    await withTimeout(setDoc(productRef, {
      ...product,
      updatedAt: new Date().toISOString()
    }), 2500);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.PRODUCTS}/${product.id}`);
    }
    console.warn('Notice saving product to Firestore:', error?.message || error);
  }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    const productSnap = await withTimeout(getDoc(productRef), 2000, null as any);
    return productSnap && productSnap.exists() ? (productSnap.data() as Product) : null;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.PRODUCTS}/${productId}`);
    }
    console.warn('Notice getting product from Firestore:', error?.message || error);
    return null;
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const querySnapshot = await withTimeout(getDocs(productsRef), 2500, { docs: [] } as any);
    return querySnapshot.docs.map(doc => doc.data() as Product);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.PRODUCTS);
    }
    console.warn('Error getting all products from Firestore:', error?.message || error);
    return [];
  }
};

export const updateProduct = async (productId: string, data: Partial<Product>): Promise<void> => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await withTimeout(updateDoc(productRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }), 2500);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.PRODUCTS}/${productId}`);
    }
    console.warn('Error updating product in Firestore:', error?.message || error);
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await withTimeout(deleteDoc(productRef), 2000);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.PRODUCTS}/${productId}`);
    }
    console.warn('[Firestore] Aviso al eliminar producto en Firestore:', error?.message || error);
  }
};

// ==================== CAMPAIGNS ====================

export const saveCampaign = async (campaign: CommercialCampaign): Promise<void> => {
  try {
    const campaignRef = doc(db, COLLECTIONS.CAMPAIGNS, campaign.id);
    await withTimeout(setDoc(campaignRef, {
      ...campaign,
      updatedAt: new Date().toISOString()
    }), 2500);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.CAMPAIGNS}/${campaign.id}`);
    }
    console.warn('Notice saving campaign to Firestore:', error?.message || error);
  }
};

export const getCampaign = async (campaignId: string): Promise<CommercialCampaign | null> => {
  try {
    const campaignRef = doc(db, COLLECTIONS.CAMPAIGNS, campaignId);
    const campaignSnap = await withTimeout(getDoc(campaignRef), 2000, null as any);
    return campaignSnap && campaignSnap.exists() ? (campaignSnap.data() as CommercialCampaign) : null;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.CAMPAIGNS}/${campaignId}`);
    }
    console.warn('Notice getting campaign from Firestore:', error?.message || error);
    return null;
  }
};

export const getAllCampaigns = async (): Promise<CommercialCampaign[]> => {
  try {
    const campaignsRef = collection(db, COLLECTIONS.CAMPAIGNS);
    const querySnapshot = await withTimeout(getDocs(campaignsRef), 2500, { docs: [] } as any);
    return querySnapshot.docs.map(doc => doc.data() as CommercialCampaign);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.CAMPAIGNS);
    }
    console.warn('Error getting all campaigns from Firestore:', error?.message || error);
    return [];
  }
};

export const updateCampaign = async (campaignId: string, data: Partial<CommercialCampaign>): Promise<void> => {
  try {
    const campaignRef = doc(db, COLLECTIONS.CAMPAIGNS, campaignId);
    await withTimeout(updateDoc(campaignRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }), 2500);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.CAMPAIGNS}/${campaignId}`);
    }
    console.warn('Error updating campaign in Firestore:', error?.message || error);
  }
};

export const deleteCampaign = async (campaignId: string): Promise<void> => {
  try {
    const campaignRef = doc(db, COLLECTIONS.CAMPAIGNS, campaignId);
    await withTimeout(deleteDoc(campaignRef), 2000);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.CAMPAIGNS}/${campaignId}`);
    }
    console.warn('[Firestore] Aviso al eliminar campaña en Firestore:', error?.message || error);
  }
};

// ==================== GESTIONES (SOAT Reports) ====================

export const saveGestion = async (gestion: ReportedGestion): Promise<void> => {
  try {
    const gestionRef = doc(db, COLLECTIONS.GESTIONES, gestion.id);
    await withTimeout(setDoc(gestionRef, {
      ...gestion,
      updatedAt: new Date().toISOString()
    }), 2500);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.GESTIONES}/${gestion.id}`);
    }
    console.warn('Notice saving gestion to Firestore:', error?.message || error);
  }
};

export const getGestion = async (gestionId: string): Promise<ReportedGestion | null> => {
  try {
    const gestionRef = doc(db, COLLECTIONS.GESTIONES, gestionId);
    const gestionSnap = await withTimeout(getDoc(gestionRef), 2000, null as any);
    return gestionSnap && gestionSnap.exists() ? (gestionSnap.data() as ReportedGestion) : null;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.GESTIONES}/${gestionId}`);
    }
    console.warn('Notice getting gestion from Firestore:', error?.message || error);
    return null;
  }
};

export const getAllGestiones = async (): Promise<ReportedGestion[]> => {
  try {
    const gestionesRef = collection(db, COLLECTIONS.GESTIONES);
    const querySnapshot = await withTimeout(getDocs(gestionesRef), 2500, { docs: [] } as any);
    const gestiones = querySnapshot.docs.map(doc => doc.data() as ReportedGestion);
    return gestiones.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.GESTIONES);
    }
    console.warn('Error getting all gestiones from Firestore:', error?.message || error);
    return [];
  }
};

export const getGestionesByUser = async (userId: string): Promise<ReportedGestion[]> => {
  try {
    const all = await getAllGestiones();
    return all.filter(g => g.allyId === userId);
  } catch (error) {
    console.warn('Error getting user gestiones from Firestore:', error);
    return [];
  }
};

export const updateGestion = async (gestionId: string, data: Partial<ReportedGestion>): Promise<void> => {
  try {
    const gestionRef = doc(db, COLLECTIONS.GESTIONES, gestionId);
    await withTimeout(updateDoc(gestionRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }), 2500);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.GESTIONES}/${gestionId}`);
    }
    console.warn('Error updating gestion in Firestore:', error?.message || error);
  }
};

// ==================== ORDERS (Redemption Orders) ====================

export const saveOrder = async (order: RedemptionOrder): Promise<void> => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, order.id);
    await withTimeout(setDoc(orderRef, {
      ...order,
      updatedAt: new Date().toISOString()
    }), 2500);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.ORDERS}/${order.id}`);
    }
    console.warn('Notice saving order to Firestore:', error?.message || error);
  }
};

export const getOrder = async (orderId: string): Promise<RedemptionOrder | null> => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const orderSnap = await withTimeout(getDoc(orderRef), 2000, null as any);
    return orderSnap && orderSnap.exists() ? (orderSnap.data() as RedemptionOrder) : null;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.ORDERS}/${orderId}`);
    }
    console.warn('Notice getting order from Firestore:', error?.message || error);
    return null;
  }
};

export const getAllOrders = async (): Promise<RedemptionOrder[]> => {
  try {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const querySnapshot = await withTimeout(getDocs(ordersRef), 2500, { docs: [] } as any);
    const orders = querySnapshot.docs.map(doc => doc.data() as RedemptionOrder);
    return orders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.ORDERS);
    }
    console.warn('Error getting all orders from Firestore:', error?.message || error);
    return [];
  }
};

export const getOrdersByUser = async (userId: string): Promise<RedemptionOrder[]> => {
  try {
    const all = await getAllOrders();
    return all.filter(o => o.allyId === userId);
  } catch (error) {
    console.warn('Error getting user orders from Firestore:', error);
    return [];
  }
};

export const updateOrder = async (orderId: string, data: Partial<RedemptionOrder>): Promise<void> => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await withTimeout(updateDoc(orderRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }), 2500);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.ORDERS}/${orderId}`);
    }
    console.warn('Error updating order in Firestore:', error?.message || error);
  }
};

// ==================== TRANSACTIONS ====================

export const saveTransaction = async (transaction: PointsTransaction): Promise<void> => {
  try {
    const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, transaction.id);
    await withTimeout(setDoc(transactionRef, transaction), 2500);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.TRANSACTIONS}/${transaction.id}`);
    }
    console.warn('Notice saving transaction to Firestore:', error?.message || error);
  }
};

export const getTransactionsByUser = async (userId: string): Promise<PointsTransaction[]> => {
  try {
    const transactionsRef = collection(db, COLLECTIONS.TRANSACTIONS);
    const querySnapshot = await withTimeout(getDocs(transactionsRef), 2000, { docs: [] } as any);
    const all = querySnapshot.docs.map(doc => doc.data() as PointsTransaction);
    return all.filter(t => t.allyId === userId).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.TRANSACTIONS);
    }
    console.warn('Error getting user transactions from Firestore:', error?.message || error);
    return [];
  }
};

// ==================== NOTIFICATIONS ====================

export const saveNotification = async (notification: AppNotification): Promise<void> => {
  try {
    const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notification.id);
    await withTimeout(setDoc(notificationRef, notification), 2500);
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.NOTIFICATIONS}/${notification.id}`);
    }
    console.warn('Notice saving notification to Firestore:', error?.message || error);
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

export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await withTimeout(deleteDoc(notificationRef), 2000);
  } catch (error: any) {
    console.warn('[Firestore] Aviso al eliminar notificación:', error?.message || error);
  }
};

export const clearNotificationsByUser = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = userId === 'all_admin' 
      ? query(notificationsRef) 
      : query(notificationsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (error) {
    console.error('Error clearing notifications in Firestore:', error);
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

/**
 * Purges test orders, test transactions, test notifications, and test gestiones from Firestore,
 * resets all users' points to 0, and restores initial products with full initial stock.
 */
export const purgeAllTestDataFromFirestore = async (
  initialProducts: Product[],
  initialUsers: User[]
): Promise<void> => {
  try {
    // 1. Delete all orders with timeout
    try {
      const ordersSnap = await withTimeout(getDocs(collection(db, COLLECTIONS.ORDERS)), 2000, null);
      if (ordersSnap && !ordersSnap.empty) {
        const b1 = writeBatch(db);
        ordersSnap.docs.forEach(d => b1.delete(d.ref));
        await withTimeout(b1.commit(), 2000);
      }
    } catch {}

    // 2. Delete all transactions with timeout
    try {
      const txSnap = await withTimeout(getDocs(collection(db, COLLECTIONS.TRANSACTIONS)), 2000, null);
      if (txSnap && !txSnap.empty) {
        const b2 = writeBatch(db);
        txSnap.docs.forEach(d => b2.delete(d.ref));
        await withTimeout(b2.commit(), 2000);
      }
    } catch {}

    // 3. Delete all notifications with timeout
    try {
      const notifsSnap = await withTimeout(getDocs(collection(db, COLLECTIONS.NOTIFICATIONS)), 2000, null);
      if (notifsSnap && !notifsSnap.empty) {
        const b3 = writeBatch(db);
        notifsSnap.docs.forEach(d => b3.delete(d.ref));
        await withTimeout(b3.commit(), 2000);
      }
    } catch {}

    // 4. Delete all gestiones with timeout
    try {
      const gestSnap = await withTimeout(getDocs(collection(db, COLLECTIONS.GESTIONES)), 2000, null);
      if (gestSnap && !gestSnap.empty) {
        const b4 = writeBatch(db);
        gestSnap.docs.forEach(d => b4.delete(d.ref));
        await withTimeout(b4.commit(), 2000);
      }
    } catch {}

    // 5. Reset all users points to 0
    try {
      const usersSnap = await withTimeout(getDocs(collection(db, COLLECTIONS.USERS)), 2000, null);
      if (usersSnap && !usersSnap.empty) {
        const b5 = writeBatch(db);
        usersSnap.docs.forEach(d => {
          b5.update(d.ref, {
            pointsBalance: 0,
            totalPointsEarned: 0,
            totalPointsRedeemed: 0
          });
        });
        await withTimeout(b5.commit(), 2000);
      }
    } catch {}

    // 6. Reset all products to initial stock and specifications
    if (initialProducts && initialProducts.length > 0) {
      try {
        const b6 = writeBatch(db);
        initialProducts.forEach(p => {
          const pRef = doc(db, COLLECTIONS.PRODUCTS, p.id);
          b6.set(pRef, p);
        });
        await withTimeout(b6.commit(), 2000);
      } catch {}
    }

    console.log('✅ Base de datos Firestore limpiada exitosamente');
  } catch (error) {
    console.warn('Aviso limpiando datos de prueba en Firestore:', error);
  }
};

// ==================== REAL-TIME LISTENERS ====================

export const subscribeToUsers = (callback: (users: User[]) => void, onError?: (error: any) => void) => {
  const usersRef = collection(db, COLLECTIONS.USERS);
  return onSnapshot(
    usersRef, 
    (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data() as User);
      callback(users);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const subscribeToProducts = (callback: (products: Product[]) => void, onError?: (error: any) => void) => {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  return onSnapshot(
    productsRef, 
    (snapshot) => {
      const products = snapshot.docs.map(doc => doc.data() as Product);
      callback(products);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const subscribeToCampaigns = (callback: (campaigns: CommercialCampaign[]) => void, onError?: (error: any) => void) => {
  const campaignsRef = collection(db, COLLECTIONS.CAMPAIGNS);
  return onSnapshot(
    campaignsRef, 
    (snapshot) => {
      const campaigns = snapshot.docs.map(doc => doc.data() as CommercialCampaign);
      callback(campaigns);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const subscribeToGestiones = (callback: (gestiones: ReportedGestion[]) => void, onError?: (error: any) => void) => {
  const gestionesRef = collection(db, COLLECTIONS.GESTIONES);
  return onSnapshot(
    gestionesRef, 
    (snapshot) => {
      const gestiones = snapshot.docs.map(doc => doc.data() as ReportedGestion);
      callback(gestiones.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const subscribeToOrders = (callback: (orders: RedemptionOrder[]) => void, onError?: (error: any) => void) => {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  return onSnapshot(
    ordersRef, 
    (snapshot) => {
      const orders = snapshot.docs.map(doc => doc.data() as RedemptionOrder);
      callback(orders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const subscribeToNotifications = (callback: (notifications: AppNotification[]) => void, onError?: (error: any) => void) => {
  const notifsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
  return onSnapshot(
    notifsRef, 
    (snapshot) => {
      const notifs = snapshot.docs.map(doc => doc.data() as AppNotification);
      callback(notifs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const subscribeToAccessLogs = (callback: (logs: AccessLog[]) => void, onError?: (error: any) => void) => {
  const logsRef = collection(db, COLLECTIONS.ACCESS_LOGS);
  return onSnapshot(
    logsRef, 
    (snapshot) => {
      const logs = snapshot.docs.map(doc => doc.data() as AccessLog);
      callback(logs.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')));
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

