# 🔥 Configuración de Firebase para Superpuntos

## 📧 Información de la Cuenta
- **Email**: supergestionesintegrales@gmail.com
- **Proyecto Firebase**: superpuntos

---

## 📝 Pasos para Obtener las Credenciales

### 1. Accede a Firebase Console
Ve a: https://console.firebase.google.com/

### 2. Inicia Sesión
Usa el correo: **supergestionesintegrales@gmail.com**

### 3. Selecciona el Proyecto "superpuntos"
Si no existe, créalo con el nombre: **superpuntos**

### 4. Obtén las Credenciales

#### Opción A: Desde la Configuración del Proyecto
1. Haz clic en el ícono de ⚙️ (Settings) junto a "Project Overview"
2. Selecciona **"Project settings"**
3. En la pestaña **"General"**, baja hasta **"Your apps"**
4. Si no tienes una app web, haz clic en **"</>"** (Web) para crear una
5. Registra la app con el nombre: **"Superpuntos Portal Web"**
6. Copia el objeto `firebaseConfig` que aparece

#### Opción B: Desde el SDK Setup
1. En "Your apps", selecciona tu app web
2. Haz clic en **"SDK setup and configuration"**
3. Selecciona **"Config"**
4. Copia los valores que aparecen

---

## 🔑 Credenciales que Necesitas Copiar

Busca estos valores en Firebase Console:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // ← Copia este valor
  authDomain: "superpuntos.firebaseapp.com",
  projectId: "superpuntos",
  storageBucket: "superpuntos.firebasestorage.app",
  messagingSenderId: "123456789",   // ← Copia este valor
  appId: "1:123456789:web:abc123",  // ← Copia este valor
  measurementId: "G-XXXXXXXXXX"     // ← Opcional
};
```

---

## 📂 Dónde Actualizar las Credenciales

### Archivo 1: `firebase-applet-config.json`
Actualiza este archivo con las credenciales reales:

```json
{
  "projectId": "superpuntos",
  "appId": "PEGA_AQUI_EL_APP_ID",
  "apiKey": "PEGA_AQUI_LA_API_KEY",
  "authDomain": "superpuntos.firebaseapp.com",
  "storageBucket": "superpuntos.firebasestorage.app",
  "messagingSenderId": "PEGA_AQUI_EL_MESSAGING_SENDER_ID",
  "measurementId": "",
  "oAuthClientId": "",
  "recaptchaSiteKey": ""
}
```

### Archivo 2: `.env` (Opcional - Para deployment en Cloudflare)
Si vas a desplegar en Cloudflare Pages o hosting estático:

```env
VITE_FIREBASE_API_KEY="tu_api_key_aqui"
VITE_FIREBASE_AUTH_DOMAIN="superpuntos.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="superpuntos"
VITE_FIREBASE_STORAGE_BUCKET="superpuntos.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="tu_sender_id_aqui"
VITE_FIREBASE_APP_ID="tu_app_id_aqui"
```

---

## ⚙️ Configuraciones Adicionales en Firebase

### 1. Habilitar Authentication
1. En Firebase Console, ve a **"Build" → "Authentication"**
2. Haz clic en **"Get started"**
3. En la pestaña **"Sign-in method"**, habilita:
   - ✅ **Google** (para autenticación de administradores)
   - ✅ **Email/Password** (opcional, para aliados)

### 2. Configurar Dominios Autorizados
1. En **Authentication → Settings → Authorized domains**
2. Agrega los dominios donde estará tu app:
   - `localhost` (ya viene por defecto)
   - Tu dominio de Cloudflare Pages (ej: `superpuntos.pages.dev`)
   - Tu dominio personalizado si tienes uno

### 3. Habilitar Google Sheets API
Para que funcione la integración con Google Sheets:

1. Ve a: https://console.cloud.google.com/
2. Selecciona el proyecto **"superpuntos"**
3. Ve a **"APIs & Services" → "Library"**
4. Busca **"Google Sheets API"**
5. Haz clic en **"Enable"**

### 4. Configurar OAuth Consent Screen
1. En Google Cloud Console: **"APIs & Services" → "OAuth consent screen"**
2. Selecciona **"External"** (o Internal si tienes Google Workspace)
3. Completa:
   - **App name**: Superpuntos Portal
   - **User support email**: supergestionesintegrales@gmail.com
   - **Developer contact**: supergestionesintegrales@gmail.com
4. Agrega los scopes necesarios:
   - `.../auth/spreadsheets` (para editar Google Sheets)
   - `.../auth/userinfo.email` (para obtener email del usuario)

---

## ✅ Verificación

Una vez configurado todo:

1. Abre la aplicación en el navegador
2. Intenta iniciar sesión con Google
3. Deberías poder:
   - ✅ Autenticarte con la cuenta de Google
   - ✅ Conectar con Google Sheets
   - ✅ Sincronizar datos

---

## 🆘 Solución de Problemas

### Error: "This app is blocked"
- Verifica que hayas configurado el OAuth Consent Screen
- Agrega tu correo a los "Test users" si está en modo Testing

### Error: "Invalid domain"
- Verifica los dominios autorizados en Authentication → Settings

### Error: "API key not valid"
- Verifica que hayas copiado correctamente la API Key
- Asegúrate de que las APIs necesarias estén habilitadas

---

## 📞 Contacto
Si necesitas ayuda adicional, revisa la documentación oficial:
- Firebase: https://firebase.google.com/docs
- Google Sheets API: https://developers.google.com/sheets/api
