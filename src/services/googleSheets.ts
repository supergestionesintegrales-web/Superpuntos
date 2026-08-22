import { 
  User, 
  Product, 
  CommercialCampaign,
  ReportedGestion, 
  RedemptionOrder, 
  AccessLog, 
  PointsTransaction,
  ProductCategory
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_CAMPAIGNS } from '../data/initialData';

export const DEFAULT_SPREADSHEET_ID = '18T8ZOHYRFIKyG8W24gwydRBwoJPAA_XsSJporVR-CgM';

export interface SyncDataPayload {
  users: User[];
  products: Product[];
  campaigns?: CommercialCampaign[];
  gestiones: ReportedGestion[];
  orders: RedemptionOrder[];
  accessLogs: AccessLog[];
  transactions: PointsTransaction[];
}

// Sheet tab names
export const SHEET_TABS = {
  USERS: 'Usuarios',
  ARTICLES: 'Articulos',
  BONUSES: 'Bonos',
  PROMOTIONS: 'Promocionales',
  GESTIONES: 'Gestiones_SOAT',
  ORDERS: 'Canjes_Pedidos',
  ACCESS_LOGS: 'Historial_Accesos',
  TRANSACTIONS: 'Libro_Puntos'
} as const;

// Official standard headers for each tab
export const STANDARD_HEADERS: Record<string, string[]> = {
  [SHEET_TABS.USERS]: [
    'ID Usuario',
    'Nombre Completo',
    'Cédula / NIT',
    'Email',
    'Teléfono',
    'Rol',
    'Punto de Venta / Negocio',
    'Zona / Ciudad',
    'Saldo Puntos',
    'Puntos Ganados',
    'Puntos Redimidos',
    'Estado',
    'Contraseña',
    'Fecha Registro'
  ],
  [SHEET_TABS.ARTICLES]: [
    'ID Artículo',
    'Nombre del Artículo',
    'Categoría',
    'Costo en Puntos',
    'Stock Físico',
    'Marca',
    'Descripción',
    'Especificaciones',
    'Destacado',
    'Estado',
    'URL Imagen',
    'Fecha Registro'
  ],
  [SHEET_TABS.BONUSES]: [
    'ID Bono',
    'Nombre del Bono',
    'Valor / Denominación',
    'Costo en Puntos',
    'Plataforma / Destino',
    'Cupos / Stock',
    'Descripción',
    'Condiciones / Entrega',
    'Destacado',
    'Estado',
    'Fecha Registro'
  ],
  [SHEET_TABS.PROMOTIONS]: [
    'ID Promocional',
    'Nombre del Promocional / Campaña',
    'Tipo de Servicio / Trámite',
    'Puntos Otorgados',
    'Tipo de Cálculo',
    'Categoría / Etiqueta',
    'Estado',
    'Descripción',
    'Reglas / Condiciones',
    'Requiere Comprobante',
    'Icono Visual',
    'Color Banner',
    'Fecha Registro'
  ],
  [SHEET_TABS.GESTIONES]: [
    'ID Gestión',
    'ID Aliado',
    'Nombre Aliado',
    'Cédula / NIT',
    'Zona Aliado',
    'Campaña / Trámite',
    'Puntos Solicitados / Ganados',
    'Valor Transacción / Prima',
    'Placa / Póliza / Ref',
    'Estado Auditoría',
    'Fecha de Registro',
    'Auditado Por',
    'Fecha Auditoría',
    'Comentarios / Observaciones'
  ],
  [SHEET_TABS.ORDERS]: [
    'ID Pedido / Canje',
    'ID Aliado',
    'Nombre Aliado',
    'Email Aliado',
    'Productos / Bonos Canjeados',
    'Total Puntos Invertidos',
    'Tipo de Canje',
    'Estado del Pedido',
    'PIN / Código Digital',
    'Empresa Envío / Guía',
    'Dirección de Entrega / Ciudad',
    'Fecha de Canje',
    'Fecha de Entrega'
  ],
  [SHEET_TABS.ACCESS_LOGS]: [
    'ID Evento',
    'Fecha y Hora',
    'ID Usuario',
    'Nombre Usuario',
    'Cédula / Documento',
    'Rol',
    'Tipo de Evento',
    'Detalles de la Acción',
    'IP / Dispositivo'
  ],
  [SHEET_TABS.TRANSACTIONS]: [
    'ID Transacción',
    'Fecha y Hora',
    'ID Aliado',
    'Nombre Aliado',
    'Tipo Movimiento',
    'Puntos',
    'Saldo Anterior',
    'Nuevo Saldo',
    'Concepto / Descripción',
    'ID Referencia'
  ]
};

