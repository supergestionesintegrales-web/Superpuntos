import { User, Product, CommercialCampaign, ReportedGestion, RedemptionOrder, PointsTransaction, AppNotification, AccessLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_owner',
    name: 'Super Gestiones Integrales (Administrador Principal)',
    documentId: '901234567',
    email: 'supergestionesintegrales@gmail.com',
    phone: '3001234567',
    role: 'admin',
    password: 'SuperGiros2026!',
    zone: 'Dirección Nacional',
    pointsBalance: 0,
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
    avatarUrl: 'https://ui-avatars.com/api/?name=Super+Gestiones&background=f59e0b&color=0f172a&bold=true',
    status: 'active',
    createdAt: '2025-01-01T08:00:00Z',
    businessName: 'Super Gestiones Integrales - Dirección Central'
  },
  {
    id: 'usr_admin_santiago',
    name: 'Santiago Castro',
    documentId: '1098765432',
    email: 'santiikstro1108@gmail.com',
    phone: '3001234567',
    role: 'admin',
    password: 'SuperGiros2026!',
    zone: 'Dirección Nacional',
    pointsBalance: 0,
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
    avatarUrl: 'https://ui-avatars.com/api/?name=Santiago+Castro&background=3b82f6&color=fff&bold=true',
    status: 'active',
    createdAt: '2025-01-01T08:00:00Z',
    businessName: 'SuperGIROS Central - Administrador'
  },
  {
    id: 'usr_admin_principal',
    name: 'Administrador Principal',
    documentId: '900850320',
    email: 'admin@supergiros.com',
    phone: '3009876543',
    role: 'admin',
    password: 'SuperGiros2026!',
    zone: 'Dirección Nacional',
    pointsBalance: 0,
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Principal&background=0f172a&color=fff&bold=true',
    status: 'active',
    createdAt: '2025-01-01T08:00:00Z',
    businessName: 'SuperGIROS Central'
  },
  {
    id: 'usr_admin_sistemas',
    name: 'Administrador Sistemas',
    documentId: '900850321',
    email: 'sistemas@supergiros.com',
    phone: '3009876544',
    role: 'admin',
    password: 'Sistemas2026!',
    zone: 'Tecnología',
    pointsBalance: 0,
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Sistemas&background=0f172a&color=fff&bold=true',
    status: 'active',
    createdAt: '2025-01-01T08:00:00Z',
    businessName: 'SuperGIROS Sistemas'
  },
  {
    id: 'usr_admin_operaciones',
    name: 'Administrador Operaciones',
    documentId: '900850322',
    email: 'operaciones@supergiros.com',
    phone: '3009876545',
    role: 'admin',
    password: 'Operaciones2026!',
    zone: 'Operaciones',
    pointsBalance: 0,
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Operaciones&background=0f172a&color=fff&bold=true',
    status: 'active',
    createdAt: '2025-01-01T08:00:00Z',
    businessName: 'SuperGIROS Operaciones'
  }
];

