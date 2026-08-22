# 🔍 Lista de Verificación de Configuración

## ☑️ Checklist Completo

### 1. Información del Proyecto
- [x] **Nombre del proyecto**: Superpuntos Portal de Canjes
- [x] **Cuenta de email**: supergestionesintegrales@gmail.com
- [x] **Proyecto Firebase**: superpuntos
- [x] **Google Sheet ID**: 18T8ZOHYRFIKyG8W24gwydRBwoJPAA_XsSJporVR-CgM

### 2. Credenciales de Acceso
- [x] **Admin Email**: admin@superpuntos.com (o admin@supergiros.com)
- [x] **Admin Password**: admin
- [x] **Admin Cédula**: 900850320

### 3. Archivos de Configuración

#### `firebase-applet-config.json`
- [ ] ⚠️ **apiKey**: PENDIENTE - Obtener de Firebase Console
- [x] **projectId**: superpuntos ✅
- [ ] ⚠️ **appId**: PENDIENTE - Obtener de Firebase Console
- [x] **authDomain**: superpuntos.firebaseapp.com ✅
- [x] **storageBucket**: superpuntos.firebasestorage.app ✅
- [ ] ⚠️ **messagingSenderId**: PENDIENTE - Obtener de Firebase Console

#### `.env` (Opcional para deployment)
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_APP_ID
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [x] VITE_GOOGLE_SPREADSHEET_ID ✅

### 4. Firebase Console - Configuraciones

#### Authentication
- [ ] Ir a: https://console.firebase.google.com/project/superpuntos/authentication
- [ ] Habilitar método: **Google Sign-In**
- [ ] (Opcional) Habilitar: **Email/Password**

#### Dominios Autorizados
- [ ] `localhost` (debe estar por defecto)
- [ ] Tu dominio de Cloudflare Pages (cuando despliegues)

### 5. Google Cloud Console - APIs

#### Habilitar Google Sheets API
- [ ] Ir a: https://console.cloud.google.com/apis/library
- [ ] Buscar: "Google Sheets API"
- [ ] Hacer clic en "Enable"

#### OAuth Consent Screen
- [ ] Ir a: https://console.cloud.google.com/apis/credentials/consent
- [ ] Tipo: External (o Internal si tienes Google Workspace)
- [ ] App name: Superpuntos Portal
- [ ] User support email: supergestionesintegrales@gmail.com
- [ ] Scopes necesarios:
  - [ ] `.../auth/spreadsheets`
  - [ ] `.../auth/userinfo.email`

### 6. Google Sheets

#### Verificar Acceso a la Hoja
- [ ] Abrir: https://docs.google.com/spreadsheets/d/18T8ZOHYRFIKyG8W24gwydRBwoJPAA_XsSJporVR-CgM/edit
- [ ] Verificar que la cuenta supergestionesintegrales@gmail.com tenga acceso
- [ ] Permisos: **Editor** (no solo lector)

#### Estructura de Pestañas (Se crearán automáticamente)
La aplicación creará estas pestañas al conectarse:
- [ ] Usuarios
- [ ] Articulos
- [ ] Bonos
- [ ] Promocionales
- [ ] Gestiones_SOAT
- [ ] Canjes_Pedidos
- [ ] Historial_Accesos
- [ ] Libro_Puntos

### 7. Instalación Local

#### Dependencias
```bash
# Verificar que Node.js esté instalado
node --version  # Debe ser v18 o superior

# Instalar dependencias
npm install
# o
bun install
```

#### Variables de Entorno
- [ ] Copiar `.env.example` a `.env`
- [ ] Actualizar credenciales de Firebase en `.env`

#### Iniciar Aplicación
```bash
npm run dev
# o
bun run dev
```

- [ ] Aplicación corriendo en: http://localhost:3000

### 8. Primera Conexión