/**
 * Ensures all required tabs exist in the Google Spreadsheet and returns sheet metadata
 */
export async function ensureSheetsExist(spreadsheetId: string, accessToken: string): Promise<{ sheetIdMap: Record<string, number>; existingTitles: string[] }> {
  const getRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!getRes.ok) {
    const errorData = await getRes.json().catch(() => ({}));
    const errorMsg = errorData?.error?.message || getRes.statusText;
    throw new Error(`No se pudo acceder a la hoja de cálculo (${spreadsheetId}): ${errorMsg}`);
  }

  const meta = await getRes.json();
  const sheetIdMap: Record<string, number> = {};
  const existingTitles: string[] = [];

  (meta.sheets || []).forEach((s: any) => {
    if (s.properties && s.properties.title) {
      existingTitles.push(s.properties.title);
      sheetIdMap[s.properties.title] = s.properties.sheetId;
    }
  });

  const requiredTabs = Object.values(SHEET_TABS);
  const tabsToCreate = requiredTabs.filter(tab => !existingTitles.includes(tab));

  if (tabsToCreate.length > 0) {
    const requests = tabsToCreate.map(title => ({
      addSheet: {
        properties: { title }
      }
    }));

    const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    if (batchRes.ok) {
      const batchData = await batchRes.json();
      (batchData.replies || []).forEach((rep: any) => {
        if (rep.addSheet && rep.addSheet.properties) {
          const p = rep.addSheet.properties;
          sheetIdMap[p.title] = p.sheetId;
          existingTitles.push(p.title);
        }
      });
    }
  }

  return { sheetIdMap, existingTitles };
}

/**
 * Automatically adjusts and calibrates the entire Google Spreadsheet:
 * - Creates any missing tabs from scratch (including 'Promocionales')
 * - Sets and validates proper Row 1 headers in all tabs
 * - Freezes header rows & applies aesthetic formatting
 * - Seeds default admin credentials into 'Usuarios' if empty
 * - Seeds initial products and bonuses into 'Articulos' and 'Bonos' if empty
 * - Seeds promotional campaigns into 'Promocionales' if empty
 */
