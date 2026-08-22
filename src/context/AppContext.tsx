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
  googleSignOut, 
  getAccessToken, 
  setCachedAccessToken 
} from '../services/firebaseAuth';
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
  syncUsersFromGoogleSheets: () => Promise<{ success: boolean; count: number; message: string }>;
  calibrateSpreadsheet: () => Promise<{ success: boolean; message: string; tabsCalibrated: string[] }>;
  logout: () => void;
  registerAlly: (data: Omit<User, 'id' | 'role' | 'pointsBalance' | 'totalPointsEarned' | 'totalPointsRedeemed' | 'status' | 'createdAt'>) => User;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
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

  // Manual Points
  assignManualPoints: (allyId: string, points: number, reason: string, isBonus?: boolean) => void;

  // Cart & Redemptions
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartPointsTotal: number;
  redeemCart: (deliveryDetails: {
    deliveryType: 'shipping' | 'digital' | 'branch_pickup';
    shippingAddress?: string;
    shippingCity?: string;
    shippingDepartment?: string;
    recipientName?: string;
    recipientPhone?: string;
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
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}currentUserId`);
    return saved || 'usr_admin';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}products`);
    if (!saved) return INITIAL_PRODUCTS;
    try {
      return JSON.parse(saved);
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

  // Init Firebase Auth Listener
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
      const result = await googleSignIn();
      if (result) {
        setIsGoogleConnected(true);
        setGoogleUserEmail(result.user.email || null);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error conectando con Google:', err);
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
    const token = await getAccessToken();

    if (!token) {
      // Prompt user to login with Google
      const signInRes = await googleSignIn();
      if (!signInRes?.accessToken) {
        return { success: false, message: 'Se requiere iniciar sesión con Google para sincronizar la hoja de cálculo.' };
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

    // 2. Try fetching from la base de datos if connected
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
          // Merge to state
          setUsers(prev => [sheetFound, ...prev.filter(u => u.id !== sheetFound.id && u.documentId !== sheetFound.documentId)]);
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

    // 2. If not found locally, try live checking la base de datos
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
          }
        }
      } catch {
        // continue
      }
    }

    if (found) {
      // Validate password if user has a password in record
      if (found.password && found.password.trim() !== '') {
        if (!enteredPassword || enteredPassword.trim() !== found.password.trim()) {
          return { 
            success: false, 
            notRegistered: false, 
            message: 'Contraseña incorrecta. Por favor ingresa la contraseña correspondiente a tu cuenta registrada.' 
          };
        }
      }

      setCurrentUserId(found.id);
      setIsAuthenticated(true);
      logAccessEvent('login', `Inicio de sesión exitoso como Aliado: ${found.name}`, found);
      return { success: true, message: `¡Bienvenido al portal, ${found.name}!`, user: found };
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
    const adminUser = users.find(u => 
      u.role === 'admin' && (
        u.email.toLowerCase() === clean || 
        u.documentId.toLowerCase() === clean || 
        u.id.toLowerCase() === clean || 
        clean.includes('admin')
      )
    ) || users.find(u => u.role === 'admin') || INITIAL_USERS[0];

    if (adminUser.password && adminUser.password.trim() !== '') {
      if (!enteredPassword || enteredPassword.trim() !== adminUser.password.trim()) {
        return { success: false, message: 'Contraseña de Administrador incorrecta.' };
      }
    }

    setCurrentUserId(adminUser.id);
    setIsAuthenticated(true);
    logAccessEvent('login', 'Inicio de sesión administrativo en el portal', adminUser);
    return { success: true, message: '¡Sesión de Administrador iniciada correctamente!', user: adminUser };
  };

  const logout = () => {
    logAccessEvent('logout', 'Cierre de sesión de usuario');
    setIsAuthenticated(false);
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
    const newUser: User = {
      ...data,
      id: `usr_${Date.now()}`,
      role: 'ally',
      pointsBalance: 0,
      totalPointsEarned: 0,
      totalPointsRedeemed: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`
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

    return newUser;
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUserId === userId) {
      setCurrentUserId('usr_admin');
    }
  };

  // Product Inventory Management
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);

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
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateStock = (productId: string, newStock: number) => {
    const clampedStock = Math.max(0, newStock);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: clampedStock } : p));
  };

  // Campaigns
  const addCampaign = (campaignData: Omit<CommercialCampaign, 'id'>) => {
    const newCampaign: CommercialCampaign = {
      ...campaignData,
      id: `cmp_${Date.now()}`
    };
    setCampaigns(prev => [newCampaign, ...prev]);

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
            newCampaign.bannerColor || 'from-amber-500 to-orange-600',
            new Date().toLocaleString('es-CO')
          ],
          spreadsheetId
        ).catch(() => {});
      }
    });
  };

  const updateCampaign = (updatedCampaign: CommercialCampaign) => {
    setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
  };

  const toggleCampaign = (campaignId: string) => {
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

    logAccessEvent('approval', `Rechazo de gestión #${gestion.referenceNumber}: ${adminFeedback}`);
  };

  const batchApprovePendingGestiones = (gestionIds: string[]) => {
    gestionIds.forEach(id => {
      approveGestion(id);
    });
  };

  // Manual Points Assignment
  const assignManualPoints = (allyId: string, points: number, reason: string, isBonus = true) => {
    const targetAlly = users.find(u => u.id === allyId);
    if (!targetAlly) return;

    const now = new Date().toISOString();
    const prevBalance = targetAlly.pointsBalance;
    const newBalance = Math.max(0, prevBalance + points);
    const newTotalEarned = points > 0 ? (targetAlly.totalPointsEarned || 0) + points : targetAlly.totalPointsEarned;

    setUsers(prev => prev.map(u => {
      if (u.id === allyId) {
        return {
          ...u,
          pointsBalance: newBalance,
          totalPointsEarned: newTotalEarned
        };
      }
      return u;
    }));

    const newTx: PointsTransaction = {
      id: `tx_${Date.now()}`,
      allyId: targetAlly.id,
      allyName: targetAlly.name,
      type: isBonus ? 'bonus' : 'manual_adjustment',
      amount: points,
      previousBalance: prevBalance,
      newBalance: newBalance,
      description: reason || (points > 0 ? 'Asignación manual de puntos' : 'Ajuste / Deducción manual de puntos'),
      createdAt: now,
      createdBy: currentUser.name
    };
    setTransactions(prev => [newTx, ...prev]);

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: allyId,
      title: points >= 0 ? '¡Has recibido puntos de la administración! 🎁' : 'Ajuste de saldo de puntos ℹ️',
      message: `${points >= 0 ? `+${points}` : points} Superpuntos asignados: ${reason}`,
      type: 'points_earned',
      read: false,
      createdAt: now,
      targetTab: 'history'
    };
    setNotifications(prev => [notif, ...prev]);

    logAccessEvent('approval', `Asignación manual de ${points} pts a ${targetAlly.name}: ${reason}`);
  };

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
    deliveryType: 'shipping' | 'digital' | 'branch_pickup';
    shippingAddress?: string;
    shippingCity?: string;
    shippingDepartment?: string;
    recipientName?: string;
    recipientPhone?: string;
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
    const isOnlyDigital = cart.every(item => item.product.isDigital);
    const digitalPin = isOnlyDigital || deliveryDetails.deliveryType === 'digital' 
      ? generatePinCode('DIGITAL') 
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
      status: isOnlyDigital ? 'delivered' : 'pending',
      deliveryType: deliveryDetails.deliveryType,
      shippingAddress: deliveryDetails.shippingAddress,
      shippingCity: deliveryDetails.shippingCity,
      shippingDepartment: deliveryDetails.shippingDepartment,
      recipientName: deliveryDetails.recipientName || currentUser.name,
      recipientPhone: deliveryDetails.recipientPhone || currentUser.phone,
      digitalVoucherPin: digitalPin,
      notes: deliveryDetails.notes,
      createdAt: now,
      deliveredAt: isOnlyDigital ? now : undefined
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
      description: `Canje de ${cart.length} premio(s) - Comprobante ${voucherCode}`,
      referenceId: newOrder.id,
      createdAt: now
    };
    setTransactions(prev => [newTx, ...prev]);

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
      loginAsAlly,
      loginAsAdmin,
      logout,
      registerAlly,
      updateUser,
      deleteUser,
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
      approveGestion,
      rejectGestion,
      batchApprovePendingGestiones,
      assignManualPoints,
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
