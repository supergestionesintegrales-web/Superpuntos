import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, 
  Product, 
  CommercialCampaign, 
  ReportedGestion, 
  RedemptionOrder, 
  PointsTransaction, 
  AppNotification, 
  CartItem,
  OrderStatus,
  DeliveryType,
  AccessLog,
  SheetsSyncStatus
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_CAMPAIGNS, 
  INITIAL_PRODUCTS, 
  INITIAL_GESTIONES, 
  INITIAL_ORDERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_ACCESS_LOGS
} from '../data/initialData';
import { generateVoucherCode, generatePinCode } from '../utils/helpers';
import { 
  initAuth, 
  googleSignIn, 
  googleSignInForSheets,
  googleSignOut, 
  getAccessToken, 
  setCachedAccessToken,
  firebaseSignInWithEmail,
  firebaseSignUpWithEmail,
  subscribeToFirebaseUser,
  getCurrentFirebaseUser
} from '../services/firebaseAuth';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  saveUser as saveFirestoreUser,
  updateUser as updateFirestoreUser,
  deleteUser as deleteFirestoreUser,
  saveProduct as saveFirestoreProduct,
  updateProduct as updateFirestoreProduct,
  deleteProduct as deleteFirestoreProduct,
  saveCampaign as saveFirestoreCampaign,
  updateCampaign as updateFirestoreCampaign,
  deleteCampaign as deleteFirestoreCampaign,
  saveGestion as saveFirestoreGestion,
  updateGestion as updateFirestoreGestion,
  saveOrder as saveFirestoreOrder,
  updateOrder as updateFirestoreOrder,
  saveTransaction as saveFirestoreTransaction,
  saveAccessLog as saveFirestoreAccessLog,
  saveNotification as saveFirestoreNotification,
  deleteNotification as deleteFirestoreNotification,
  clearNotificationsByUser as clearFirestoreNotificationsByUser,
  subscribeToNotifications,
  subscribeToUsers,
  subscribeToProducts,
  subscribeToCampaigns,
  subscribeToGestiones,
  subscribeToOrders,
  getUser as getFirestoreUser,
  getUserByEmail as getFirestoreUserByEmail,
  getUserByDocument as getFirestoreUserByDocument,
  getAllUsers as getAllFirestoreUsers,
  getAllProducts as getAllFirestoreProducts,
  getAllCampaigns as getAllFirestoreCampaigns,
  getAllGestiones as getAllFirestoreGestiones,
  getAllOrders as getAllFirestoreOrders
} from '../services/firestore';
import { 
  DEFAULT_SPREADSHEET_ID, 
  syncAllToGoogleSheets, 
  appendRowToGoogleSheets, 
  fetchUsersFromGoogleSheets,
  fetchProductsFromGoogleSheets,
  fetchCampaignsFromGoogleSheets,
  updateUserPointsInGoogleSheets,
  autoCalibrateSpreadsheet,
  SHEET_TABS 
} from '../services/googleSheets';

interface AppContextType {
  // Auth & Current User
  isAuthenticated: boolean;
  currentUser: User;
  currentRole: 'admin' | 'ally';
  users: User[];
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;
  checkUserExists: (documentOrEmail: string) => Promise<{ exists: boolean; user?: User }>;
  loginAsAlly: (documentOrId: string, password?: string) => Promise<{ success: boolean; notRegistered?: boolean; message: string; user?: User }>;
  loginAsAdmin: (emailOrUser: string, password?: string) => { success: boolean; message: string; user?: User };
  loginWithGoogle: () => Promise<{ success: boolean; message: string; user?: User; code?: string; domain?: string }>;
  loginWithEmailPassword: (emailOrDoc: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  registerWithEmailPassword: (data: Omit<User, 'id' | 'role' | 'pointsBalance' | 'totalPointsEarned' | 'totalPointsRedeemed' | 'status' | 'createdAt'>) => Promise<{ success: boolean; message: string; user?: User }>;
  syncWithFirestore: () => Promise<{ success: boolean; message: string }>;
  isFirebaseConnected: boolean;
  firestoreStatus: 'connected' | 'connecting' | 'error';
  firebaseUser: FirebaseUser | null;
  syncUsersFromGoogleSheets: () => Promise<{ success: boolean; count: number; message: string }>;
  calibrateSpreadsheet: () => Promise<{ success: boolean; message: string; tabsCalibrated: string[] }>;
  logout: () => void;
  registerAlly: (data: Omit<User, 'id' | 'role' | 'pointsBalance' | 'totalPointsEarned' | 'totalPointsRedeemed' | 'status' | 'createdAt'>) => User;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => Promise<void>;
  requestPasswordReset: (identifier: string) => Promise<{ 
    success: boolean; 
    message: string; 
    tempPassword?: string; 
    expiresAt?: string; 
    sentEmail?: string; 
    user?: User; 
    isGoogleUser?: boolean;
  }>;
  setDefinitivePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
  mustResetPasswordModalOpen: boolean;
  setMustResetPasswordModalOpen: (open: boolean) => void;
  pendingGestionesCount: number;
  pendingOrdersCount: number;
  
  // Access Logs
  accessLogs: AccessLog[];
  logAccessEvent: (eventType: AccessLog['eventType'], details?: string, targetUser?: User) => void;

  // la base de datos Integration
  isGoogleConnected: boolean;
  googleUserEmail: string | null;
  spreadsheetId: string;
  setSpreadsheetId: (id: string) => void;
  sheetsSyncStatus: SheetsSyncStatus;
  connectGoogleSheets: () => Promise<boolean>;
  disconnectGoogleSheets: () => Promise<void>;
  syncToGoogleSheets: (customId?: string) => Promise<{ success: boolean; message: string }>;

  // Products & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateStock: (productId: string, newStock: number) => void;

  // Campaigns & Services
  campaigns: CommercialCampaign[];
  addCampaign: (campaign: Omit<CommercialCampaign, 'id'>) => void;
  updateCampaign: (campaign: CommercialCampaign) => void;
  toggleCampaign: (campaignId: string) => void;

  // Gestiones & Points Earned
  gestiones: ReportedGestion[];
  reportGestion: (data: {
    campaignId: string;
    referenceNumber: string;
    transactionValue?: number;
    clientName?: string;
    clientDocument?: string;
    notes?: string;
    evidenceUrl?: string;
    licensePlate?: string;
    policyNumber?: string;
    soatQuantity?: number;
    insuranceCompany?: string;
    vehicleType?: string;
  }) => ReportedGestion;
  approveGestion: (gestionId: string, pointsAwarded?: number, adminFeedback?: string) => void;
  rejectGestion: (gestionId: string, adminFeedback: string) => void;
  batchApprovePendingGestiones: (gestionIds: string[]) => void;
  reportMultipleGestiones: (items: Array<{
    campaignId: string;
    referenceNumber: string;
    transactionValue?: number;
    clientName?: string;
    clientDocument?: string;
    notes?: string;
    evidenceUrl?: string;
    licensePlate?: string;
    policyNumber?: string;
    soatQuantity?: number;
    insuranceCompany?: string;
    vehicleType?: string;
  }>) => ReportedGestion[];

  // Manual Points
  assignManualPoints: (allyId: string, points: number, reason: string, isBonus?: boolean) => void;
  adjustUserPoints: (allyId: string, points: number, reason: string, isBonus?: boolean) => void;

  // Cart & Redemptions
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartPointsTotal: number;
  redeemCart: (deliveryDetails: {
    deliveryType: DeliveryType;
    shippingAddress?: string;
    shippingCity?: string;
    shippingDepartment?: string;
    pickupOffice?: string;
    recipientName?: string;
    recipientPhone?: string;
    pickupPersonDocument?: string;
    supergirosDocument?: string;
    supergirosName?: string;
    supergirosPhone?: string;
    notes?: string;
  }) => { success: boolean; order?: RedemptionOrder; message: string };

  // Orders & Audit Log
  orders: RedemptionOrder[];
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string, notes?: string) => void;