export async function autoCalibrateSpreadsheet(
  accessToken: string,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<{ success: boolean; message: string; tabsCalibrated: string[] }> {
  try {
    const { sheetIdMap } = await ensureSheetsExist(spreadsheetId, accessToken);
    const tabs = Object.values(SHEET_TABS);
    const headerUpdates: Array<{ range: string; values: string[][] }> = [];

    // 1. Check Row 1 in each tab
    for (const tab of tabs) {
      const headers = STANDARD_HEADERS[tab];
      if (!headers) continue;

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tab)}!A1:Z1`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      let needsHeaderUpdate = true;
      if (res.ok) {
        const data = await res.json();
        const existingHeaders = (data.values && data.values[0]) || [];
        if (existingHeaders.length >= headers.length) {
          const matches = headers.every((h, i) => existingHeaders[i] && existingHeaders[i].trim() === h.trim());
          if (matches) {
            needsHeaderUpdate = false;
          }
        }
      }

      if (needsHeaderUpdate) {
        headerUpdates.push({
          range: `${tab}!A1:${String.fromCharCode(64 + Math.min(headers.length, 26))}1`,
          values: [headers]
        });
      }
    }

    // Write missing or outdated headers
    if (headerUpdates.length > 0) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: headerUpdates
        })
      });
    }

    // 2. Format Header Rows (Freeze Row 1 & Style Background/Text)
    const formattingRequests: any[] = [];

    for (const tab of tabs) {
      const sheetId = sheetIdMap[tab];
      if (typeof sheetId !== 'number') continue;

      // Freeze Row 1
      formattingRequests.push({
        updateSheetProperties: {
          properties: {
            sheetId,
            gridProperties: {
              frozenRowCount: 1
            }
          },
          fields: 'gridProperties.frozenRowCount'
        }
      });

      // Style Header Row: Dark Navy (#0F172A) + Amber Font (#F59E0B)
      formattingRequests.push({
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: STANDARD_HEADERS[tab]?.length || 15
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 15 / 255,
                green: 23 / 255,
                blue: 42 / 255
              },
              textFormat: {
                bold: true,
                foregroundColor: {
                  red: 245 / 255,
                  green: 158 / 255,
                  blue: 11 / 255
                },
                fontSize: 10
              },
              horizontalAlignment: 'CENTER'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
        }
      });
    }

    if (formattingRequests.length > 0) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests: formattingRequests })
      });
    }

    // 3. Ensure 'Usuarios' has at least the default Administrator account
    const usersCheckRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TABS.USERS)}!A2:C5`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (usersCheckRes.ok) {
      const usersData = await usersCheckRes.json();
      const rows = usersData.values || [];
      if (rows.length === 0) {
        await appendRowToGoogleSheets(
          accessToken,
          SHEET_TABS.USERS,
          [
            'usr_admin',
            'Administrador General',
            '900850320',
            'admin@supergiros.com',
            '3009876543',
            'Administrador',
            'Superpuntos Central',
            'Dirección Nacional',
            0,
            0,
            0,
            'Activo',
            'admin',
            new Date().toLocaleString('es-CO')
          ],
          spreadsheetId
        );
      }
    }

    // 4. Ensure 'Articulos' has initial physical products if empty
    const articlesCheckRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TABS.ARTICLES)}!A2:B5`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (articlesCheckRes.ok) {
      const artData = await articlesCheckRes.json();
      const rows = artData.values || [];
      if (rows.length === 0) {
        const physicalProducts = INITIAL_PRODUCTS.filter(p => !p.isDigital);
        for (const p of physicalProducts) {
          await appendRowToGoogleSheets(
            accessToken,
            SHEET_TABS.ARTICLES,
            [
              p.id,
              p.name,
              p.category,
              p.pointsCost,
              p.stock,
              p.brand || 'SuperGIROS',
              p.description || '',
              Array.isArray(p.specifications) ? p.specifications.join(' | ') : (p.specifications || ''),
              p.isFeatured || p.featured ? 'Sí' : 'No',
              p.active ? 'Disponible' : 'Inactivo',
              p.imageUrl || '',
              new Date().toLocaleString('es-CO')
            ],
            spreadsheetId
          );
        }
      }
    }

    // 5. Ensure 'Bonos' has initial cash bonuses if empty
    const bonusesCheckRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TABS.BONUSES)}!A2:B5`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (bonusesCheckRes.ok) {
      const bonData = await bonusesCheckRes.json();
      const rows = bonData.values || [];
      if (rows.length === 0) {
        const digitalBonuses = INITIAL_PRODUCTS.filter(p => p.isDigital);
        for (const b of digitalBonuses) {
          await appendRowToGoogleSheets(
            accessToken,
            SHEET_TABS.BONUSES,
            [
              b.id,
              b.name,
              b.name.includes('$') ? b.name : `$${b.name}`,
              b.pointsCost,
              b.brand || 'SuperGIROS',
              b.stock,
              b.description || 'Acreditación de dinero en cuenta',
              Array.isArray(b.specifications) ? b.specifications.join(' | ') : (b.specifications || 'Acreditación inmediata'),
              b.isFeatured || b.featured ? 'Sí' : 'No',
              b.active ? 'Disponible' : 'Inactivo',
              new Date().toLocaleString('es-CO')
            ],
            spreadsheetId
          );
        }
      }
    }

    // 6. Ensure 'Promocionales' has initial campaigns if empty
    const promoCheckRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TABS.PROMOTIONS)}!A2:B5`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (promoCheckRes.ok) {
      const promoData = await promoCheckRes.json();
      const rows = promoData.values || [];
      if (rows.length === 0) {
        for (const cmp of INITIAL_CAMPAIGNS) {
          await appendRowToGoogleSheets(
            accessToken,
            SHEET_TABS.PROMOTIONS,
            [
              cmp.id,
              cmp.name || cmp.serviceType,
              cmp.serviceType,
              cmp.pointsAwarded,
              cmp.calculationType === 'per_unit' ? 'Por Unidad' : cmp.calculationType === 'fixed' ? 'Fijo' : 'Porcentaje',
              cmp.categoryTag || 'General',
              cmp.active ? 'Activo' : 'Inactivo',
              cmp.description || '',
              cmp.rulesDescription || '',
              cmp.requiresReceiptImage ? 'Sí' : 'No',
              cmp.iconName || 'Award',
              cmp.bannerColor || 'from-amber-500 to-orange-600',
              new Date().toLocaleString('es-CO')
            ],
            spreadsheetId
          );
        }
      }
    }

    return {
      success: true,
      tabsCalibrated: tabs,
      message: `Base de datos en Excel creada y calibrada con ${tabs.length} pestañas, encabezados y datos iniciales.`
    };
  } catch (err: any) {
    console.warn('Error en autoCalibrateSpreadsheet:', err);
    return {
      success: false,
      tabsCalibrated: [],
      message: err.message || 'Error calibrando Google Sheets'
    };
  }
}

/**
 * Full synchronization of all application data to Google Sheets
 */
export async function syncAllToGoogleSheets(
  accessToken: string,
  payload: SyncDataPayload,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<{ success: boolean; updatedRanges: string[]; message?: string }> {
  try {
    await autoCalibrateSpreadsheet(accessToken, spreadsheetId);

    // 1. Prepare Users data
    const usersRows = payload.users.map(u => [
      u.id,
      u.name,
      u.documentId,
      u.email,
      u.phone,
      u.role === 'admin' ? 'Administrador' : 'Aliado Comercial',
      u.businessName || 'N/A',
      u.zone || 'N/A',
      u.pointsBalance,
      u.totalPointsEarned,
      u.totalPointsRedeemed,
      u.status === 'active' ? 'Activo' : 'Inactivo',
      u.password || '',
      new Date(u.createdAt).toLocaleString('es-CO')
    ]);

    // 2. Prepare Artículos (Physical Merchandise) data
    const articles = payload.products.filter(p => !p.isDigital && p.category !== 'Bonos');
    const articlesRows = articles.map(p => [
      p.id,
      p.name,
      p.category,
      p.pointsCost,
      p.stock,
      p.brand || 'SuperGIROS',
      p.description || '',
      Array.isArray(p.specifications) ? p.specifications.join(' | ') : (p.specifications || ''),
      p.isFeatured || p.featured ? 'Sí' : 'No',
      p.active ? 'Disponible' : 'Inactivo',
      p.imageUrl || '',
      new Date(p.createdAt).toLocaleString('es-CO')
    ]);

    // 2b. Prepare Bonos (Cash & Digital Rewards) data
    const bonuses = payload.products.filter(p => p.isDigital || p.category === 'Bonos');
    const bonusesRows = bonuses.map(b => [
      b.id,
      b.name,
      b.name.includes('$') ? b.name : `$${b.name}`,
      b.pointsCost,
      b.brand || 'SuperGIROS',
      b.stock,
      b.description || 'Acreditación de saldo en dinero',
      Array.isArray(b.specifications) ? b.specifications.join(' | ') : (b.specifications || 'Acreditación inmediata'),
      b.isFeatured || b.featured ? 'Sí' : 'No',
      b.active ? 'Disponible' : 'Inactivo',
      new Date(b.createdAt).toLocaleString('es-CO')
    ]);

    // 2c. Prepare Promocionales (Campaigns) data
    const campaigns = payload.campaigns || INITIAL_CAMPAIGNS;
    const promotionsRows = campaigns.map(c => [
      c.id,
      c.name || c.serviceType,
      c.serviceType,
      c.pointsAwarded,
      c.calculationType === 'per_unit' ? 'Por Unidad' : c.calculationType === 'fixed' ? 'Fijo' : 'Porcentaje',
      c.categoryTag || 'General',
      c.active ? 'Activo' : 'Inactivo',
      c.description || '',
      c.rulesDescription || '',
      c.requiresReceiptImage ? 'Sí' : 'No',
      c.iconName || 'Award',
      c.bannerColor || 'from-amber-500 to-orange-600',
      new Date().toLocaleString('es-CO')
    ]);

    // 3. Prepare Gestiones SOAT data
    const gestionesRows = payload.gestiones.map(g => [
      g.id,
      g.allyId,
      g.allyName,
      g.allyDocument || 'N/A',
      g.allyZone || 'N/A',
      g.campaignName || g.serviceType,
      g.status === 'approved' ? (g.pointsAwarded ?? g.pointsExpected) : g.pointsExpected,
      g.transactionValue ? `$${g.transactionValue.toLocaleString('es-CO')}` : 'N/A',
      g.referenceNumber || g.policyNumber || g.licensePlate || 'N/A',
      g.status === 'approved' ? 'APROBADO' : g.status === 'rejected' ? 'RECHAZADO' : 'PENDIENTE',
      new Date(g.createdAt).toLocaleString('es-CO'),
      g.reviewedBy || 'N/A',
      g.reviewedAt ? new Date(g.reviewedAt).toLocaleString('es-CO') : 'N/A',
      g.adminFeedback || g.notes || ''
    ]);

    // 4. Prepare Orders (Canjes) data
    const ordersRows = payload.orders.map(o => [
      o.id,
      o.allyId,
      o.allyName,
      o.allyEmail,
      o.items.map(item => `${item.productName} (x${item.quantity} - ${item.pointsCost * item.quantity} pts)`).join('; '),
      o.totalPoints,
      o.deliveryType === 'digital' ? 'Digital / Bono' : 'Envío Físico',
      o.status.toUpperCase(),
      o.digitalVoucherPin || 'N/A',
      o.trackingNumber ? `${o.courierName || 'Transportadora'}: ${o.trackingNumber}` : 'N/A',
      o.shippingAddress ? `${o.shippingAddress}, ${o.shippingCity || ''} (${o.shippingDepartment || ''})` : 'N/A',
      new Date(o.createdAt).toLocaleString('es-CO'),
      o.deliveredAt ? new Date(o.deliveredAt).toLocaleString('es-CO') : 'N/A'
    ]);

    // 5. Prepare Access Logs data
    const accessLogsRows = payload.accessLogs.map(l => [
      l.id,
      new Date(l.timestamp).toLocaleString('es-CO'),
      l.userId,
      l.userName,
      l.documentId,
      l.role === 'admin' ? 'Administrador' : 'Aliado Comercial',
      l.eventType.toUpperCase(),
      l.details || '',
      l.ipOrDevice || 'Web App Superpuntos'
    ]);

    // 6. Prepare Transactions data
    const transactionsRows = payload.transactions.map(t => [
      t.id,
      new Date(t.createdAt).toLocaleString('es-CO'),
      t.allyId,
      t.allyName || 'Aliado',
      t.amount >= 0 ? 'CRÉDITO (+) Puntos Ganados' : 'DÉBITO (-) Canje Realizado',
      Math.abs(t.amount),
      t.previousBalance,
      t.newBalance,
      t.description,
      t.referenceId || 'N/A'
    ]);

    // Batch update values
    const dataUpdates = [
      {
        range: `${SHEET_TABS.USERS}!A1`,
        values: [STANDARD_HEADERS[SHEET_TABS.USERS], ...usersRows]
      },
      {
        range: `${SHEET_TABS.ARTICLES}!A1`,
        values: [STANDARD_HEADERS[SHEET_TABS.ARTICLES], ...articlesRows]
      },
      {
        range: `${SHEET_TABS.BONUSES}!A1`,
        values: [STANDARD_HEADERS[SHEET_TABS.BONUSES], ...bonusesRows]
      },
      {
        range: `${SHEET_TABS.PROMOTIONS}!A1`,
        values: [STANDARD_HEADERS[SHEET_TABS.PROMOTIONS], ...promotionsRows]
      },
      {
        range: `${SHEET_TABS.GESTIONES}!A1`,
        values: [STANDARD_HEADERS[SHEET_TABS.GESTIONES], ...gestionesRows]
      },
      {
        range: `${SHEET_TABS.ORDERS}!A1`,
        values: [STANDARD_HEADERS[SHEET_TABS.ORDERS], ...ordersRows]
      },
      {
        range: `${SHEET_TABS.ACCESS_LOGS}!A1`,
        values: [STANDARD_HEADERS[SHEET_TABS.ACCESS_LOGS], ...accessLogsRows]
      },
      {
        range: `${SHEET_TABS.TRANSACTIONS}!A1`,
        values: [STANDARD_HEADERS[SHEET_TABS.TRANSACTIONS], ...transactionsRows]
      }
    ];

    // Clear old data rows first (below Row 1) to keep clean dataset
    for (const tab of Object.values(SHEET_TABS)) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tab}!A2:Z:clear`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // Write new values
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: dataUpdates
        })
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Error al escribir datos en Google Sheets');
    }

    const resJson = await updateRes.json();
    return {
      success: true,
      updatedRanges: resJson.responses?.map((r: any) => r.updatedRange) || []
    };
  } catch (error: any) {
    console.error('Error sincronizando con Google Sheets:', error);
    throw error;
  }
}

