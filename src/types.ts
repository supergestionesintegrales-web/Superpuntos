export type UserRole = 'admin' | 'ally';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  documentId: string; // Cédula o NIT
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  tempPassword?: string;
  tempPasswordExpiresAt?: string; // ISO string (5 hours expiration)
  mustResetPassword?: boolean;
  zone?: string;
  pointsBalance: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  avatarUrl?: string;
  status: UserStatus;
  createdAt: string;
  businessName?: string; // Nombre del Punto de Venta / Negocio
}

export type ProductCategory = 
  | 'Artículos'
  | 'Bonos';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  pointsCost: number;
  stock: number;
  imageUrl: string;
  brand?: string;
  specifications?: string[];
  isDigital?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  active: boolean;
  createdAt: string;
}

export interface CommercialCampaign {
  id: string;
  name?: string;
  description?: string;
  serviceType: string; // e.g. 'SOAT', 'Betplay', 'Giros', 'Seguros', 'Telefonía', etc.
  pointsAwarded: number; // base points or per unit/threshold
  calculationType: 'fixed' | 'percentage' | 'per_unit';
  percentageRate?: number;
  minAmount?: number;
  active: boolean;
  iconName: string;
  rulesDescription: string;
  categoryTag: string;
  requiresReceiptImage?: boolean;
  bannerColor?: string;
}

export type Campaign = CommercialCampaign;


export type GestionStatus = 'pending' | 'approved' | 'rejected';

export interface ReportedGestion {
  id: string;
  allyId: string;
  allyName: string;
  allyDocument: string;
  allyZone: string;
  campaignId: string;
  campaignName: string;
  serviceType: string;
  referenceNumber: string; // Número de Póliza, Factura, Pin o Ticket
  licensePlate?: string; // Placa del vehículo (e.g. ABC123, BGL-412, NVK-88F)
  policyNumber?: string; // Número de Póliza SOAT (e.g. POL-9928123)
  soatQuantity?: number; // Cantidad de SOATs registrados (cada uno = 5 pts)
  insuranceCompany?: string; // Aseguradora (Seguros Mundial, Seguros del Estado, Sura, AXA Colpatria, etc.)
  vehicleType?: string; // Tipo de vehículo (Particular, Moto, Carga, Servicio Público)
  transactionValue?: number; // Monto comercial en $ COP
  clientName?: string;
  clientDocument?: string;
  notes?: string;
  evidenceUrl?: string;
  pointsExpected: number;
  pointsAwarded?: number;
  status: GestionStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminFeedback?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type DeliveryType = 'shipping' | 'digital' | 'branch_pickup' | 'mixed';

export interface OrderItem {
  productId: string;
  productName: string;
  pointsCost: number;
  quantity: number;
  imageUrl: string;
  category: string;
  isDigital?: boolean;
}

export interface RedemptionOrder {
  id: string;
  voucherCode: string; // e.g. SP-2025-7841
  allyId: string;
  allyName: string;
  allyDocument: string;
  allyZone: string;
  allyPhone: string;
  allyEmail: string;
  items: OrderItem[];
  totalPoints: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  hasPhysicalItems?: boolean;
  hasBonos?: boolean;
  // Physical Dispatch (Artículos)
  shippingAddress?: string;
  shippingCity?: string;
  shippingDepartment?: string;
  pickupOffice?: string; // Oficina Principal SuperGIROS seleccionada
  recipientName?: string;
  recipientPhone?: string;
  // App SuperGIROS Details (Bonos de dinero)
  supergirosDocument?: string; // Cédula registrada en App SuperGIROS
  supergirosName?: string; // Nombre registrado en App SuperGIROS
  supergirosPhone?: string; // Teléfono registrado en App SuperGIROS
  // Logistics & Tracking
  digitalVoucherPin?: string;
  trackingNumber?: string;
  courierName?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  deliveredAt?: string;
}

export type TransactionType = 
  | 'earned_gestion' 
  | 'redeemed_prize' 
  | 'manual_adjustment' 
  | 'bonus' 
  | 'refund';

export interface PointsTransaction {
  id: string;
  allyId: string;
  allyName?: string;
  type: TransactionType;
  amount: number; // positive for earn, negative for spend
  previousBalance: number;
  newBalance: number;
  description: string;
  referenceId?: string;
  createdAt: string;
  createdBy?: string;
}

export interface AppNotification {
  id: string;
  userId: string; // or 'all'
  title: string;
  message: string;
  type: 'points_earned' | 'redemption' | 'report_rejected' | 'campaign_new' | 'system' | 'stock_alert';
  read: boolean;
  createdAt: string;
  targetTab?: string;
}

export interface AccessLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  documentId: string;
  role: UserRole;
  eventType: 'login' | 'logout' | 'register' | 'redemption' | 'report_gestion' | 'approval';
  details?: string;
  ipOrDevice?: string;
}


export interface SheetsSyncStatus { lastSyncAt: string | null; status: 'idle' | 'syncing' | 'success' | 'error'; spreadsheetId: string; message?: string; }
