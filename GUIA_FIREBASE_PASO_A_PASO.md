# 🔥 Guía Firebase - Paso a Paso (Solución al Error auth/internal-error)

## ❌ Error Actual
```
Firebase: Error (auth/internal-error)
```

**Causa**: Las credenciales de Firebase no están configuradas correctamente.

---

## ✅ Solución - Sigue estos pasos EXACTAMENTE

### Paso 1: Acceder a Firebase Console

1. Abre tu navegador
2. Ve a: **https://console.firebase.google.com/**
3. Inicia sesión con: **supergestionesintegrales@gmail.com**

---

### Paso 2: Seleccionar o Crear el Proyecto

#### Opción A: Si el proyecto "superpuntos" YA EXISTE
1. En la página principal, busca el proyecto **"superpuntos"**
2. Haz clic en el proyecto para abrirlo
3. Ve al **Paso 3**

#### Opción B: Si el proyecto "superpuntos" NO EXISTE
1. Haz clic en **"Agregar proyecto"** o **"Add project"**
2. En "Nombre del proyecto", escribe: **superpuntos**
3. Acepta los términos y condiciones
4. Haz clic en **"Continuar"**
5. (Opcional) Desactiva Google Analytics si no lo necesitas ahora
6. Haz clic en **"Crear proyecto"**
7. Espera a que se cree (toma ~30 segundos)
8. Haz clic en **"Continuar"**

---

### Paso 3: Crear una Aplicación Web

1. En la página principal del proyecto, busca la sección **"Comienza agregando Firebase a tu app"**
2. Haz clic en el ícono **"</>"** (Web/JavaScript)
3. Te aparecerá un modal/página:
   - **Nombre de la app**: Escribe `Superpuntos Portal Web`
   - **Firebase Hosting**: NO marcar (lo haremos después)
   - Haz clic en **"Registrar app"**

---

### Paso 4: COPIAR LAS CREDENCIALES (¡IMPORTANTE!)

Después de registrar la app, verás un código como este:

```javascript
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbc123DEF456GHI789jkl...",
  authDomain: "superpuntos.firebaseapp.com",
  projectId: "superpuntos",
  storageBucket: "superpuntos.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789",
  measurementId: "G-XXXXXXXXXX"
};
```

**📝 COPIA ESTOS VALORES:**

| Campo | Ejemplo | Tu Valor (Escríbelo aquí) |
|-------|---------|---------------------------|
| **apiKey** | AIzaSyAbc123DEF456... | _________________________ |
| **authDomain** | superpuntos.firebaseapp.com | superpuntos.firebaseapp.com |
| **projectId** | superpuntos | superpuntos |
| **storageBucket** | superpuntos.firebasestorage.app | superpuntos.firebasestorage.app |
| **messagingSenderId** | 123456789012 | _________________________ |
| **appId** | 1:123456789012:web:abc... | _________________________ |

---

### Paso 5: Si Ya Cerraste la Ventana (Cómo Recuperar las Credenciales)

Si ya cerraste la ventana y no copiaste las credenciales:

1. En Firebase Console, ve a **⚙️ Project Settings** (Configuración del proyecto)
2. Baja hasta la sección **"Your apps"** (Tus aplicaciones)
3. Busca la app "Superpuntos Portal Web"
4. En **"SDK setup and configuration"**, selecciona **"Config"**
5. Verás el objeto `firebaseConfig` completo
6. Copia los valores

---

### Paso 6: Habilitar Authentication

1. En el menú lateral izquierdo, ve a **"Build"** → **"Authentication"**
2. Haz clic en **"Get started"** (Si es la primera vez)
3. En la pestaña **"Sign-in method"**:
   - Busca **"Google"**
   - Haz clic en **"Google"**
   - Activa el switch **"Enable"** (Habilitar)
   - **Email de soporte del proyecto**: `supergestionesintegrales@gmail.com`
   - Haz clic en **"Guardar"** / **"Save"**

---

### Paso 7: Habilitar Google Sheets API

1. Abre una nueva pestaña: **https://console.cloud.google.com/**
2. Arriba, verifica que esté seleccionado el proyecto **"superpuntos"**
3. En el menú lateral (☰), ve a **"APIs & Services"** → **"Library"**
4. Busca: **"Google Sheets API"**
5. Haz clic en **"Google Sheets API"**
6. Haz clic en **"Enable"** (Habilitar)

---

### Paso 8: Configurar OAuth Consent Screen

1. En Google Cloud Console, ve a **"APIs & Services"** → **"OAuth consent screen"**
2. Si no está configurado:
   - **User Type**: Selecciona **"External"**
   - Haz clic en **"Create"**
