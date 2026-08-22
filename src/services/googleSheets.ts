export const DEFAULT_SPREADSHEET_ID = 'STUB_ID';
export const SHEET_TABS = {
  USERS: 'Usuarios',
  ARTICLES: 'Artículos',
  BONUSES: 'Bonos',
  PROMOTIONS: 'Promociones',
  GESTIONES: 'Gestiones',
  ORDERS: 'Pedidos',
  TRANSACTIONS: 'Transacciones',
  ACCESS_LOGS: 'Accesos'
};
export const syncAllToGoogleSheets = async (...args: any[]) => {};
export const appendRowToGoogleSheets = async (...args: any[]) => {};
export const fetchUsersFromGoogleSheets = async (...args: any[]) => [];
export const fetchProductsFromGoogleSheets = async (...args: any[]) => [];
export const fetchCampaignsFromGoogleSheets = async (...args: any[]) => [];
export const updateUserPointsInGoogleSheets = async (...args: any[]) => {};
export const autoCalibrateSpreadsheet = async (...args: any[]) => ({ success: true, message: 'Stub', tabsCalibrated: [] });