/**
 * Appends a single row to a given tab in Google Sheets
 */
export async function appendRowToGoogleSheets(
  accessToken: string,
  tabName: string,
  rowValues: (string | number)[],
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
) {
  try {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tabName)}!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [rowValues]
        })
      }
    );
  } catch (err) {
    console.warn(`Error anexando fila en pestaña ${tabName}:`, err);
  }
}

/**
 * Fetches the list of registered users directly from the Google Sheets Usuarios tab
 */
export async function fetchUsersFromGoogleSheets(
  accessToken: string,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<User[]> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TABS.USERS)}!A2:O`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const rows = data.values || [];

    return rows.map((r: any[], idx: number): User => {
      const id = r[0] || `usr_sheet_${idx + 1}`;
      const name = r[1] || 'Usuario Aliado';
      const documentId = String(r[2] || '').trim();
      const email = r[3] || `${documentId || id}@aliado.com`;
      const phone = r[4] || '300 000 0000';
      const roleStr = String(r[5] || '').toLowerCase();
      const role: 'admin' | 'ally' = roleStr.includes('admin') ? 'admin' : 'ally';
      const businessName = r[6] && r[6] !== 'N/A' ? r[6] : undefined;
      const zone = r[7] && r[7] !== 'N/A' ? r[7] : undefined;
      const pointsBalance = parseInt(String(r[8]).replace(/[^\d]/g, ''), 10) || 0;
      const totalPointsEarned = parseInt(String(r[9]).replace(/[^\d]/g, ''), 10) || pointsBalance;
      const totalPointsRedeemed = parseInt(String(r[10]).replace(/[^\d]/g, ''), 10) || 0;
      const status: 'active' | 'inactive' = String(r[11]).toLowerCase().includes('inactiv') ? 'inactive' : 'active';
      const password = r[12] ? String(r[12]).trim() : undefined;
      const createdAt = r[13] ? new Date(r[13]).toISOString() : new Date().toISOString();

      return {
        id,
        name,
        documentId,
        email,
        phone,
        role,
        password,
        businessName,
        zone,
        pointsBalance,
        totalPointsEarned,
        totalPointsRedeemed,
        status,
        createdAt,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
      };
    }).filter((u: User) => u.documentId || u.email);
  } catch (err) {
    console.warn('No se pudieron obtener usuarios desde Google Sheets:', err);
    return [];
  }
}

/**
 * Fetches all promotional campaigns directly from Google Sheets Promocionales tab
 */
export async function fetchCampaignsFromGoogleSheets(
  accessToken: string,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<CommercialCampaign[]> {
  const campaigns: CommercialCampaign[] = [];

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TABS.PROMOTIONS)}!A2:M`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (res.ok) {
      const data = await res.json();
      (data.values || []).forEach((r: any[], idx: number) => {
        if (!r[1] && !r[2]) return;
        const id = r[0] || `cmp_${idx + 1}`;
        const name = r[1] || 'Promocional';
        const serviceType = r[2] || name;
        const pointsAwarded = parseInt(String(r[3]).replace(/[^\d]/g, ''), 10) || 5;
        const calcTypeStr = String(r[4] || '').toLowerCase();
        const calculationType: 'fixed' | 'percentage' | 'per_unit' = 
          calcTypeStr.includes('porcent') ? 'percentage' : calcTypeStr.includes('fijo') ? 'fixed' : 'per_unit';
        const categoryTag = r[5] || 'General';
        const active = !String(r[6]).toLowerCase().includes('inactiv');
        const description = r[7] || '';
        const rulesDescription = r[8] || '';
        const requiresReceiptImage = String(r[9]).toLowerCase().includes('s') || String(r[9]).toLowerCase().includes('y');
        const iconName = r[10] || 'Award';
        const bannerColor = r[11] || 'from-amber-500 to-orange-600';

        campaigns.push({
          id,
          name,
          serviceType,
          pointsAwarded,
          calculationType,
          categoryTag,
          active,
          description,
          rulesDescription,
          requiresReceiptImage,
          iconName,
          bannerColor
        });
      });
    }
  } catch (err) {
    console.warn('Error cargando promocionales desde Google Sheets:', err);
  }

  return campaigns;
}