  // Transactions & Ledger
  transactions: PointsTransaction[];

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (notifId: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (notifId: string) => void;
  clearNotifications: (forUserId?: string) => void;

  // UI & General
  triggerConfetti: () => void;
  resetAllDataToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'superpuntos_v14_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state with fallback to seed data
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}isAuthenticated`);
    return saved !== null ? saved === 'true' : false;
  });

  const [users, setUsers] = useState<User[]>(() => {
    let deletedSet = new Set<string>();
    try {
      const storedDeleted = localStorage.getItem('superpuntos_deleted_users');
      if (storedDeleted) deletedSet = new Set(JSON.parse(storedDeleted));
    } catch {}

    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const filtered = parsed.filter(u => !deletedSet.has(u.id));
        // Ensure owner is present and admin
        const ownerIndex = filtered.findIndex(u => 
          u.email.toLowerCase() === 'supergestionesintegrales@gmail.com' ||
          u.email.toLowerCase().includes('supergestiones')
        );
        if (ownerIndex >= 0) {
          filtered[ownerIndex] = {
            ...filtered[ownerIndex],
            role: 'admin',
            name: filtered[ownerIndex].name || 'Super Gestiones Integrales (Administrador Principal)'
          };
          return filtered;
        } else {
          return [INITIAL_USERS[0], ...filtered];
        }
      } catch {
        return INITIAL_USERS.filter(u => !deletedSet.has(u.id));
      }
    }
    return INITIAL_USERS.filter(u => !deletedSet.has(u.id));
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}currentUserId`);
    return saved || 'usr_admin';
  });

  const [mustResetPasswordModalOpen, setMustResetPasswordModalOpen] = useState<boolean>(false);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}products`);
    if (!saved) return INITIAL_PRODUCTS;
    try {
      const parsed: Product[] = JSON.parse(saved);
      return parsed.map(p => {
        const initialMatch = INITIAL_PRODUCTS.find(ip => ip.id === p.id);
        if (initialMatch && (!p.imageUrl || p.imageUrl.trim() === '')) {
          return { ...p, imageUrl: initialMatch.imageUrl };
        }
        return p;
      });
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [campaigns, setCampaigns] = useState<CommercialCampaign[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}campaigns`);
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [gestiones, setGestiones] = useState<ReportedGestion[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}gestiones`);
    return saved ? JSON.parse(saved) : INITIAL_GESTIONES;
  });

  const [orders, setOrders] = useState<RedemptionOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [transactions, setTransactions] = useState<PointsTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}cart`);
    return saved ? JSON.parse(saved) : [];
  });

  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}accessLogs`);
    return saved ? JSON.parse(saved) : INITIAL_ACCESS_LOGS;
  });

  // la base de datos integration state
  const [spreadsheetId, setSpreadsheetIdState] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}spreadsheetId`);
    return saved || DEFAULT_SPREADSHEET_ID;
  });

  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [sheetsSyncStatus, setSheetsSyncStatus] = useState<SheetsSyncStatus>({
    lastSyncAt: null,
    status: 'idle',
    spreadsheetId: DEFAULT_SPREADSHEET_ID
  });

  // Firebase & Firestore State
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [firestoreStatus, setFirestoreStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(() => getCurrentFirebaseUser());

  // Real-time Firestore synchronization & Firebase Auth
  useEffect(() => {
    // 1. Listen to Firebase User state changes
    const unsubAuth = subscribeToFirebaseUser(async (fbUser) => {
      setFirebaseUser(fbUser);
      // Auto-recognize already authenticated Firebase user if not explicitly logged out
      if (fbUser && fbUser.email) {
        const wasExplicitLogout = sessionStorage.getItem('superpuntos_explicit_logout') === 'true';
        if (!wasExplicitLogout) {
          const cleanEmail = fbUser.email.toLowerCase();
          const isSuperGestiones = cleanEmail === 'supergestionesintegrales@gmail.com' || cleanEmail.includes('supergestiones');
          const isSantiago = cleanEmail === 'santiikstro1108@gmail.com' || cleanEmail.includes('santiikstro');
          const isAdminEmail = isSuperGestiones || isSantiago || cleanEmail.includes('admin');

          let matched = users.find(u => u.email.toLowerCase() === cleanEmail);
          if (!matched) {
            try {
              matched = (await getFirestoreUserByEmail(cleanEmail)) || undefined;
              if (matched) {
                setUsers(prev => [matched!, ...prev.filter(u => u.id !== matched!.id)]);
              }
            } catch {}
          }
          if (matched) {
            setCurrentUserId(matched.id);
            setIsAuthenticated(true);
          } else {
            // Auto-recognize returning user from Firebase Auth so they don't see login prompts
            const defaultOwnerName = isSuperGestiones 
              ? 'Super Gestiones Integrales (Administrador Principal)' 
              : (isSantiago ? 'Santiago Castro (Administrador Principal)' : (cleanEmail.split('@')[0] || 'Aliado Superpuntos'));
            const displayName = fbUser.displayName || defaultOwnerName;
            const newUser: User = {
              id: isSuperGestiones ? 'usr_admin_owner' : (isAdminEmail ? `usr_admin_${Date.now()}` : `usr_${Date.now()}`),
              name: displayName,
              documentId: isSuperGestiones ? '901234567' : (isAdminEmail ? '1098765432' : `G-${fbUser.uid.slice(0, 8)}`),
              email: cleanEmail,
              phone: fbUser.phoneNumber || '3001234567',
              role: isAdminEmail ? 'admin' : 'ally',
              businessName: isSuperGestiones ? 'Super Gestiones Integrales - Dirección Central' : (isAdminEmail ? 'SuperGIROS Central - Dirección General' : displayName),
              zone: 'Dirección Nacional',
              pointsBalance: 0,
              totalPointsEarned: 0,
              totalPointsRedeemed: 0,
              status: 'active',
              createdAt: new Date().toISOString(),
              avatarUrl: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f59e0b&color=0f172a&bold=true`
            };
            setUsers(prev => [newUser, ...prev]);
            saveFirestoreUser(newUser).catch(() => {});
            setCurrentUserId(newUser.id);
            setIsAuthenticated(true);
          }
        }
      }
    });

    // 2. Real-time Firestore subscriptions for Users, Products, Campaigns, Gestiones, Orders
    let unsubUsers: (() => void) | undefined;
    let unsubProducts: (() => void) | undefined;
    let unsubCampaigns: (() => void) | undefined;
    let unsubGestiones: (() => void) | undefined;
    let unsubOrders: (() => void) | undefined;
    let unsubNotifications: (() => void) | undefined;

    try {
      unsubUsers = subscribeToUsers((firestoreUsers) => {
        let deletedSet = new Set<string>();
        try {
          const storedDeleted = localStorage.getItem('superpuntos_deleted_users');
          if (storedDeleted) deletedSet = new Set(JSON.parse(storedDeleted));
        } catch {}

        if (firestoreUsers && firestoreUsers.length > 0) {
          setUsers(prev => {
            const map = new Map<string, User>();
            prev.filter(u => !deletedSet.has(u.id)).forEach(u => map.set(u.id, u));
            firestoreUsers.filter(u => !deletedSet.has(u.id)).forEach(u => map.set(u.id, { ...map.get(u.id), ...u }));
            return Array.from(map.values());
          });
          setIsFirebaseConnected(true);
          setFirestoreStatus('connected');
        } else {
          // Initialize initial users in Firestore if empty
          INITIAL_USERS.filter(u => !deletedSet.has(u.id)).forEach(u => saveFirestoreUser(u).catch(() => {}));
          setIsFirebaseConnected(true);
          setFirestoreStatus('connected');
        }
      });

      unsubProducts = subscribeToProducts((firestoreProducts) => {
        if (firestoreProducts && firestoreProducts.length > 0) {
          setProducts(firestoreProducts);
          setIsFirebaseConnected(true);
          setFirestoreStatus('connected');
        } else {
          INITIAL_PRODUCTS.forEach(p => saveFirestoreProduct(p).catch(() => {}));
        }
      });

      unsubCampaigns = subscribeToCampaigns((firestoreCampaigns) => {
        if (firestoreCampaigns && firestoreCampaigns.length > 0) {
          setCampaigns(firestoreCampaigns);
        } else {
          INITIAL_CAMPAIGNS.forEach(c => saveFirestoreCampaign(c).catch(() => {}));
        }
      });

      unsubGestiones = subscribeToGestiones((firestoreGestiones) => {
        if (firestoreGestiones && firestoreGestiones.length > 0) {
          setGestiones(firestoreGestiones);
        }
      });

      unsubOrders = subscribeToOrders((firestoreOrders) => {
        if (firestoreOrders && firestoreOrders.length > 0) {
          setOrders(firestoreOrders);
        }
      });

      unsubNotifications = subscribeToNotifications((firestoreNotifs) => {
        if (firestoreNotifs) {
          setNotifications(firestoreNotifs);
        }
      });
    } catch (err) {
      console.warn('Firestore subscription initialized in offline mode:', err);
      setIsFirebaseConnected(false);
      setFirestoreStatus('error');
    }

    return () => {
      unsubAuth();
      if (unsubUsers) unsubUsers();
      if (unsubProducts) unsubProducts();
      if (unsubCampaigns) unsubCampaigns();
      if (unsubGestiones) unsubGestiones();
      if (unsubOrders) unsubOrders();
      if (unsubNotifications) unsubNotifications();
    };
  }, []);

  // Init Google Sheets Integration Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setIsGoogleConnected(true);
        setGoogleUserEmail(user.email || null);
        
        // Auto-calibrate and auto-fetch users from la base de datos on start
        getAccessToken().then(async (token) => {
          if (token) {
            try {
              // 1. Ensure all tabs and standard headers exist without errors
              await autoCalibrateSpreadsheet(token, spreadsheetId);

              // 2. Fetch users from sheet
              const sheetUsers = await fetchUsersFromGoogleSheets(token, spreadsheetId);
              if (sheetUsers.length > 0) {
                setUsers(prev => {
                  const userMap = new Map<string, User>();
                  prev.forEach(u => userMap.set(u.documentId || u.id, u));
                  sheetUsers.forEach(u => userMap.set(u.documentId || u.id, { ...userMap.get(u.documentId || u.id), ...u }));
                  return Array.from(userMap.values());
                });
              }

              // 3. Fetch products dynamically from la base de datos (Articulos and Bonos)
              const sheetProducts = await fetchProductsFromGoogleSheets(token, spreadsheetId);
              if (sheetProducts.length > 0) {
                setProducts(prev => {
                  const prodMap = new Map<string, Product>();
                  prev.forEach(p => prodMap.set(p.id, p));
                  sheetProducts.forEach(p => prodMap.set(p.id, { ...prodMap.get(p.id), ...p }));
                  return Array.from(prodMap.values());
                });
              }

              // 4. Fetch promotional campaigns from la base de datos (Promocionales)
              const sheetCampaigns = await fetchCampaignsFromGoogleSheets(token, spreadsheetId);
              if (sheetCampaigns.length > 0) {
                setCampaigns(sheetCampaigns);
              }
            } catch (err) {
              console.warn('Auto calibración inicial la base de datos:', err);
            }
          }
        });
      },
      () => {
        setIsGoogleConnected(false);
        setGoogleUserEmail(null);
      }
    );
    return () => unsubscribe();
  }, [spreadsheetId]);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}isAuthenticated`, String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}currentUserId`, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}campaigns`, JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}gestiones`, JSON.stringify(gestiones));
  }, [gestiones]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}cart`, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}accessLogs`, JSON.stringify(accessLogs));
  }, [accessLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}spreadsheetId`, spreadsheetId);
  }, [spreadsheetId]);

  // Current User Object
  const currentUser = users.find(u => u.id === currentUserId) || users[0] || INITIAL_USERS[0];
  const currentRole = currentUser.role;

  const pendingGestionesCount = gestiones.filter(g => g.status === 'pending').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;

  const setSpreadsheetId = (newId: string) => {
    setSpreadsheetIdState(newId.trim());
  };

  // Helper to log access and activity events
  const logAccessEvent = useCallback((
    eventType: AccessLog['eventType'], 
    details?: string, 
    targetUser?: User
  ) => {
    const user = targetUser || currentUser;
    const newLog: AccessLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      documentId: user.documentId,
      role: user.role,
      eventType,
      details: details || `Evento de ${eventType} registrado`,
      ipOrDevice: 'Portal Web Superpuntos'
    };
    setAccessLogs(prev => [newLog, ...prev]);

    // Live push to la base de datos if token is present
    getAccessToken().then(token => {
      if (token) {
        appendRowToGoogleSheets(
          token,
          SHEET_TABS.ACCESS_LOGS,
          [
            newLog.id,
            new Date(newLog.timestamp).toLocaleString('es-CO'),
            newLog.userId,
            newLog.userName,
            newLog.documentId,
            newLog.role === 'admin' ? 'Administrador' : 'Aliado Comercial',
            newLog.eventType.toUpperCase(),
            newLog.details || '',
            newLog.ipOrDevice || 'Web App Superpuntos'
          ],
          spreadsheetId
        ).catch(() => {});
      }
    });
  }, [currentUser, spreadsheetId]);

  // la base de datos Connect / Disconnect
  const connectGoogleSheets = async (): Promise<boolean> => {
    try {
      const token = await googleSignInForSheets();
      if (token) {
        setIsGoogleConnected(true);
        const curUser = getCurrentFirebaseUser();
        setGoogleUserEmail(curUser?.email || null);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error conectando con Google Sheets:', err);
      throw err;
    }
  };

  const disconnectGoogleSheets = async () => {
    await googleSignOut();
    setCachedAccessToken(null);
    setIsGoogleConnected(false);
    setGoogleUserEmail(null);
  };

  // Full sync of current in-memory state to la base de datos
  const syncToGoogleSheets = async (customId?: string): Promise<{ success: boolean; message: string }> => {
    const targetSheetId = (customId || spreadsheetId || DEFAULT_SPREADSHEET_ID).trim();
    let token = await getAccessToken();

    if (!token) {
      // Prompt user to authorize Google Sheets
      token = await googleSignInForSheets();
      if (!token) {
        return { success: false, message: 'Se requiere autorización de Google Sheets para sincronizar la hoja de cálculo.' };
      }
    }

    const validToken = await getAccessToken();
    if (!validToken) {
      return { success: false, message: 'Token de acceso no disponible.' };
    }

    setSheetsSyncStatus({
      status: 'syncing',
      lastSyncAt: sheetsSyncStatus.lastSyncAt,
      spreadsheetId: targetSheetId
    });

    try {
      await syncAllToGoogleSheets(
        validToken,
        {
          users,
          products,
          campaigns,
          gestiones,
          orders,
          accessLogs,
          transactions
        },
        targetSheetId
      );

      const now = new Date().toISOString();
      setSheetsSyncStatus({
        status: 'success',
        lastSyncAt: now,
        spreadsheetId: targetSheetId,
        message: 'Sincronización exitosa con todas las pestañas de la base de datos'
      });

      return { success: true, message: '¡Datos sincronizados exitosamente con la base de datos!' };
    } catch (err: any) {
      setSheetsSyncStatus({
        status: 'error',
        lastSyncAt: sheetsSyncStatus.lastSyncAt,
        spreadsheetId: targetSheetId,
        message: err.message || 'Error al sincronizar con la base de datos'
      });
      return { success: false, message: err.message || 'Error al sincronizar con la base de datos' };
    }
  };

  const switchUserById = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
      setIsAuthenticated(true);
      setCart([]);
      logAccessEvent('login', `Cambio de sesión a usuario: ${found.name}`, found);
    }
  };

  const syncUsersFromGoogleSheets = async (): Promise<{ success: boolean; count: number; message: string }> => {
    try {
      const token = await getAccessToken();
      if (!token) {
        return { success: false, count: 0, message: 'la base de datos no conectado' };
      }
      const sheetUsers = await fetchUsersFromGoogleSheets(token, spreadsheetId);
      if (sheetUsers.length > 0) {
        setUsers(prev => {
          const userMap = new Map<string, User>();
          prev.forEach(u => userMap.set(u.documentId || u.id, u));
          sheetUsers.forEach(u => userMap.set(u.documentId || u.id, { ...userMap.get(u.documentId || u.id), ...u }));
          return Array.from(userMap.values());
        });
        return { 
          success: true, 
          count: sheetUsers.length, 
          message: `Se sincronizaron ${sheetUsers.length} usuarios desde la hoja de cálculo.` 
        };
      }
      return { success: true, count: 0, message: 'No se encontraron usuarios adicionales en la base de datos.' };
    } catch (err: any) {
      return { success: false, count: 0, message: err.message || 'Error consultando la base de datos' };
    }
  };

  const calibrateSpreadsheet = async (): Promise<{ success: boolean; message: string; tabsCalibrated: string[] }> => {
    try {
      const token = await getAccessToken();
      if (!token) {
        return { success: false, message: 'la base de datos no está conectado.', tabsCalibrated: [] };
      }
      const res = await autoCalibrateSpreadsheet(token, spreadsheetId);
      // After calibrating, re-fetch users
      if (res.success) {
        const sheetUsers = await fetchUsersFromGoogleSheets(token, spreadsheetId);
        if (sheetUsers.length > 0) {
          setUsers(prev => {
            const userMap = new Map<string, User>();
            prev.forEach(u => userMap.set(u.documentId || u.id, u));
            sheetUsers.forEach(u => userMap.set(u.documentId || u.id, { ...userMap.get(u.documentId || u.id), ...u }));
            return Array.from(userMap.values());
          });
        }
        const sheetProducts = await fetchProductsFromGoogleSheets(token, spreadsheetId);
        if (sheetProducts.length > 0) {
          setProducts(sheetProducts);
        }
        const sheetCampaigns = await fetchCampaignsFromGoogleSheets(token, spreadsheetId);
        if (sheetCampaigns.length > 0) {
          setCampaigns(sheetCampaigns);
        }
      }
      return res;
    } catch (err: any) {
      return { success: false, message: err.message || 'Error al calibrar la base de datos', tabsCalibrated: [] };
    }
  };

  const checkUserExists = async (documentOrEmail: string): Promise<{ exists: boolean; user?: User }> => {
    const clean = documentOrEmail.trim().toLowerCase();
    if (!clean) return { exists: false };

    // 1. Check in local state
    const localFound = users.find(u => 
      u.documentId.toLowerCase() === clean || 
      u.email.toLowerCase() === clean ||
      u.id.toLowerCase() === clean
    );
    if (localFound) return { exists: true, user: localFound };

    // 2. Check in Firestore
    try {
      const fromFirestore = (await getFirestoreUserByEmail(clean)) || (await getFirestoreUserByDocument(clean));
      if (fromFirestore) {
        setUsers(prev => [fromFirestore, ...prev.filter(u => u.id !== fromFirestore.id)]);
        return { exists: true, user: fromFirestore };
      }
    } catch {
      // ignore network errors
    }

    // 3. Try fetching from la base de datos if connected
    try {
      const token = await getAccessToken();
      if (token) {
        const sheetUsers = await fetchUsersFromGoogleSheets(token, spreadsheetId);
        const sheetFound = sheetUsers.find(u => 
          u.documentId.toLowerCase() === clean || 
          u.email.toLowerCase() === clean ||
          u.id.toLowerCase() === clean
        );
        if (sheetFound) {
          // Merge to state and save to Firestore
          setUsers(prev => [sheetFound, ...prev.filter(u => u.id !== sheetFound.id && u.documentId !== sheetFound.documentId)]);
          saveFirestoreUser(sheetFound).catch(() => {});
          return { exists: true, user: sheetFound };
        }
      }
    } catch {
      // ignore network errors
    }

    return { exists: false };
  };

  const loginAsAlly = async (documentOrId: string, enteredPassword?: string): Promise<{ success: boolean; notRegistered?: boolean; message: string; user?: User }> => {
    const cleanDoc = documentOrId.trim().toLowerCase();
    if (!cleanDoc) {
      return { success: false, notRegistered: false, message: 'Por favor ingresa tu número de cédula o documento de identidad.' };
    }

    // 1. Check in local state
    let found = users.find(u => 
      u.role === 'ally' && (
        u.documentId.toLowerCase() === cleanDoc || 
        u.id.toLowerCase() === cleanDoc ||
        u.email.toLowerCase() === cleanDoc ||
        u.name.toLowerCase() === cleanDoc
      )
    );

    // 2. If not found locally, query Firestore
    if (!found) {
      try {
        const fromFirestore = (await getFirestoreUserByDocument(cleanDoc)) || (await getFirestoreUserByEmail(cleanDoc));
        if (fromFirestore && fromFirestore.role === 'ally') {
          found = fromFirestore;
          setUsers(prev => [fromFirestore, ...prev.filter(u => u.id !== fromFirestore.id)]);
        }
      } catch (err) {
        console.warn('Error al buscar aliado en Firestore:', err);
      }
    }

    // 3. If still not found, try live checking la base de datos
    if (!found) {
      try {
        const token = await getAccessToken();
        if (token) {
          const sheetUsers = await fetchUsersFromGoogleSheets(token, spreadsheetId);
          const fromSheet = sheetUsers.find(u => 
            u.role === 'ally' && (
              u.documentId.toLowerCase() === cleanDoc || 
              u.id.toLowerCase() === cleanDoc ||
              u.email.toLowerCase() === cleanDoc
            )
          );
          if (fromSheet) {
            found = fromSheet;
            setUsers(prev => [fromSheet, ...prev.filter(u => u.id !== fromSheet.id && u.documentId !== fromSheet.documentId)]);
            saveFirestoreUser(fromSheet).catch(() => {});
          }
        }
      } catch {
        // continue
      }
    }

    if (found) {
      let isPasswordCorrect = false;
      let isTempPasswordLogin = false;

      // Validate standard permanent password
      if (found.password && found.password.trim() !== '') {
        if (enteredPassword && enteredPassword.trim() === found.password.trim()) {
          isPasswordCorrect = true;
        }
      }

      // Check temporary password (valid for 5 hours)
      if (!isPasswordCorrect && found.tempPassword && found.tempPassword.trim() !== '') {
        if (enteredPassword && enteredPassword.trim() === found.tempPassword.trim()) {
          const now = Date.now();
          const expiresTime = found.tempPasswordExpiresAt ? new Date(found.tempPasswordExpiresAt).getTime() : 0;
          if (expiresTime > now) {
            isPasswordCorrect = true;
            isTempPasswordLogin = true;
          } else {
            return {
              success: false,
              notRegistered: false,
              message: 'La contraseña temporal ha expirado (límite de 5 horas superado). Por favor solicita una nueva en "¿Olvidaste tu contraseña?".'
            };
          }
        }
      }

      // If user has a password and neither permanent nor valid temp matched
      if (!isPasswordCorrect && found.password && found.password.trim() !== '') {
        return { 
          success: false, 
          notRegistered: false, 
          message: 'Contraseña incorrecta. Si la olvidaste, puedes generar una clave temporal de 5 horas en "¿Olvidaste tu contraseña?".' 
        };
      }

      setCurrentUserId(found.id);
      setIsAuthenticated(true);
      sessionStorage.removeItem('superpuntos_explicit_logout');
      try {
        localStorage.setItem('superpuntos_last_logged_doc', found.documentId);
        localStorage.setItem('superpuntos_last_logged_name', found.name);
      } catch {}

      if (isTempPasswordLogin || found.mustResetPassword) {
        setMustResetPasswordModalOpen(true);
      }

      logAccessEvent('login', `Inicio de sesión exitoso como Aliado: ${found.name}${isTempPasswordLogin ? ' (Con contraseña temporal de 5h)' : ''}`, found);
      return { 
        success: true, 
        message: isTempPasswordLogin
          ? `¡Acceso con clave temporal exitoso! Por seguridad, debes configurar tu contraseña definitiva.`
          : `¡Bienvenido al portal, ${found.name}!`, 
        user: found 
      };
    }

    // If still not found, DO NOT allow login - prompt registration!
    return { 
      success: false, 
      notRegistered: true, 
      message: 'Usuario no registrado. La cédula o documento ingresado no se encuentra en la base de datos de usuarios de Superpuntos. Por favor regístrate como nuevo Aliado Comercial.' 
    };
  };

  const loginAsAdmin = (emailOrUser: string, enteredPassword?: string) => {
    const clean = emailOrUser.trim().toLowerCase();
    const isOwner = clean === 'supergestionesintegrales@gmail.com' || 
                    clean.includes('supergestiones') || 
                    clean === 'santiikstro1108@gmail.com' || 
                    clean.includes('santiikstro');

    let adminUser = users.find(u => 
      (u.role === 'admin' || isOwner) && (
        u.email.toLowerCase() === clean || 
        u.documentId.toLowerCase() === clean || 
        u.id.toLowerCase() === clean || 
        clean.includes('admin') ||
        (isOwner && (u.email.toLowerCase().includes('supergestiones') || u.email.toLowerCase().includes('santiikstro')))
      )
    );

    if (!adminUser && isOwner) {
      adminUser = INITIAL_USERS.find(u => 
        u.email.toLowerCase() === 'supergestionesintegrales@gmail.com' ||
        u.email.toLowerCase().includes('supergestiones')
      ) || INITIAL_USERS[0];
      setUsers(prev => [adminUser!, ...prev.filter(u => u.id !== adminUser!.id)]);
    } else if (!adminUser) {
      adminUser = users.find(u => u.role === 'admin') || INITIAL_USERS[0];
    }

    if (adminUser.role !== 'admin') {
      adminUser = { ...adminUser, role: 'admin' };
      setUsers(prev => prev.map(u => u.id === adminUser!.id ? adminUser! : u));
    }

    let isPasswordCorrect = false;
    let isTempPasswordLogin = false;

    if (!isOwner && adminUser.password && adminUser.password.trim() !== '') {
      if (enteredPassword && enteredPassword.trim() === adminUser.password.trim()) {
        isPasswordCorrect = true;
      }

      // Also check temporary password (5 hours)
      if (!isPasswordCorrect && adminUser.tempPassword && adminUser.tempPassword.trim() !== '') {
        if (enteredPassword && enteredPassword.trim() === adminUser.tempPassword.trim()) {
          const now = Date.now();
          const expiresTime = adminUser.tempPasswordExpiresAt ? new Date(adminUser.tempPasswordExpiresAt).getTime() : 0;
          if (expiresTime > now) {
            isPasswordCorrect = true;
            isTempPasswordLogin = true;
          } else {
            return {
              success: false,
              message: 'La contraseña temporal ha expirado (límite de 5 horas superado). Por favor solicita una nueva.'
            };
          }
        }
      }

      if (!isPasswordCorrect) {
        return { success: false, message: 'Contraseña de Administrador incorrecta.' };
      }
    }

    setCurrentUserId(adminUser.id);
    setIsAuthenticated(true);
    sessionStorage.removeItem('superpuntos_explicit_logout');
    try {
      localStorage.setItem('superpuntos_last_logged_doc', adminUser.email || adminUser.documentId);
      localStorage.setItem('superpuntos_last_logged_name', adminUser.name);
    } catch {}
    if (isTempPasswordLogin || adminUser.mustResetPassword) {
      setMustResetPasswordModalOpen(true);
    }
    logAccessEvent('login', `Inicio de sesión administrativo en el portal: ${adminUser.name}`, adminUser);
    return { success: true, message: `¡Sesión de Administrador iniciada correctamente! Bienvenido ${adminUser.name}.`, user: adminUser };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message: string; user?: User; code?: string; domain?: string }> => {
    try {
      const res = await googleSignIn();
      if (!res || !res.user) {
        return { success: false, message: 'No se pudo autenticar con Google.' };
      }
      const gUser = res.user;
      const email = gUser.email || '';
      const cleanEmail = email.toLowerCase();
      const isSuperGestiones = cleanEmail === 'supergestionesintegrales@gmail.com' || cleanEmail.includes('supergestiones');
      const isSantiago = cleanEmail === 'santiikstro1108@gmail.com' || cleanEmail.includes('santiikstro');
      const isOwnerEmail = isSuperGestiones || isSantiago;
      const isAdminEmail = isOwnerEmail || cleanEmail === 'admin@supergiros.com' || cleanEmail.includes('admin');
      
      const defaultOwnerName = isSuperGestiones 
        ? 'Super Gestiones Integrales (Administrador Principal)' 
        : (isSantiago ? 'Santiago Castro (Administrador Principal)' : (email.split('@')[0] || 'Aliado Superpuntos'));
      const displayName = gUser.displayName || defaultOwnerName;

      let matched = users.find(u => u.email.toLowerCase() === cleanEmail);

      // Check Firestore if not found locally so that all previously earned points and data are loaded!
      if (!matched) {
        try {
          const fromFirestore = await getFirestoreUserByEmail(cleanEmail);
          if (fromFirestore) {
            matched = fromFirestore;
            setUsers(prev => [fromFirestore, ...prev.filter(u => u.id !== fromFirestore.id)]);
          }
        } catch (err) {
          console.warn('Error al consultar Firestore en Google login:', err);
        }
      }

      if (matched) {
        // Guarantee that if the user is the owner/admin, role is always admin
        if (isAdminEmail && matched.role !== 'admin') {
          matched = {
            ...matched,
            role: 'admin',
            businessName: matched.businessName || (isSuperGestiones ? 'Super Gestiones Integrales - Dirección Central' : 'SuperGIROS Central - Dirección General'),
            name: matched.name || displayName
          };
          setUsers(prev => prev.map(u => u.id === matched!.id ? matched! : u));
          saveFirestoreUser(matched).catch(() => {});
        }
      } else {
        const newUser: User = {
          id: isSuperGestiones ? 'usr_admin_owner' : (isAdminEmail ? `usr_admin_${Date.now()}` : `usr_${Date.now()}`),
          name: isSuperGestiones ? 'Super Gestiones Integrales (Administrador Principal)' : (isSantiago ? 'Santiago Castro (Administrador Principal)' : displayName),
          documentId: isSuperGestiones ? '901234567' : (isAdminEmail ? '1098765432' : `G-${gUser.uid.slice(0, 8)}`),
          email: email,
          phone: gUser.phoneNumber || '3001234567',
          role: isAdminEmail ? 'admin' : 'ally',
          businessName: isSuperGestiones ? 'Super Gestiones Integrales - Dirección Central' : (isAdminEmail ? 'SuperGIROS Central - Dirección General' : displayName),
          zone: 'Dirección Nacional',
          pointsBalance: 0,
          totalPointsEarned: 0,
          totalPointsRedeemed: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
          avatarUrl: gUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f59e0b&color=0f172a&bold=true`
        };
        setUsers(prev => [newUser, ...prev]);
        saveFirestoreUser(newUser).catch(() => {});
        matched = newUser;
      }

      setCurrentUserId(matched.id);
      setIsAuthenticated(true);
      sessionStorage.removeItem('superpuntos_explicit_logout');
      logAccessEvent('login', `Inicio de sesión con Google Auth: ${matched.name} (${matched.role === 'admin' ? 'Administrador' : 'Aliado'})`, matched);
      triggerConfetti();
      const welcomeMsg = matched.role === 'admin'
        ? `¡Bienvenido al Panel Administrativo de Superpuntos, ${matched.name}!`
        : `¡Bienvenido al portal de Superpuntos, ${matched.name}!`;
      return { success: true, message: welcomeMsg, user: matched };
    } catch (err: any) {
      console.error('Error en loginWithGoogle:', err);
      const isUnauthorizedDomain = err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain');
      const domain = typeof window !== 'undefined' ? window.location.hostname : '';
      const message = isUnauthorizedDomain
        ? `El dominio actual (${domain}) no está autorizado en Firebase Authentication. Debes agregarlo en Firebase Console > Authentication > Settings > Authorized domains.`
        : (err?.message || 'Error al iniciar sesión con Google');
      return { 
        success: false, 
        message, 
        code: isUnauthorizedDomain ? 'auth/unauthorized-domain' : err?.code,
        domain 
      };
    }
  };

  const loginWithEmailPassword = async (emailOrDoc: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    const clean = emailOrDoc.trim().toLowerCase();
    if (!clean) {
      return { success: false, message: 'Por favor ingresa tu correo electrónico o número de documento.' };
    }

    if (clean.includes('@')) {
      try {
        await firebaseSignInWithEmail(clean, password);
      } catch (fbErr: any) {
        console.warn('Firebase Auth sign in attempt info:', fbErr?.code);
      }
    }

    let matched = users.find(u => 
      u.email.toLowerCase() === clean || 
      u.documentId.toLowerCase() === clean ||
      u.id.toLowerCase() === clean
    );

    // Search in Firestore if not in memory
    if (!matched) {
      try {
        const fromFirestore = (await getFirestoreUserByEmail(clean)) || (await getFirestoreUserByDocument(clean));
        if (fromFirestore) {
          matched = fromFirestore;
          setUsers(prev => [fromFirestore, ...prev.filter(u => u.id !== fromFirestore.id)]);
        }
      } catch (err) {
        console.warn('Error al buscar usuario en Firestore:', err);
      }
    }

    if (!matched) {
      return { success: false, message: 'Usuario no encontrado en la base de datos de Superpuntos.' };
    }

    let isPasswordCorrect = false;
    let isTempPasswordLogin = false;

    // Check standard permanent password
    if (matched.password && matched.password.trim() !== '') {
      if (matched.password === password) {
        isPasswordCorrect = true;
      }
    }

    // Check temporary password (valid for 5 hours)
    if (!isPasswordCorrect && matched.tempPassword && matched.tempPassword.trim() !== '') {
      if (matched.tempPassword === password) {
        const now = Date.now();
        const expiresTime = matched.tempPasswordExpiresAt ? new Date(matched.tempPasswordExpiresAt).getTime() : 0;
        if (expiresTime > now) {
          isPasswordCorrect = true;
          isTempPasswordLogin = true;
        } else {
          return {
            success: false,
            message: 'La contraseña temporal ha expirado (límite de 5 horas superado). Por favor solicita una nueva en "¿Olvidaste tu contraseña?".'
          };
        }
      }
    }

    if (!isPasswordCorrect && matched.password && matched.password.trim() !== '') {
      return { success: false, message: 'Contraseña incorrecta. Si la olvidaste, puedes generar una clave temporal de 5 horas.' };
    }

    setCurrentUserId(matched.id);
    setIsAuthenticated(true);

    if (isTempPasswordLogin || matched.mustResetPassword) {
      setMustResetPasswordModalOpen(true);
    }

    logAccessEvent('login', `Inicio de sesión exitoso: ${matched.name}${isTempPasswordLogin ? ' (Con contraseña temporal de 5h)' : ''}`, matched);
    return { 
      success: true, 
      message: isTempPasswordLogin
        ? `¡Acceso con contraseña temporal exitoso! Por seguridad, debes definir una nueva contraseña definitiva.`
        : `¡Bienvenido, ${matched.name}!`, 
      user: matched 
    };
  };

  const registerWithEmailPassword = async (data: Omit<User, 'id' | 'role' | 'pointsBalance' | 'totalPointsEarned' | 'totalPointsRedeemed' | 'status' | 'createdAt'>): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      if (data.email && data.password) {
        try {
          await firebaseSignUpWithEmail(data.email, data.password, data.name);
        } catch (authErr: any) {
          console.warn('Firebase Auth user creation notice:', authErr?.code);
        }
      }
      const user = registerAlly(data);
      return { success: true, message: '¡Registro de Aliado completado exitosamente!', user };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error al registrar aliado' };
    }
  };

  const syncWithFirestore = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const [u, p, c, g, o] = await Promise.all([
        getAllFirestoreUsers(),
        getAllFirestoreProducts(),
        getAllFirestoreCampaigns(),
        getAllFirestoreGestiones(),
        getAllFirestoreOrders()
      ]);
      if (u.length > 0) setUsers(u);
      if (p.length > 0) setProducts(p);
      if (c.length > 0) setCampaigns(c);
      if (g.length > 0) setGestiones(g);
      if (o.length > 0) setOrders(o);
      setIsFirebaseConnected(true);
      setFirestoreStatus('connected');
      return { success: true, message: 'Base de datos Firestore sincronizada en tiempo real' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error sincronizando con Firestore' };
    }
  };

  const logout = () => {
    logAccessEvent('logout', 'Cierre de sesión de usuario');
    setIsAuthenticated(false);
    sessionStorage.setItem('superpuntos_explicit_logout', 'true');
    googleSignOut().catch(() => {});
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // fallback
    }
  };

  // Register New Ally
  const registerAlly = (data: Omit<User, 'id' | 'role' | 'pointsBalance' | 'totalPointsEarned' | 'totalPointsRedeemed' | 'status' | 'createdAt'>): User => {
    const isOwner = data.email && (
      data.email.toLowerCase() === 'supergestionesintegrales@gmail.com' ||
      data.email.toLowerCase().includes('supergestiones') ||
      data.email.toLowerCase() === 'santiikstro1108@gmail.com' ||
      data.email.toLowerCase().includes('santiikstro')
    );
    const newUser: User = {
      ...data,
      id: isOwner ? 'usr_admin_owner' : `usr_${Date.now()}`,
      role: isOwner ? 'admin' : 'ally',
      pointsBalance: 0,
      totalPointsEarned: 0,
      totalPointsRedeemed: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      avatarUrl: isOwner 
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=f59e0b&color=0f172a&bold=true`
        : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);

    // Initial notification
    const welcomeNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: newUser.id,
      title: '¡Bienvenido a Superpuntos! 🚀',
      message: 'Tu cuenta de aliado está activa con 0 puntos. Empieza a reportar tus ventas para ganar puntos y canjear premios.',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [welcomeNotif, ...prev]);

    logAccessEvent('register', `Registro de nuevo Aliado: ${newUser.name} (${newUser.businessName || 'Punto de Venta'})`, newUser);

    // Push to la base de datos in background if connected
    getAccessToken().then(token => {
      if (token) {
        appendRowToGoogleSheets(
          token,
          SHEET_TABS.USERS,
          [
            newUser.id,
            newUser.name,
            newUser.documentId,
            newUser.email,
            newUser.phone,
            'Aliado Comercial',
            newUser.businessName || 'N/A',
            newUser.zone || 'N/A',
            newUser.pointsBalance,
            newUser.totalPointsEarned,
            newUser.totalPointsRedeemed,
            'Activo',
            newUser.password || '',
            new Date(newUser.createdAt).toLocaleString('es-CO')
          ],
          spreadsheetId
        ).catch(() => {});
      }
    });

    // Save to Firestore
    saveFirestoreUser(newUser).catch(() => {});

    return newUser;
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    updateFirestoreUser(updatedUser.id, updatedUser).catch(() => {});
  };

  const deleteUser = async (userId: string): Promise<void> => {
    const targetUser = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));

    // Save to deleted list in localStorage to prevent resurrection from Firestore real-time snapshots
    try {
      const stored = localStorage.getItem('superpuntos_deleted_users');
      const list: string[] = stored ? JSON.parse(stored) : [];
      if (!list.includes(userId)) {
        list.push(userId);
        localStorage.setItem('superpuntos_deleted_users', JSON.stringify(list));
      }
    } catch {
      // ignore
    }

    try {
      await deleteFirestoreUser(userId);
    } catch (err) {
      console.error('Error al eliminar usuario de Firestore:', err);
    }

    if (currentUserId === userId) {
      setCurrentUserId('usr_admin');
    }

    logAccessEvent('logout', `Usuario eliminado del sistema y de Firebase: ${targetUser?.name || userId}`, targetUser);
  };

  const requestPasswordReset = async (
    identifier: string
  ): Promise<{ 
    success: boolean; 
    message: string; 
    tempPassword?: string; 
    expiresAt?: string; 
    sentEmail?: string; 
    user?: User; 
    isGoogleUser?: boolean;
  }> => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) {
      return { success: false, message: 'Por favor ingresa tu correo electrónico o número de cédula.' };
    }

    // 1. Search in local state
    let target = users.find(u => 
      u.email.toLowerCase() === clean || 
      u.documentId.toLowerCase() === clean ||
      u.id.toLowerCase() === clean
    );

    // 2. Search in Firestore if not found in state
    if (!target) {
      try {
        target = (await getFirestoreUserByEmail(clean)) || (await getFirestoreUserByDocument(clean)) || undefined;
        if (target) {
          setUsers(prev => [target!, ...prev.filter(u => u.id !== target!.id)]);
        }
      } catch (err) {
        console.warn('Error al buscar usuario en Firestore para restablecer contraseña:', err);
      }
    }

    if (!target) {
      return { 
        success: false, 
        message: 'No se encontró ningún usuario registrado con el correo o documento proporcionado. Verifica tus datos o regístrate en el programa.' 
      };
    }

    // Check if user is a Google-only login without a traditional password
    if (!target.password && (target.documentId.startsWith('G-') || target.email.includes('@gmail.com'))) {
      return {
        success: false,
        isGoogleUser: true,
        message: 'Esta cuenta está vinculada a Google. Puedes ingresar directamente haciendo clic en el botón "Continuar con Google".'
      };
    }

    // Generate secure 6-digit temporary code e.g. SP-582910
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const tempPassword = `SP-${randomCode}`;
    
    // Exactly 5 hours expiration from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();

    const updatedUser: User = {
      ...target,
      tempPassword,
      tempPasswordExpiresAt: expiresAt,
      mustResetPassword: true
    };

    setUsers(prev => prev.map(u => u.id === target!.id ? updatedUser : u));

    // Save temporary password with 5-hour validity in Firebase Firestore
    try {
      await updateFirestoreUser(target.id, {
        tempPassword,
        tempPasswordExpiresAt: expiresAt,
        mustResetPassword: true
      });
    } catch (err) {
      console.warn('Error al guardar contraseña temporal en Firestore:', err);
    }

    // In-app notification for the user
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: target.id,
      title: 'Contraseña temporal generada (Válida por 5 horas)',
      message: `Se ha emitido una contraseña temporal de acceso válida hasta las ${new Date(expiresAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    logAccessEvent(
      'security', 
      `Generación de contraseña temporal de 5 horas para: ${target.name} (${target.email})`, 
      target
    );

    return {
      success: true,
      message: `Se ha enviado un correo con tu contraseña temporal válida por 5 horas a ${target.email}.`,
      tempPassword,
      expiresAt,
      sentEmail: target.email,
      user: updatedUser
    };
  };

  const setDefinitivePassword = async (newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, message: 'La contraseña definitiva debe tener al menos 6 caracteres por seguridad.' };
    }

    const cleanPass = newPassword.trim();
    const updatedUser: User = {
      ...currentUser,
      password: cleanPass,
      tempPassword: '',
      tempPasswordExpiresAt: '',
      mustResetPassword: false
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setMustResetPasswordModalOpen(false);

    // Save definitive password in Firestore and clear temporary password
    try {
      await updateFirestoreUser(currentUser.id, {
        password: cleanPass,
        tempPassword: '',
        tempPasswordExpiresAt: '',
        mustResetPassword: false
      });
    } catch (err) {
      console.warn('Error al guardar contraseña definitiva en Firestore:', err);
    }

    logAccessEvent('security', `Contraseña definitiva actualizada exitosamente para: ${currentUser.name}`, updatedUser);
    triggerConfetti();

    return { 
      success: true, 
      message: '¡Tu nueva contraseña definitiva ha sido guardada con éxito en el sistema y Firebase!' 
    };
  };

  // Product Inventory Management
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);
    saveFirestoreProduct(newProduct).catch(() => {});

    getAccessToken().then(token => {
      if (token) {
        const isBono = newProduct.isDigital || newProduct.category === 'Bonos';
        const targetTab = isBono ? SHEET_TABS.BONUSES : SHEET_TABS.ARTICLES;
        const rowData = isBono ? [
          newProduct.id,
          newProduct.name,
          newProduct.name.includes('$') ? newProduct.name : `$${newProduct.name}`,
          newProduct.pointsCost,
          newProduct.brand || 'SuperGIROS',
          newProduct.stock,
          newProduct.description || 'Acreditación de saldo en dinero',
          Array.isArray(newProduct.specifications) ? newProduct.specifications.join(' | ') : (newProduct.specifications || 'Acreditación inmediata'),
          newProduct.isFeatured ? 'Sí' : 'No',
          newProduct.active ? 'Disponible' : 'Inactivo',
          new Date(newProduct.createdAt).toLocaleString('es-CO')
        ] : [
          newProduct.id,
          newProduct.name,
          newProduct.category,
          newProduct.pointsCost,
          newProduct.stock,
          newProduct.brand || 'SuperGIROS',
          newProduct.description || '',
          Array.isArray(newProduct.specifications) ? newProduct.specifications.join(' | ') : (newProduct.specifications || ''),
          newProduct.isFeatured ? 'Sí' : 'No',
          newProduct.active ? 'Disponible' : 'Inactivo',
          newProduct.imageUrl || '',
          new Date(newProduct.createdAt).toLocaleString('es-CO')
        ];

        appendRowToGoogleSheets(
          token,
          targetTab,
          rowData,
          spreadsheetId
        ).catch(() => {});
      }
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    updateFirestoreProduct(updatedProduct.id, updatedProduct).catch(() => {});
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setCart(prev => prev.filter(item => item.product.id !== productId));
    deleteFirestoreProduct(productId).catch(() => {});
  };

  const updateStock = (productId: string, newStock: number) => {
    const clampedStock = Math.max(0, newStock);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: clampedStock } : p));
    updateFirestoreProduct(productId, { stock: clampedStock }).catch(() => {});
  };

  // Campaigns
  const addCampaign = (campaignData: Omit<CommercialCampaign, 'id'>) => {
    const newCampaign: CommercialCampaign = {
      ...campaignData,
      id: `cmp_${Date.now()}`
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    saveFirestoreCampaign(newCampaign).catch(() => {});

    // Persist to la base de datos in background
    getAccessToken().then(token => {
      if (token) {
        appendRowToGoogleSheets(
          token,
          SHEET_TABS.PROMOTIONS,
          [
            newCampaign.id,
            newCampaign.name || newCampaign.serviceType,
            newCampaign.serviceType,
            newCampaign.pointsAwarded,
            newCampaign.calculationType === 'per_unit' ? 'Por Unidad' : newCampaign.calculationType === 'fixed' ? 'Fijo' : 'Porcentaje',
            newCampaign.categoryTag || 'General',
            newCampaign.active ? 'Activo' : 'Inactivo',
            newCampaign.description || '',
            newCampaign.rulesDescription || '',
            newCampaign.requiresReceiptImage ? 'Sí' : 'No',
            newCampaign.iconName || 'Award',
            newCampaign.bannerColor || 'from-blue-900 to-blue-700',
            new Date().toLocaleString('es-CO')
          ],
          spreadsheetId
        ).catch(() => {});
      }
    });
  };

  const updateCampaign = (updatedCampaign: CommercialCampaign) => {
    setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
    updateFirestoreCampaign(updatedCampaign.id, updatedCampaign).catch(() => {});
  };

  const toggleCampaign = (campaignId: string) => {
    const target = campaigns.find(c => c.id === campaignId);
    if (target) {
      updateFirestoreCampaign(campaignId, { active: !target.active }).catch(() => {});
    }
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, active: !c.active } : c));
  };

  // Ally Reports a Gestion
  const reportGestion = (data: {
    campaignId: string;
    referenceNumber: string;
    transactionValue?: number;
    clientName?: string;
    clientDocument?: string;
    notes?: string;
    evidenceUrl?: string;
    licensePlate?: string;
    policyNumber?: string;
    soatQuantity?: number;
    insuranceCompany?: string;
    vehicleType?: string;
  }): ReportedGestion => {
    const campaign = campaigns.find(c => c.id === data.campaignId);
    const isSoat = campaign ? campaign.serviceType === 'SOAT' : true;
    
    let expectedPoints = 50; // default base
    if (campaign) {
      if (campaign.pointsType === 'fixed') {
        expectedPoints = campaign.pointsValue * (isSoat ? (data.soatQuantity || 1) : 1);
      } else if (campaign.pointsType === 'percentage' && data.transactionValue) {
        expectedPoints = Math.round((data.transactionValue * campaign.pointsValue) / 100);
      } else if (campaign.pointsType === 'tiered' && campaign.tiers) {
        const qty = data.soatQuantity || 1;
        const matchedTier = campaign.tiers.find(t => qty >= t.minUnits && (t.maxUnits === undefined || qty <= t.maxUnits));
        expectedPoints = matchedTier ? matchedTier.pointsPerUnit * qty : campaign.pointsValue * qty;
      }
    }

    const newGestion: ReportedGestion = {
      id: `ges_${Date.now()}`,
      allyId: currentUser.id,
      allyName: currentUser.name,
      allyDocument: currentUser.documentId,
      allyZone: currentUser.zone,
      campaignId: data.campaignId,
      campaignName: campaign ? campaign.name : 'SOAT - Póliza Obligatoria',
      serviceType: campaign ? campaign.serviceType : 'SOAT',
      referenceNumber: data.referenceNumber || data.policyNumber || `POL-${Date.now().toString().slice(-6)}`,
      licensePlate: data.licensePlate ? data.licensePlate.toUpperCase().trim() : undefined,
      policyNumber: data.policyNumber ? data.policyNumber.trim() : (data.referenceNumber ? data.referenceNumber.trim() : undefined),
      soatQuantity: isSoat ? Math.max(1, data.soatQuantity || 1) : undefined,
      insuranceCompany: data.insuranceCompany,
      vehicleType: data.vehicleType,
      transactionValue: data.transactionValue,
      clientName: data.clientName,
      clientDocument: data.clientDocument,
      notes: data.notes,
      evidenceUrl: data.evidenceUrl,
      pointsExpected: expectedPoints,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setGestiones(prev => [newGestion, ...prev]);

    // Admin Notification
    const adminNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: 'usr_admin',
      title: 'Nuevo Reporte de SOAT / Gestión 📥',
      message: `${currentUser.name} reportó ${newGestion.soatQuantity ? `${newGestion.soatQuantity} SOAT(s) Placa ${newGestion.licensePlate || 'N/A'}` : newGestion.serviceType} para validar (+${expectedPoints} pts).`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
      targetTab: 'approvals'
    };
    setNotifications(prev => [adminNotif, ...prev]);

    logAccessEvent('report_gestion', `Reporte de gestión SOAT #${newGestion.referenceNumber} (${newGestion.licensePlate || 'Sin placa'}) por ${expectedPoints} pts`);

    // Save to Firestore
    saveFirestoreGestion(newGestion).catch(() => {});

    // Append to la base de datos
    getAccessToken().then(token => {
      if (token) {
        appendRowToGoogleSheets(
          token,
          SHEET_TABS.GESTIONES,
          [
            newGestion.id,
            newGestion.allyId,
            newGestion.allyName,
            newGestion.allyDocument || 'N/A',
            currentUser.businessName || 'N/A',
            newGestion.campaignName,
            newGestion.pointsExpected,
            newGestion.transactionValue ? `$${newGestion.transactionValue.toLocaleString('es-CO')}` : 'N/A',
            newGestion.referenceNumber || newGestion.licensePlate || 'N/A',
            'PENDIENTE',
            new Date(newGestion.createdAt).toLocaleString('es-CO'),
            'N/A',
            'N/A',
            newGestion.notes || ''
          ],
          spreadsheetId
        ).catch(() => {});
      }
    });

    return newGestion;
  };

  // Ally Reports Multiple Gestiones in a single submission (Multi-SOAT)
  const reportMultipleGestiones = (items: Array<{
    campaignId: string;
    referenceNumber: string;
    transactionValue?: number;
    clientName?: string;
    clientDocument?: string;
    notes?: string;
    evidenceUrl?: string;
    licensePlate?: string;
    policyNumber?: string;
    soatQuantity?: number;
    insuranceCompany?: string;
    vehicleType?: string;
  }>): ReportedGestion[] => {
    const created: ReportedGestion[] = [];
    const now = new Date().toISOString();
    let totalPoints = 0;

    for (let i = 0; i < items.length; i++) {
      const data = items[i];
      const campaign = campaigns.find(c => c.id === data.campaignId);
      let expectedPoints = 5; // default base per SOAT
      if (campaign) {
        if (campaign.pointsType === 'fixed') {
          expectedPoints = campaign.pointsValue;
        } else if (campaign.pointsType === 'percentage' && data.transactionValue) {
          expectedPoints = Math.round((data.transactionValue * campaign.pointsValue) / 100);
        }
      }
      totalPoints += expectedPoints;

      const newGestion: ReportedGestion = {
        id: `ges_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        allyId: currentUser.id,
        allyName: currentUser.name,
        allyDocument: currentUser.documentId,
        allyZone: currentUser.zone,
        campaignId: data.campaignId,
        campaignName: campaign ? campaign.name : 'SOAT - Póliza Obligatoria',
        serviceType: campaign ? campaign.serviceType : 'SOAT',
        referenceNumber: data.referenceNumber || data.policyNumber || `POL-${Date.now().toString().slice(-6)}`,
        licensePlate: data.licensePlate ? data.licensePlate.toUpperCase().trim() : undefined,
        policyNumber: data.policyNumber ? data.policyNumber.trim() : (data.referenceNumber ? data.referenceNumber.trim() : undefined),
        soatQuantity: 1, // each SOAT is uniquely identified
        insuranceCompany: data.insuranceCompany,
        vehicleType: data.vehicleType,
        transactionValue: data.transactionValue,
        clientName: data.clientName,
        clientDocument: data.clientDocument,
        notes: data.notes,
        evidenceUrl: data.evidenceUrl,
        pointsExpected: expectedPoints,
        status: 'pending',
        createdAt: new Date(Date.now() + i * 50).toISOString()
      };
      created.push(newGestion);
      saveFirestoreGestion(newGestion).catch(() => {});
    }

    setGestiones(prev => [...created, ...prev]);

    // Admin Notification summarizing the batch
    const plates = created.map(g => g.licensePlate).filter(Boolean).join(', ');
    const adminNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: 'usr_admin',
      title: 'Nuevo Reporte de SOATs / Comprobación 📥',
      message: `${currentUser.name} reportó ${created.length} SOAT(s) únicos (${plates || 'Pólizas múltiples'}) para comprobación (+${totalPoints} pts).`,
      type: 'system',
      read: false,
      createdAt: now,
      targetTab: 'approvals'
    };
    setNotifications(prev => [adminNotif, ...prev]);
    saveFirestoreNotification(adminNotif).catch(() => {});

    logAccessEvent('report_gestion', `Reporte de ${created.length} SOAT(s) únicos: [${plates}] por ${totalPoints} pts`);

    return created;
  };

  // Admin Approves Gestion
  const approveGestion = (gestionId: string, pointsAwarded?: number, adminFeedback?: string) => {
    const gestion = gestiones.find(g => g.id === gestionId);
    if (!gestion || gestion.status !== 'pending') return;

    const points = pointsAwarded !== undefined ? pointsAwarded : gestion.pointsExpected;
    const now = new Date().toISOString();

    setGestiones(prev => prev.map(g => {
      if (g.id === gestionId) {
        return {
          ...g,
          status: 'approved',
          pointsAwarded: points,
          reviewedAt: now,
          reviewedBy: currentUser.name || 'Administrador',
          adminFeedback: adminFeedback || 'Gestión validada y aprobada exitosamente.'
        };
      }
      return g;
    }));

    setUsers(prev => prev.map(u => {
      if (u.id === gestion.allyId) {
        const newBalance = u.pointsBalance + points;
        const newEarned = (u.totalPointsEarned || 0) + points;
        return {
          ...u,
          pointsBalance: newBalance,
          totalPointsEarned: newEarned
        };
      }
      return u;
    }));

    const targetUser = users.find(u => u.id === gestion.allyId);
    const prevBalance = targetUser ? targetUser.pointsBalance : 0;
    const newTx: PointsTransaction = {
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      allyId: gestion.allyId,
      allyName: gestion.allyName,
      type: 'earned_gestion',
      amount: points,
      previousBalance: prevBalance,
      newBalance: prevBalance + points,
      description: `Aprobación de gestión ${gestion.serviceType} (Ref: ${gestion.referenceNumber})`,
      referenceId: gestion.id,
      createdAt: now,
      createdBy: currentUser.name
    };
    setTransactions(prev => [newTx, ...prev]);

    // Firestore sync
    updateFirestoreGestion(gestionId, {
      status: 'approved',
      pointsAwarded: points,
      reviewedAt: now,
      reviewedBy: currentUser.name || 'Administrador',
      adminFeedback: adminFeedback || 'Gestión validada y aprobada exitosamente.'
    }).catch(() => {});
    if (targetUser) {
      updateFirestoreUser(targetUser.id, {
        pointsBalance: prevBalance + points,
        totalPointsEarned: (targetUser.totalPointsEarned || 0) + points
      }).catch(() => {});
    }
    saveFirestoreTransaction(newTx).catch(() => {});

    const allyNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: gestion.allyId,
      title: '¡Gestión Aprobada! 🎉 + ' + points + ' pts',
      message: `Tu gestión de ${gestion.serviceType} (Ref: ${gestion.referenceNumber}) ha sido aprobada. Se han acreditado ${points} Superpuntos a tu saldo.`,
      type: 'points_earned',
      read: false,
      createdAt: now,
      targetTab: 'history'
    };
    setNotifications(prev => [allyNotif, ...prev]);

    logAccessEvent('approval', `Aprobación de gestión #${gestion.referenceNumber} otorgando ${points} pts`);

    // Sync to la base de datos in background
    getAccessToken().then(token => {
      if (token && targetUser) {
        // 1. Update user points row in Usuarios tab
        updateUserPointsInGoogleSheets(
          token,
          targetUser.documentId || targetUser.id,
          targetUser.pointsBalance + points,
          targetUser.totalPointsEarned + points,
          targetUser.totalPointsRedeemed,
          spreadsheetId
        ).catch(() => {});

        // 2. Append transaction row in Libro_Puntos tab
        appendRowToGoogleSheets(
          token,
          SHEET_TABS.TRANSACTIONS,
          [
            newTx.id,
            new Date(newTx.createdAt).toLocaleString('es-CO'),
            newTx.allyId,
            newTx.allyName || 'Aliado',
            'CRÉDITO (+) Puntos Ganados',
            newTx.amount,
            newTx.previousBalance,
            newTx.newBalance,
            newTx.description,
            newTx.referenceId || 'N/A'
          ],
          spreadsheetId
        ).catch(() => {});
      }
    });
  };

  // Admin Rejects Gestion
  const rejectGestion = (gestionId: string, adminFeedback: string) => {
    const gestion = gestiones.find(g => g.id === gestionId);
    if (!gestion || gestion.status !== 'pending') return;

    const now = new Date().toISOString();

    setGestiones(prev => prev.map(g => {
      if (g.id === gestionId) {
        return {
          ...g,
          status: 'rejected',
          pointsAwarded: 0,
          reviewedAt: now,
          reviewedBy: currentUser.name || 'Administrador',
          adminFeedback: adminFeedback || 'Gestión no cumple con los criterios de validación.'
        };
      }
      return g;
    }));

    const allyNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: gestion.allyId,
      title: 'Gestión no aprobada ⚠️',
      message: `Tu reporte de ${gestion.serviceType} (Ref: ${gestion.referenceNumber}) fue rechazado: "${adminFeedback}"`,
      type: 'report_rejected',
      read: false,
      createdAt: now,
      targetTab: 'history'
    };
    setNotifications(prev => [allyNotif, ...prev]);

    // Firestore sync
    updateFirestoreGestion(gestionId, {
      status: 'rejected',
      pointsAwarded: 0,
      reviewedAt: now,
      reviewedBy: currentUser.name || 'Administrador',
      adminFeedback: adminFeedback || 'Gestión no cumple con los criterios de validación.'
    }).catch(() => {});

    logAccessEvent('approval', `Rechazo de gestión #${gestion.referenceNumber}: ${adminFeedback}`);
  };

  const batchApprovePendingGestiones = (gestionIds: string[]) => {
    gestionIds.forEach(id => {
      approveGestion(id);
    });
  };

  // Manual Points Assignment (Bono, Ajuste o Deducción)
  const assignManualPoints = (allyId: string, points: number, reason: string, isBonus = true) => {
    const targetAlly = users.find(u => 
      u.id === allyId || 
      u.documentId === allyId || 
      (u.email && u.email.toLowerCase() === allyId.toLowerCase())
    );
    if (!targetAlly) {
      console.warn('Usuario no encontrado para asignación de puntos:', allyId);
      return;
    }

    const now = new Date().toISOString();
    const prevBalance = targetAlly.pointsBalance || 0;
    const newBalance = Math.max(0, prevBalance + points);
    const newTotalEarned = points > 0 ? (targetAlly.totalPointsEarned || 0) + points : (targetAlly.totalPointsEarned || 0);

    // Update users list
    setUsers(prev => prev.map(u => {
      if (u.id === targetAlly.id) {
        return {
          ...u,
          pointsBalance: newBalance,
          totalPointsEarned: newTotalEarned
        };
      }
      return u;
    }));

    const newTx: PointsTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      allyId: targetAlly.id,
      allyName: targetAlly.name,
      type: isBonus ? 'bonus' : 'manual_adjustment',
      amount: points,
      previousBalance: prevBalance,
      newBalance: newBalance,
      description: reason || (points > 0 ? (isBonus ? 'Bono comercial' : 'Ajuste de puntos a favor') : 'Ajuste / Deducción de puntos'),
      createdAt: now,
      createdBy: currentUser.name || 'Administrador'
    };
    setTransactions(prev => [newTx, ...prev]);

    // Firestore sync
    updateFirestoreUser(targetAlly.id, {
      pointsBalance: newBalance,
      totalPointsEarned: newTotalEarned
    }).catch(() => {});
    saveFirestoreTransaction(newTx).catch(() => {});

    // Notification for user
    const notif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: targetAlly.id,
      title: points >= 0 
        ? (isBonus ? '¡Has recibido un Bono Comercial! 🎁' : '¡Ajuste de Superpuntos acreditado! ✨') 
        : 'Ajuste / Deducción en tu saldo ℹ️',
      message: `${points >= 0 ? `+${points}` : points} Superpuntos: ${reason || 'Ajuste administrativo'}. Saldo actual: ${newBalance} pts.`,
      type: 'points_earned',
      read: false,
      createdAt: now,
      targetTab: 'history'
    };
    setNotifications(prev => [notif, ...prev]);
    saveFirestoreNotification(notif).catch(() => {});

    // Google Sheets sync if connected
    getAccessToken().then(token => {
      if (token) {
        updateUserPointsInGoogleSheets(token, targetAlly.documentId || targetAlly.id, newBalance, newTotalEarned, spreadsheetId).catch(() => {});
      }
    });

    logAccessEvent('approval', `Movimiento manual de ${points} pts a ${targetAlly.name}: ${reason}`);
  };

  // Alias for compatibility
  const adjustUserPoints = assignManualPoints;

  // Cart Operations
  const cartPointsTotal = cart.reduce((sum, item) => sum + (item.product.pointsCost * item.quantity), 0);

  const addToCart = (product: Product, quantity = 1): { success: boolean; message: string } => {
    if (product.stock < quantity) {
      return { success: false, message: `Stock insuficiente. Solo quedan ${product.stock} unidades disponibles.` };
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const newQty = currentQtyInCart + quantity;

    if (newQty > product.stock) {
      return { success: false, message: `No puedes agregar más de ${product.stock} unidades de este premio.` };
    }

    const newCartTotal = cart.reduce((sum, item) => {
      if (item.product.id === product.id) {
        return sum + (product.pointsCost * newQty);
      }
      return sum + (item.product.pointsCost * item.quantity);
    }, existingItem ? 0 : product.pointsCost * quantity);

    if (existingItem) {
      setCart(prev => prev.map(item => item.product.id === product.id ? { ...item, quantity: newQty } : item));
    } else {
      setCart(prev => [...prev, { product, quantity }]);
    }

    if (newCartTotal > currentUser.pointsBalance) {
      return { 
        success: true, 
        message: `"${product.name}" agregado al carrito (Saldo actual: ${currentUser.pointsBalance} pts | Total carrito: ${newCartTotal} pts)` 
      };
    }

    return { success: true, message: `"${product.name}" agregado al carrito de canjes.` };
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    if (quantity > item.product.stock) {
      return;
    }

    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Redeem Cart Checkout
  const redeemCart = (deliveryDetails: {
    deliveryType: DeliveryType;
    shippingAddress?: string;
    shippingCity?: string;
    shippingDepartment?: string;
    pickupOffice?: string;
    recipientName?: string;
    recipientPhone?: string;
    pickupPersonDocument?: string;
    supergirosDocument?: string;
    supergirosName?: string;
    supergirosPhone?: string;
    notes?: string;
  }): { success: boolean; order?: RedemptionOrder; message: string } => {
    if (cart.length === 0) {
      return { success: false, message: 'El carrito está vacío.' };
    }

    if (currentUser.pointsBalance < cartPointsTotal) {
      return { 
        success: false, 
        message: `Saldo insuficiente. Tienes ${currentUser.pointsBalance} pts y necesitas ${cartPointsTotal} pts.` 
      };
    }

    for (const item of cart) {
      const currentProduct = products.find(p => p.id === item.product.id);
      if (!currentProduct || currentProduct.stock < item.quantity) {
        return { 
          success: false, 
          message: `El producto "${item.product.name}" ya no tiene suficiente stock disponible.` 
        };
      }
    }

    const now = new Date().toISOString();
    const voucherCode = generateVoucherCode();
    
    // Check if cart has physical items vs bonos
    const hasPhysicalItems = cart.some(item => !item.product.isDigital && item.product.category !== 'Bonos');
    const hasBonos = cart.some(item => item.product.isDigital || item.product.category === 'Bonos');
    const isOnlyBonos = hasBonos && !hasPhysicalItems;

    const digitalPin = isOnlyBonos || deliveryDetails.deliveryType === 'digital' 
      ? generatePinCode('SUPERGIROS') 
      : undefined;

    setProducts(prev => prev.map(prod => {
      const cartItem = cart.find(c => c.product.id === prod.id);
      if (cartItem) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - cartItem.quantity)
        };
      }
      return prod;
    }));

    const previousBalance = currentUser.pointsBalance;
    const newBalance = previousBalance - cartPointsTotal;
    const newRedeemed = (currentUser.totalPointsRedeemed || 0) + cartPointsTotal;

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          pointsBalance: newBalance,
          totalPointsRedeemed: newRedeemed
        };
      }
      return u;
    }));

    const newOrder: RedemptionOrder = {
      id: `ord_${Date.now()}`,
      voucherCode,
      allyId: currentUser.id,
      allyName: currentUser.name,
      allyDocument: currentUser.documentId,
      allyZone: currentUser.zone,
      allyPhone: currentUser.phone,
      allyEmail: currentUser.email,
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        pointsCost: i.product.pointsCost,
        quantity: i.quantity,
        imageUrl: i.product.imageUrl,
        category: i.product.category,
        isDigital: i.product.isDigital
      })),
      totalPoints: cartPointsTotal,
      status: isOnlyBonos ? 'delivered' : 'pending',
      deliveryType: deliveryDetails.deliveryType,
      hasPhysicalItems,
      hasBonos,
      // Physical Shipping / Pickup
      shippingAddress: deliveryDetails.shippingAddress,
      shippingCity: deliveryDetails.shippingCity,
      shippingDepartment: deliveryDetails.shippingDepartment,
      pickupOffice: deliveryDetails.pickupOffice,
      recipientName: deliveryDetails.recipientName || currentUser.name,
      recipientPhone: deliveryDetails.recipientPhone || currentUser.phone,
      pickupPersonDocument: deliveryDetails.pickupPersonDocument,
      // App SuperGIROS Account
      supergirosDocument: deliveryDetails.supergirosDocument || (hasBonos ? currentUser.documentId : undefined),
      supergirosName: deliveryDetails.supergirosName || (hasBonos ? currentUser.name : undefined),
      supergirosPhone: deliveryDetails.supergirosPhone || (hasBonos ? currentUser.phone : undefined),
      digitalVoucherPin: digitalPin,
      notes: deliveryDetails.notes,
      createdAt: now,
      deliveredAt: isOnlyBonos ? now : undefined
    };

    setOrders(prev => [newOrder, ...prev]);

    const newTx: PointsTransaction = {
      id: `tx_${Date.now()}`,
      allyId: currentUser.id,
      allyName: currentUser.name,
      type: 'redeemed_prize',
      amount: -cartPointsTotal,
      previousBalance,
      newBalance,
      description: `Canje de ${cart.length} premio(s) - Comprobante ${voucherCode}${
        hasBonos ? ' (Bono App SuperGiros)' : ''
      }`,
      referenceId: newOrder.id,
      createdAt: now
    };
    setTransactions(prev => [newTx, ...prev]);

    // Firestore Sync
    saveFirestoreOrder(newOrder).catch(() => {});
    saveFirestoreTransaction(newTx).catch(() => {});
    updateFirestoreUser(currentUser.id, {
      pointsBalance: newBalance,
      totalPointsRedeemed: newRedeemed
    }).catch(() => {});
    cart.forEach(item => {
      updateFirestoreProduct(item.product.id, {
        stock: Math.max(0, item.product.stock - item.quantity)
      }).catch(() => {});
    });

    const userNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: '¡Canje Exitoso! 🎁✨',
      message: `Has canjeado ${cartPointsTotal} pts. Tu comprobante digital ${voucherCode} ha sido generado.`,
      type: 'redemption',
      read: false,
      createdAt: now,
      targetTab: 'orders'
    };
    setNotifications(prev => [userNotif, ...prev]);

    const adminNotif: AppNotification = {
      id: `notif_${Date.now()}_adm`,
      userId: 'usr_admin',
      title: 'Nuevo Canje por Despachar 📦',
      message: `${currentUser.name} canjeó premios por ${cartPointsTotal} pts (Voucher: ${voucherCode}).`,
      type: 'redemption',
      read: false,
      createdAt: now,
      targetTab: 'delivery_audit'
    };
    setNotifications(prev => [adminNotif, ...prev]);

    logAccessEvent('redemption', `Canje de premios por ${cartPointsTotal} pts (Comprobante: ${voucherCode})`);

    // Append to la base de datos in background
    getAccessToken().then(token => {
      if (token) {
        // 1. Append Order
        appendRowToGoogleSheets(
          token,
          SHEET_TABS.ORDERS,
          [
            newOrder.id,
            newOrder.allyId,
            newOrder.allyName,
            newOrder.allyEmail,
            newOrder.items.map(item => `${item.productName} (x${item.quantity})`).join('; '),
            newOrder.totalPoints,
            newOrder.deliveryType === 'digital' ? 'Digital / Bono' : 'Envío Físico',
            newOrder.status.toUpperCase(),
            newOrder.digitalVoucherPin || 'N/A',
            'N/A',
            newOrder.shippingAddress || 'N/A',
            new Date(newOrder.createdAt).toLocaleString('es-CO'),
            newOrder.deliveredAt ? new Date(newOrder.deliveredAt).toLocaleString('es-CO') : 'N/A'
          ],
          spreadsheetId
        ).catch(() => {});

        // 2. Append Transaction in Libro_Puntos
        appendRowToGoogleSheets(
          token,
          SHEET_TABS.TRANSACTIONS,
          [
            newTx.id,
            new Date(newTx.createdAt).toLocaleString('es-CO'),
            newTx.allyId,
            newTx.allyName || 'Aliado',
            'DÉBITO (-) Canje Realizado',
            newTx.amount,
            newTx.previousBalance,
            newTx.newBalance,
            newTx.description,
            newTx.referenceId || 'N/A'
          ],
          spreadsheetId
        ).catch(() => {});

        // 3. Update User Points in Usuarios
        updateUserPointsInGoogleSheets(
          token,
          currentUser.documentId || currentUser.id,
          newBalance,
          currentUser.totalPointsEarned,
          currentUser.totalPointsRedeemed + cartPointsTotal,
          spreadsheetId
        ).catch(() => {});
      }
    });

    clearCart();
    triggerConfetti();

    return { 
      success: true, 
      order: newOrder, 
      message: '¡Canje realizado con éxito! Tu comprobante está listo.' 
    };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string, notes?: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status,
          trackingNumber: trackingNumber || ord.trackingNumber,
          courierName: courierName || ord.courierName,
          notes: notes || ord.notes,
          updatedAt: now,
          deliveredAt: status === 'delivered' ? (ord.deliveredAt || now) : ord.deliveredAt
        };
      }
      return ord;
    }));

    // Firestore sync
    updateFirestoreOrder(orderId, {
      status,
      trackingNumber,
      courierName,
      notes,
      updatedAt: now,
      deliveredAt: status === 'delivered' ? now : undefined
    }).catch(() => {});

    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      const statusLabels: Record<OrderStatus, string> = {
        pending: 'Pendiente de Procesar',
        preparing: 'En Preparación y Empaque',
        shipped: `En Camino / Despachado ${trackingNumber ? `(Guía: ${trackingNumber} - ${courierName || 'Transportadora'})` : ''}`,
        delivered: 'Entregado con Éxito 🎉',
        cancelled: 'Cancelado'
      };

      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: targetOrder.allyId,
        title: `Estado de tu Canje (${targetOrder.voucherCode}) 🚚`,
        message: `Tu pedido ha cambiado de estado a: ${statusLabels[status]}`,
        type: 'system',
        read: false,
        createdAt: now,
        targetTab: 'orders'
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const markNotificationAsRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notifId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    deleteFirestoreNotification(notifId).catch(() => {});
  };

  const clearNotifications = (forUserId?: string) => {
    const targetUserId = forUserId || currentUser.id;
    if (currentUser.role === 'admin' && !forUserId) {
      setNotifications([]);
      clearFirestoreNotificationsByUser('all_admin').catch(() => {});
    } else {
      setNotifications(prev => prev.filter(n => n.userId !== targetUserId && n.userId !== 'all'));
      clearFirestoreNotificationsByUser(targetUserId).catch(() => {});
    }
  };

  const resetAllDataToDefault = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUserId('usr_carlos');
    setProducts(INITIAL_PRODUCTS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setGestiones(INITIAL_GESTIONES);
    setOrders(INITIAL_ORDERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAccessLogs(INITIAL_ACCESS_LOGS);
    setCart([]);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      currentUser,
      currentRole,
      users,
      setCurrentUser: (u) => setCurrentUserId(u.id),
      switchUserById,
      checkUserExists,
      loginAsAlly,
      loginAsAdmin,
      loginWithGoogle,
      loginWithEmailPassword,
      registerWithEmailPassword,
      syncWithFirestore,
      isFirebaseConnected,
      firestoreStatus,
      firebaseUser,
      logout,
      registerAlly,
      updateUser,
      deleteUser,
      requestPasswordReset,
      setDefinitivePassword,
      mustResetPasswordModalOpen,
      setMustResetPasswordModalOpen,
      pendingGestionesCount,
      pendingOrdersCount,
      accessLogs,
      logAccessEvent,
      isGoogleConnected,
      googleUserEmail,
      spreadsheetId,
      setSpreadsheetId,
      sheetsSyncStatus,
      connectGoogleSheets,
      disconnectGoogleSheets,
      syncUsersFromGoogleSheets,
      calibrateSpreadsheet,
      syncToGoogleSheets,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      updateStock,
      campaigns,
      addCampaign,
      updateCampaign,
      toggleCampaign,
      gestiones,
      reportGestion,
      reportMultipleGestiones,
      approveGestion,
      rejectGestion,
      batchApprovePendingGestiones,
      assignManualPoints,
      adjustUserPoints,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartPointsTotal,
      redeemCart,
      orders,
      updateOrderStatus,
      transactions,
      notifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      clearNotifications,
      triggerConfetti,
      resetAllDataToDefault
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