export const INITIAL_CAMPAIGNS: CommercialCampaign[] = [
  {
    id: 'cmp_soat',
    name: 'SOAT - Póliza Obligatoria de Tránsito',
    description: 'Comercialización y emisión de póliza SOAT para automóviles, camionetas, motos y vehículos particulares o de servicio público.',
    serviceType: 'SOAT',
    pointsAwarded: 5,
    calculationType: 'per_unit',
    active: true,
    iconName: 'Car',
    rulesDescription: 'Registro y validación de póliza SOAT emitida con placa y número de comprobante para verificación oficial en RUNT.',
    categoryTag: 'Seguros Obligatorios',
    requiresReceiptImage: true,
    bannerColor: 'from-amber-500 to-orange-600'
  },
  {
    id: 'cmp_giros',
    name: 'Giros Internacionales y Remesas',
    description: 'Envío y pago de giros internacionales y transferencias hacia cualquier destino.',
    serviceType: 'Giros',
    pointsAwarded: 3,
    calculationType: 'per_unit',
    active: true,
    iconName: 'Send',
    rulesDescription: 'Registro de número de transacción o referencia de giro emitido o pagado.',
    categoryTag: 'Remesas y Giros',
    requiresReceiptImage: true,
    bannerColor: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'cmp_recargas',
    name: 'Recargas y Paquetes Móviles',
    description: 'Venta de recargas de saldo y paquetes de datos para todos los operadores móviles.',
    serviceType: 'Recargas',
    pointsAwarded: 2,
    calculationType: 'per_unit',
    active: true,
    iconName: 'Smartphone',
    rulesDescription: 'Registro de recargas con número de línea y valor de la transacción.',
    categoryTag: 'Telefonía',
    requiresReceiptImage: false,
    bannerColor: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'cmp_seguros',
    name: 'Microseguros y Asistencias',
    description: 'Venta de pólizas de microseguros de accidentes, vida y asistencias funerarias.',
    serviceType: 'Seguros',
    pointsAwarded: 8,
    calculationType: 'per_unit',
    active: true,
    iconName: 'ShieldCheck',
    rulesDescription: 'Validación con número de póliza o certificado de afiliación.',
    categoryTag: 'Microseguros',
    requiresReceiptImage: true,
    bannerColor: 'from-purple-500 to-pink-600'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_kit_supergiros',
    name: 'Kit Supergiros',
    description: 'Kit exclusivo Supergiros con artículos de uso diario.',
    category: 'Artículos',
    pointsCost: 10,
    stock: 50,
    imageUrl: 'https://i.postimg.cc/NjGzSY4M/Captura-de-pantalla-2026-08-10-004659-removebg-preview.png',
    brand: 'SuperGIROS',
    specifications: ['Termo deportivo oficial SuperGIROS', 'Tula / bolso organizador compacto', 'Lanyard portacredencial'],
    isDigital: false,
    isFeatured: true,
    active: true,
    createdAt: '2025-01-10T10:00:00Z'
  },
  {
    id: 'prod_gafas_mundialistas',
    name: 'Gafas Mundialistas',
    description: 'Gafas edición especial mundialista.',
    category: 'Artículos',
    pointsCost: 25,
    stock: 35,
    imageUrl: 'https://i.postimg.cc/pLV64xZp/Captura-de-pantalla-2026-08-10-004716-removebg-preview.png',
    brand: 'SuperGIROS Colección',
    specifications: ['Protección UV400', 'Diseño exclusivo con detalle tricolor', 'Marco ergonómico ultraligero'],
    isDigital: false,
    isFeatured: true,
    active: true,
    createdAt: '2025-01-10T10:00:00Z'
  },
  {
    id: 'prod_olla_presion',
    name: 'Olla a Presión',
    description: 'Olla a presión de alta calidad.',
    category: 'Artículos',
    pointsCost: 45,
    stock: 20,
    imageUrl: 'https://i.postimg.cc/MpZFNxDc/Captura-de-pantalla-2026-08-10-004740-removebg-preview.png',
    brand: 'Hogar & Cocina',
    specifications: ['Capacidad 4 Litros', 'Válvula de seguridad y cierre hermético', 'Aluminio anodizado de alta resistencia'],
    isDigital: false,
    isFeatured: true,
    active: true,
    createdAt: '2025-01-10T10:00:00Z'
  },
  {
    id: 'prod_bono_100k',
    name: 'Bono $100.000 COP - App SuperGiros',
    description: 'Bono de saldo cargado directamente a tu cuenta en la App SuperGiros para disponibilidad inmediata.',
    category: 'Bonos',
    pointsCost: 70,
    stock: 100,
    imageUrl: '',
    brand: 'App SuperGiros',
    specifications: [
      'Cargado directamente a la App SuperGiros',
      'Acreditación de saldo en la cuenta del Aliado',
      'Disponible de inmediato para giros, recargas o retiro'
    ],
    isDigital: true,
    isFeatured: true,
    active: true,
    createdAt: '2025-01-10T10:00:00Z'
  },
  {
    id: 'prod_bono_150k',
    name: 'Bono $150.000 COP - App SuperGiros',
    description: 'Bono de saldo cargado directamente a tu cuenta en la App SuperGiros para disponibilidad inmediata.',
    category: 'Bonos',
    pointsCost: 100,
    stock: 100,
    imageUrl: '',
    brand: 'App SuperGiros',
    specifications: [
      'Cargado directamente a la App SuperGiros',
      'Acreditación de saldo en la cuenta del Aliado',
      'Disponible de inmediato para giros, recargas o retiro'
    ],
    isDigital: true,
    isFeatured: true,
    active: true,
    createdAt: '2025-01-10T10:00:00Z'
  }
];

export const INITIAL_GESTIONES: ReportedGestion[] = [];

export const INITIAL_ORDERS: RedemptionOrder[] = [];

export const INITIAL_TRANSACTIONS: PointsTransaction[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_ACCESS_LOGS: AccessLog[] = [
  {
    id: 'log_init_1',
    timestamp: new Date().toISOString(),
    userId: 'usr_admin_principal',
    userName: 'Administrador Principal',
    documentId: '900850320',
    role: 'admin',
    eventType: 'login',
    details: 'Inicio de sesión administrativo inicial en el portal',
    ipOrDevice: 'Portal Web SuperGIROS'
  }
];