/**
 * Fetches all store products (both Physical Articles and Digital/Cash Bonuses) directly from Google Sheets
 */
export async function fetchProductsFromGoogleSheets(
  accessToken: string,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<Product[]> {
  const products: Product[] = [];

  try {
    // 1. Fetch Articulos
    const artRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TABS.ARTICLES)}!A2:L`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (artRes.ok) {
      const artData = await artRes.json();
      (artData.values || []).forEach((r: any[], idx: number) => {
        if (!r[1]) return; // Skip empty row
        const id = r[0] || `prod_art_${idx + 1}`;
        const name = r[1];
        const category = (r[2] || 'Hogar') as ProductCategory;
        const pointsCost = parseInt(String(r[3]).replace(/[^\d]/g, ''), 10) || 10;
        const stock = parseInt(String(r[4]).replace(/[^\d]/g, ''), 10) || 10;
        const brand = r[5] || 'SuperGIROS';
        const description = r[6] || '';
        const specifications = r[7] ? String(r[7]).split('|').map(s => s.trim()) : [];
        const isFeatured = String(r[8]).toLowerCase().includes('s') || String(r[8]).toLowerCase().includes('y');
        const active = !String(r[9]).toLowerCase().includes('inactiv');
        const imageUrl = r[10] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60';
        const createdAt = r[11] ? new Date(r[11]).toISOString() : new Date().toISOString();

        products.push({
          id,
          name,
          category,
          pointsCost,
          stock,
          brand,
          description,
          specifications,
          isFeatured,
          featured: isFeatured,
          active,
          imageUrl,
          isDigital: false,
          createdAt
        });
      });
    }

    // 2. Fetch Bonos
    const bonRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TABS.BONUSES)}!A2:K`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (bonRes.ok) {
      const bonData = await bonRes.json();
      (bonData.values || []).forEach((r: any[], idx: number) => {
        if (!r[1]) return;
        const id = r[0] || `prod_bono_${idx + 1}`;
        const name = r[1];
        const pointsCost = parseInt(String(r[3]).replace(/[^\d]/g, ''), 10) || 50;
        const brand = r[4] || 'SuperGIROS';
        const stock = parseInt(String(r[5]).replace(/[^\d]/g, ''), 10) || 999;
        const description = r[6] || 'Acreditación de dinero en cuenta';
        const specifications = r[7] ? String(r[7]).split('|').map(s => s.trim()) : ['Acreditación inmediata'];
        const isFeatured = String(r[8]).toLowerCase().includes('s') || String(r[8]).toLowerCase().includes('y');
        const active = !String(r[9]).toLowerCase().includes('inactiv');
        const createdAt = r[10] ? new Date(r[10]).toISOString() : new Date().toISOString();

        products.push({
          id,
          name,
          category: 'Bonos',
          pointsCost,
          stock,
          brand,
          description,
          specifications,
          isFeatured,
          featured: isFeatured,
          active,
          imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60',
          isDigital: true,
          createdAt
        });
      });
    }
  } catch (err) {
    console.warn('Error cargando catálogo desde Google Sheets:', err);
  }

  return products;
}

/**
 * Updates a user's point balance and stats directly in the Google Sheets Usuarios tab
 */
export async function updateUserPointsInGoogleSheets(
  accessToken: string,
  userDocOrId: string,
  newBalance: number,
  totalEarned: number,
  totalRedeemed: number,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
) {
  try {
    // 1. Find user row index
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TABS.USERS)}!A:C`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return;
    const data = await res.json();
    const rows = data.values || [];
    const cleanSearch = userDocOrId.trim().toLowerCase();

    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if ((r[0] && String(r[0]).trim().toLowerCase() === cleanSearch) || 
          (r[2] && String(r[2]).trim().toLowerCase() === cleanSearch)) {
        rowIndex = i + 1; // 1-indexed for Sheets
        break;
      }
    }

    if (rowIndex > 0) {
      // Update columns I, J, K (index 9, 10, 11 -> Saldo Puntos, Puntos Ganados, Puntos Redimidos)
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TABS.USERS)}!I${rowIndex}:K${rowIndex}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [[newBalance, totalEarned, totalRedeemed]]
          })
        }
      );
    }
  } catch (err) {
    console.warn('Error actualizando saldo de puntos en Google Sheets:', err);
  }
}
