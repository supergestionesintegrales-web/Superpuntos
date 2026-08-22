# 🚀 Guía de Deployment en Cloudflare Pages

## ✅ Problema Resuelto

El error `Missing lockfile version` con Bun ha sido solucionado.

### Cambios Realizados:
1. ✅ Eliminado `bun.lock` (incompatible)
2. ✅ Actualizado Firebase de `^12.17.1` → `^11.1.0` (versión estable)
3. ✅ Instaladas dependencias con npm
4. ✅ Creado `package-lock.json` (compatible con Cloudflare)
5. ✅ Creado `.nvmrc` con Node.js 20

---

## 📋 Configuración de Cloudflare Pages

### Paso 1: Preparar el Repositorio Git

```bash
# Si no has inicializado git:
git init

# Agregar todos los archivos
git add .

# Crear commit
git commit -m "Preparado para deployment en Cloudflare Pages"

# Crear rama main
git branch -M main

# Agregar remote (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/superpuntos.git

# Push
git push -u origin main
```

### Paso 2: Conectar con Cloudflare Pages

1. Ve a: **https://dash.cloudflare.com/**
2. Inicia sesión con tu cuenta
3. Ve a **Workers & Pages** → **Create application** → **Pages**
4. Haz clic en **"Connect to Git"**
5. Selecciona tu proveedor (GitHub, GitLab, etc.)
6. Autoriza el acceso
7. Selecciona el repositorio **superpuntos**

### Paso 3: Configuración de Build

En la configuración de Cloudflare Pages, usa estos valores:

| Campo | Valor |
|-------|-------|
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (raíz) |
| **Environment variables** | Ver abajo ⬇️ |

#### Variables de Entorno CRÍTICAS:

Debes agregar estas variables en Cloudflare Pages:

```env
NODE_VERSION=20
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=superpuntos.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=superpuntos
VITE_FIREBASE_STORAGE_BUCKET=superpuntos.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id_aqui
VITE_FIREBASE_APP_ID=tu_app_id_aqui
VITE_GOOGLE_SPREADSHEET_ID=18T8ZOHYRFIKyG8W24gwydRBwoJPAA_XsSJporVR-CgM
```

**⚠️ IMPORTANTE**: Reemplaza los valores `tu_*_aqui` con tus credenciales reales de Firebase.

### Paso 4: Deploy

1. Haz clic en **"Save and Deploy"**
2. Espera a que termine el build (~2-5 minutos)
3. Una vez completado, obtendrás una URL como: `https://superpuntos.pages.dev`

---

## 🔧 Configuración Avanzada

### Agregar Dominio Personalizado

1. En Cloudflare Pages, ve a tu proyecto
2. Ve a la pestaña **"Custom domains"**
3. Haz clic en **"Set up a custom domain"**
4. Ingresa tu dominio (ej: `superpuntos.com`)
5. Sigue las instrucciones para configurar DNS

### Variables de Entorno por Ambiente

Cloudflare permite configurar diferentes variables para:
- **Production** (rama main)
- **Preview** (otras ramas)

Recomendación:
- Usa el proyecto de Firebase de producción en `main`
- Usa un proyecto de Firebase de desarrollo en otras ramas

---

## 🔐 Configuración Post-Deployment

### 1. Actualizar Dominios Autorizados en Firebase

Una vez que tengas tu URL de Cloudflare:

1. Ve a: **https://console.firebase.google.com/**
2. Selecciona el proyecto **"superpuntos"**
3. Ve a **Authentication** → **Settings** → **Authorized domains**
4. Haz clic en **"Add domain"**
5. Agrega: `superpuntos.pages.dev` (o tu dominio personalizado)
6. Guarda

### 2. Actualizar OAuth Consent Screen

1. Ve a: **https://console.cloud.google.com/**
2. Selecciona el proyecto **"superpuntos"**
3. Ve a **APIs & Services** → **OAuth consent screen**
4. En **"Authorized domains"**, agrega:
   - `pages.dev`
   - Tu dominio personalizado si tienes uno
5. Guarda los cambios

---

## ✅ Verificación del Deployment

Una vez desplegado, verifica:

1. ✅ La app carga sin errores
2. ✅ El botón "Conectar con Google Sheets" funciona
3. ✅ Puedes autenticarte con Google
4. ✅ Se crean las pestañas en Google Sheets
5. ✅ Puedes iniciar sesión como admin

---

## 🔄 Actualizaciones Futuras

Para actualizar la aplicación:

```bash
# Hacer cambios en tu código
git add .
git commit -m "Descripción de los cambios"
git push

# Cloudflare Pages detecta el push y hace deploy automático
```

---

## 🆘 Solución de Problemas

### Error: "Build failed"
- Verifica que las variables de entorno estén configuradas
- Revisa los logs de build en Cloudflare Pages
- Asegúrate de que `npm run build` funcione localmente

### Error: "Firebase auth/internal-error"
- Verifica que las variables de entorno de Firebase estén correctas
- Asegúrate de que el dominio esté autorizado en Firebase

### Error: "Google Sheets access denied"
- Verifica que Google Sheets API esté habilitada
- Asegúrate de que el OAuth Consent Screen esté configurado

### La app carga pero no se ve nada
- Verifica que la ruta de `base` en `vite.config.ts` sea correcta
- Asegúrate de que `dist` sea el directorio de salida

---

## 📊 Configuración Actual del Proyecto

| Item | Valor |
|------|-------|
| **Package Manager** | npm (anteriormente Bun) |
| **Node Version** | 20 (recomendado) |
| **Build Tool** | Vite |
| **Framework** | React 19 |
| **Firebase Version** | 11.1.0 |
| **Output Directory** | dist |

---

## 📝 Scripts de package.json

Los scripts disponibles son:

```json
{
  "dev": "vite --port=3000 --host=0.0.0.0",
  "build": "vite build",
  "preview": "vite preview"
}
```

### Probar localmente antes de deploy:

```bash
# Build de producción
npm run build

# Preview del build
npm run preview
```

---

## 🎯 Checklist de Deployment

Antes de hacer deploy, verifica:

- [ ] Credenciales de Firebase configuradas
- [ ] `package-lock.json` generado
- [ ] Build local exitoso (`npm run build`)
- [ ] Variables de entorno preparadas
- [ ] Repositorio Git creado y pusheado
- [ ] Dominio autorizado en Firebase (después del primer deploy)
- [ ] OAuth Consent Screen configurado

---

## 🌐 URLs Importantes

| Servicio | URL |
|----------|-----|
| Cloudflare Dashboard | https://dash.cloudflare.com/ |
| Firebase Console | https://console.firebase.google.com/ |
| Google Cloud Console | https://console.cloud.google.com/ |
| Tu App (después del deploy) | https://superpuntos.pages.dev |

---

**¡Listo para desplegar! 🚀**

Una vez que sigas estos pasos, tu aplicación estará en producción y accesible desde cualquier lugar.