#### Conectar con Google
- [ ] Abrir http://localhost:3000
- [ ] Hacer clic en "Conectar con Google Sheets"
- [ ] Autorizar acceso con: supergestionesintegrales@gmail.com
- [ ] Verificar mensaje de éxito

#### Verificar Auto-Calibración
- [ ] Google Sheet debe tener las 8 pestañas creadas
- [ ] Encabezados en fila 1 de cada pestaña
- [ ] Fila 1 debe estar congelada (frozen)
- [ ] Usuario administrador creado en pestaña "Usuarios"

### 9. Login como Administrador

#### Credenciales
- [ ] Email: `admin@superpuntos.com`
- [ ] Contraseña: `admin`
- [ ] Login exitoso

#### Verificar Panel de Admin
- [ ] Ver Dashboard de Administración
- [ ] Ver estadísticas de sistema
- [ ] Acceso a gestión de:
  - [ ] Usuarios/Aliados
  - [ ] Productos/Inventario
  - [ ] Campañas Promocionales
  - [ ] Aprobación de Gestiones
  - [ ] Pedidos/Canjes
  - [ ] Auditoría de Entregas

### 10. Registro de Prueba (Aliado)

#### Crear un Usuario de Prueba
- [ ] Cerrar sesión de admin
- [ ] Ir a "Registro de Aliado"
- [ ] Completar formulario de prueba
- [ ] Verificar que aparezca en Google Sheets pestaña "Usuarios"

#### Login como Aliado
- [ ] Cerrar sesión
- [ ] Login con cédula del aliado de prueba
- [ ] Verificar acceso a:
  - [ ] Catálogo de productos
  - [ ] Carrito de compras
  - [ ] Historial de gestiones
  - [ ] Panel de puntos

---

## ⚠️ Problemas Comunes y Soluciones

### El usuario admin NO se crea automáticamente
**Solución 1**: Usar el botón de calibración en el panel de admin  
**Solución 2**: Crear manualmente en Google Sheets (ver PASOS_SIGUIENTES.md)

### Error: "Invalid API Key"
**Causa**: Las credenciales de Firebase no están configuradas  
**Solución**: Completar `firebase-applet-config.json` con credenciales reales

### Error: "This app is blocked"
**Causa**: OAuth Consent Screen no configurado  
**Solución**: Configurar OAuth Consent Screen en Google Cloud Console

### Error: "Access denied to Google Sheets"
**Causa**: Google Sheets API no habilitada  
**Solución**: Habilitar Google Sheets API en Google Cloud Console

### No puede conectarse a Google Sheets
**Causa**: Permisos insuficientes en la hoja  
**Solución**: Compartir la hoja con supergestionesintegrales@gmail.com como Editor

---

## ✅ Configuración Completa

Cuando TODOS los checkboxes estén marcados:
- ✅ Firebase configurado
- ✅ Google Sheets conectado
- ✅ Usuario admin creado
- ✅ Aplicación funcional
- ✅ Sincronización en tiempo real activa

**¡Tu aplicación Superpuntos está lista para producción! 🎉**

---

## 📊 Resumen del Estado Actual

### ✅ Completado
- [x] Estructura del proyecto
- [x] Código de la aplicación
- [x] Documentación
- [x] ID de Google Sheet configurado
- [x] Nombre del proyecto Firebase actualizado

### ⚠️ Pendiente (URGENTE)
- [ ] Obtener credenciales de Firebase Console
- [ ] Actualizar `firebase-applet-config.json`
- [ ] Habilitar Google Sheets API
- [ ] Configurar OAuth Consent Screen
- [ ] Primera conexión y auto-calibración

### 📝 Próximos Pasos Recomendados
1. Completar configuración de Firebase (5 min)
2. Habilitar APIs necesarias (2 min)
3. Iniciar aplicación local (1 min)
4. Primera conexión con Google (2 min)
5. Verificar creación de datos iniciales (1 min)
6. **TOTAL: ~10-15 minutos** ⏱️

---

**Última actualización**: Sábado 22 de Agosto de 2026