3. Completa el formulario:
   - **App name**: `Superpuntos Portal`
   - **User support email**: `supergestionesintegrales@gmail.com`
   - **App logo**: (Opcional, puedes dejarlo vacío)
   - **App domain**: (Déjalo vacío por ahora)
   - **Developer contact information**: `supergestionesintegrales@gmail.com`
   - Haz clic en **"Save and Continue"**
4. En **"Scopes"**:
   - Haz clic en **"Add or Remove Scopes"**
   - Busca y marca: **`.../auth/spreadsheets`**
   - Busca y marca: **`.../auth/userinfo.email`**
   - Haz clic en **"Update"**
   - Haz clic en **"Save and Continue"**
5. En **"Test users"**:
   - Haz clic en **"Add Users"**
   - Agrega: `supergestionesintegrales@gmail.com`
   - Haz clic en **"Add"**
   - Haz clic en **"Save and Continue"**
6. En **"Summary"**:
   - Revisa todo
   - Haz clic en **"Back to Dashboard"**

---

### Paso 9: Actualizar el Archivo de Configuración

Ahora que tienes las credenciales, actualízalas en tu proyecto.

#### Opción A: Crear archivo `.env` (RECOMENDADO)

1. En la raíz del proyecto, crea un archivo llamado `.env` (sin extensión adicional)
2. Copia y pega esto, reemplazando con TUS valores:

```env
VITE_FIREBASE_API_KEY="TU_API_KEY_AQUI"
VITE_FIREBASE_AUTH_DOMAIN="superpuntos.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="superpuntos"
VITE_FIREBASE_STORAGE_BUCKET="superpuntos.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="TU_MESSAGING_SENDER_ID_AQUI"
VITE_FIREBASE_APP_ID="TU_APP_ID_AQUI"
VITE_GOOGLE_SPREADSHEET_ID="18T8ZOHYRFIKyG8W24gwydRBwoJPAA_XsSJporVR-CgM"
```

#### Opción B: Actualizar `firebase-applet-config.json`

1. Abre el archivo: `firebase-applet-config.json`
2. Reemplaza los valores "PENDIENTE" con los valores reales que copiaste:

```json
{
  "projectId": "superpuntos",
  "appId": "TU_APP_ID_AQUI",
  "apiKey": "TU_API_KEY_AQUI",
  "authDomain": "superpuntos.firebaseapp.com",
  "storageBucket": "superpuntos.firebasestorage.app",
  "messagingSenderId": "TU_MESSAGING_SENDER_ID_AQUI",
  "measurementId": "",
  "oAuthClientId": "",
  "recaptchaSiteKey": ""
}
```

---

### Paso 10: Reiniciar la Aplicación

1. **Detén la aplicación** si está corriendo (Ctrl+C en la terminal)
2. Reinicia la aplicación:

```bash
npm run dev
```

3. Abre el navegador en: **http://localhost:3000**
4. Intenta conectar con Google nuevamente

---

## ✅ Verificación Final

Si todo está bien configurado:

1. ✅ Ves el botón "Conectar con Google Sheets"
2. ✅ Al hacer clic, se abre una ventana de Google
3. ✅ Puedes seleccionar la cuenta supergestionesintegrales@gmail.com
4. ✅ Google te pide permisos para acceder a Google Sheets
5. ✅ Después de autorizar, vuelves a la aplicación
6. ✅ Ves un mensaje de éxito
7. ✅ La aplicación crea automáticamente las pestañas en Google Sheets

---

## 🆘 Si Sigue el Error

### Error: "This app is blocked"
- Verifica que hayas configurado el OAuth Consent Screen
- Agrega tu email a los "Test users"

### Error: "Invalid API key"
- Verifica que hayas copiado correctamente el `apiKey`
- Asegúrate de que no haya espacios al inicio o final

### Error: "Domain not authorized"
- En Firebase Console → Authentication → Settings → Authorized domains
- Agrega `localhost` si no está

### La ventana de Google no se abre
- Verifica que tu navegador permita ventanas emergentes (pop-ups)
- Prueba en modo incógnito

---

## 📞 Siguiente Paso

Una vez que tengas las credenciales:
1. Cópialas aquí (en este chat)
2. Te ayudaré a actualizar los archivos correctamente
3. Verificaremos que todo funcione

**¿En qué paso estás ahora?**
- [ ] No he iniciado sesión en Firebase
- [ ] Ya tengo las credenciales pero no sé dónde ponerlas
- [ ] Ya actualicé los archivos pero sigue el error
- [ ] Otro problema: _______________
