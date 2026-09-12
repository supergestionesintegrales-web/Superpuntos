// Helper utilities for formatting and calculations

export const formatPoints = (points: number): string => {
  return new Intl.NumberFormat('es-CO').format(Math.max(0, points));
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const formatDateShort = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const generateVoucherCode = (): string => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `SP-${year}-${randomNum}`;
};

export const generatePinCode = (prefix = 'SP'): string => {
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${part1}-${part2}`;
};

export interface AllyTier {
  name: 'Bronce' | 'Plata' | 'Oro' | 'Diamante';
  minSoats: number;
  maxSoats: number;
  minPoints: number;
  maxPoints: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  iconColor: string;
  description: string;
  benefits: string[];
}

export const TIERS: AllyTier[] = [
  {
    name: 'Bronce',
    minSoats: 0,
    maxSoats: 9,
    minPoints: 0,
    maxPoints: 49,
    color: 'text-amber-700',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    badgeBorder: 'border-amber-400',
    iconColor: '#b45309',
    description: 'Nivel Inicial (0 a 9 SOATs)',
    benefits: [
      'Ganancia base: 5 pts por cada SOAT validado en RUNT',
      'Acceso al catálogo oficial de Artículos y Bonos',
      'Comprobantes y vouchers digitales con código QR'
    ]
  },
  {
    name: 'Plata',
    minSoats: 10,
    maxSoats: 17,
    minPoints: 50,
    maxPoints: 89,
    color: 'text-slate-600',
    badgeBg: 'bg-slate-200 text-slate-800 border-slate-300',
    badgeBorder: 'border-slate-400',
    iconColor: '#64748b',
    description: 'Nivel Intermedio (10 a 17 SOATs)',
    benefits: [
      '10 a 17 SOATs validados (50 - 89 pts acumulados)',
      'Despacho prioritario en canjes físicos de Artículos',
      'Línea de soporte y atención comercial preferencial'
    ]
  },
  {
    name: 'Oro',
    minSoats: 18,
    maxSoats: 24,
    minPoints: 90,
    maxPoints: 124,
    color: 'text-amber-500',
    badgeBg: 'bg-amber-400/20 text-amber-800 border-amber-400',
    badgeBorder: 'border-amber-500',
    iconColor: '#d97706',
    description: 'Nivel Avanzado (18 a 24 SOATs)',
    benefits: [
      '18 a 24 SOATs validados (90 - 124 pts acumulados)',
      'Prioridad alta en validación de pólizas RUNT',
      'Acceso anticipado a stock de Bonos y Artículos VIP'
    ]
  },
  {
    name: 'Diamante',
    minSoats: 25,
    maxSoats: 30, // 25 a 30 SOATs se convierte a Diamante (máxima escala)
    minPoints: 125,
    maxPoints: 999999,
    color: 'text-cyan-600',
    badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    badgeBorder: 'border-cyan-400',
    iconColor: '#0891b2',
    description: '¡Máxima Escala! (25 a 30+ SOATs)',
    benefits: [
      'Alcanzado con 25 a 30 SOATs validados (125+ pts acumulados)',
      'Máxima escala del programa de fidelización',
      'Envío express 100% gratuito a nivel nacional',
      'Bonificaciones especiales por sobrecumplimiento de metas',
      'Asesor comercial y ejecutivo de cuenta VIP dedicado'
    ]
  }
];

export const getAllyTier = (totalEarned: number): { 
  current: AllyTier; 
  next: AllyTier | null; 
  progress: number;
  soatsEquivalent: number;
  soatsToNext: number;
  soatsToDiamond: number;
} => {
  let currentTier = TIERS[0];
  for (const tier of TIERS) {
    if (totalEarned >= tier.minPoints) {
      currentTier = tier;
    }
  }

  const currentIndex = TIERS.findIndex(t => t.name === currentTier.name);
  const nextTier = currentIndex < TIERS.length - 1 ? TIERS[currentIndex + 1] : null;

  const soatsEquivalent = Math.floor(totalEarned / 5);
  const diamondTier = TIERS.find(t => t.name === 'Diamante')!;
  const soatsToDiamond = Math.max(0, Math.ceil((diamondTier.minPoints - totalEarned) / 5));

  let progress = 100;
  let soatsToNext = 0;
  if (nextTier) {
    const range = nextTier.minPoints - currentTier.minPoints;
    const progressInCurrent = totalEarned - currentTier.minPoints;
    progress = Math.min(100, Math.max(0, (progressInCurrent / range) * 100));
    soatsToNext = Math.max(0, Math.ceil((nextTier.minPoints - totalEarned) / 5));
  }

  return { 
    current: currentTier, 
    next: nextTier, 
    progress, 
    soatsEquivalent, 
    soatsToNext,
    soatsToDiamond
  };
};

// Export to CSV utility
export const exportToCSV = (data: Record<string, any>[], fileName: string, sheetTitle = 'Datos') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  
  // Format CSV with BOM for UTF-8 support
  const csvContent = [
    headers.join(';'),
    ...data.map(row => 
      headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') val = JSON.stringify(val);
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      }).join(';')
    )
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportOrdersToCSV = (orders: any[]) => {
  const formattedData = orders.map(order => ({
    'Código Voucher': order.voucherCode,
    'Fecha de Canje': formatDate(order.createdAt),
    'Cédula Aliado': order.allyDocument,
    'Nombre Aliado': order.allyName,
    'Zona Comercial': order.allyZone,
    'Teléfono Aliado': order.allyPhone,
    'Tipo de Entrega': order.deliveryType === 'digital' ? 'Bono Digital' : order.deliveryType === 'shipping' ? 'Envío Físico' : 'Retiro en Sede',
    'Dirección Despacho': order.shippingAddress || 'N/A',
    'Ciudad Destino': order.shippingCity || 'N/A',
    'Departamento': order.shippingDepartment || 'N/A',
    'Nombre Receptor': order.recipientName || order.allyName,
    'Teléfono Receptor': order.recipientPhone || order.allyPhone,
    'Premios Solicitados': order.items.map((it: any) => `${it.quantity}x ${it.productName}`).join(' | '),
    'Total Puntos': order.totalPoints,
    'Estado Logístico': order.status === 'delivered' ? 'Entregado' : order.status === 'shipped' ? 'Despachado' : order.status === 'preparing' ? 'En Preparación' : 'Pendiente',
    'Empresa Transportadora': order.courierName || 'N/A',
    'Guía de Seguimiento': order.trackingNumber || 'N/A',
    'PIN Digital': order.digitalVoucherPin || 'N/A'
  }));

  exportToCSV(formattedData, 'Superpuntos_Reporte_Canjes_Auditoria');
};

/**
 * Generates an institutional acronym email with user's data + @superpuntos.online
 * Example: Carlos Pérez (Doc 1098765432) -> cperez.5432@superpuntos.online
 */
export const generateAcronymicEmail = (name: string, documentId?: string, businessName?: string): string => {
  const normalize = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim();

  const cleanName = normalize(name || '');
  const cleanBiz = normalize(businessName || '');
  const cleanDoc = (documentId || '').replace(/\D/g, '');
  const docSuffix = cleanDoc.length >= 4 ? cleanDoc.slice(-4) : cleanDoc;

  const parts = cleanName.split(/\s+/).filter(Boolean);
  let base = '';

  if (parts.length >= 2) {
    // First initial of first name + first surname (e.g. Juan Perez -> jperez)
    const firstInitial = parts[0][0];
    const surname = parts[1];
    base = `${firstInitial}${surname}`;
  } else if (parts.length === 1 && parts[0].length > 0) {
    base = parts[0];
  } else if (cleanBiz) {
    const bizParts = cleanBiz.split(/\s+/).filter(Boolean);
    base = bizParts.map(p => p[0]).join('') || 'aliado';
  } else {
    base = 'aliado';
  }

  base = base.replace(/[^a-z0-9]/g, '');
  if (!base) base = 'aliado';

  const emailLocal = docSuffix ? `${base}.${docSuffix}` : base;
  return `${emailLocal}@superpuntos.online`;
};

