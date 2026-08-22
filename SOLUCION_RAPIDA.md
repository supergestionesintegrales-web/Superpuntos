# ⚡ Solución Rápida al Error de Firebase

## ❌ Error Actual
```
Firebase: Error (auth/internal-error)
```

## 🔍 Diagnóstico Completado

Tu proyecto está configurado pero **FALTAN 3 CREDENCIALES CRÍTICAS**:

1. ❌ **apiKey** - PENDIENTE
2. ❌ **appId** - PENDIENTE  
3. ❌ **messagingSenderId** - PENDIENTE

---

## ✅ Solución en 5 Pasos

### Paso 1: Ve a Firebase Console
🔗 https://console.firebase.google.com/

- Inicia sesión con: **supergestionesintegrales@gmail.com**

### Paso 2: Abre el Proyecto "superpuntos"

**Si NO existe el proyecto:**
1. Haz clic en "Agregar proyecto"
2. Nombre: **superpuntos**
3. Sigue los pasos y créalo

**Si YA existe:**
1. Haz clic en el proyecto "superpuntos"

### Paso 3: Crea o Busca la App Web

1. Ve a **⚙️ Project Settings** (Configuración del proyecto)
2. Baja a la sección **"Your apps"** (Tus aplicaciones)

**Si NO hay apps web:**
1. Haz clic en el ícono **"</>"** (Web)
2. Nombre de la app: **Superpuntos Portal Web**
3. NO marcar Firebase Hosting
4. Clic en "Registrar app"

**Si YA hay una app web:**
1. Busca "Superpuntos Portal Web" o similar
2. Haz clic en la app

### Paso 4: Copiar las Credenciales

Verás algo como esto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD_xYzAbC123...",           // ← COPIA ESTE
  authDomain: "superpuntos.firebaseapp.com",
  projectId: "superpuntos",
  storageBucket: "superpuntos.firebasestorage.app",
  messagingSenderId: "123456789012",       // ← COPIA ESTE
  appId: "1:123456789012:web:abc123...",   // ← COPIA ESTE
  measurementId: "G-XXXXXXXXXX"
};
```

**📋 Copia estos 3 valores:**
1. `apiKey` (empieza con AIzaSy...)
2. `messagingSenderId` (número de 12 dígitos)
3. `appId` (formato: 1:números:web:códigos)

### Paso 5: Actualizar el Archivo

Abre el archivo: **`firebase-applet-config.json`**

Reemplaza estas líneas:

```json
{
  "projectId": "superpuntos",
  "appId": "PEGA_AQUI_TU_APP_ID",
  "apiKey": "PEGA_AQUI_TU_API_KEY",
  "authDomain": "superpuntos.firebaseapp.com",
  "storageBucket": "superpuntos.firebasestorage.app",
  "messagingSenderId": "PEGA_AQUI_TU_MESSAGING_SENDER_ID",
  "measurementId": "",
  "oAuthClientId": "",
  "recaptchaSiteKey": ""
}
```

**Ejemplo con valores reales:**
```json
{
  "projectId": "superpuntos",
  "appId": "1:123456789012:web:abc123def456",
  "apiKey": "AIzaSyD_xYzAbC123DEF456GHI789",
  "authDomain": "superpuntos.firebaseapp.com",
  "storageBucket": "superpuntos.firebasestorage.app",
  "messagingSenderId": "123456789012",
  "measurementId": "",
  "oAuthClientId": "",
  "recaptchaSiteKey": ""
}
```

---

## 🚀 Después de Actualizar

### 1. Instalar Dependencias (si no lo has hecho)
```bash
npm install
```

### 2. Iniciar la Aplicación
```bash
npm run dev
```

### 3. Probar la Conexión
1. Abre: http://localhost:3000
2. Busca el botón "Conectar con Google Sheets"
3. Haz clic
4. Debería abrirse una ventana de Google
5. Selecciona: supergestionesintegrales@gmail.com
6. Autoriza los permisos

---

## ✅ Si Todo Funciona Correctamente

Verás:
1. ✅ Mensaje de "Conectado con Google Sheets"
2. ✅ Las 8 pestañas se crean automáticamente en tu Google Sheet
3. ✅ El usuario administrador se crea automáticamente
4. ✅ Productos y campañas iniciales se cargan

---

## 🆘 Si Aún Tienes Problemas

### "This app is blocked"
**Solución:** Configura el OAuth Consent Screen
- Ve a: https://console.cloud.google.com/
- APIs & Services → OAuth consent screen
- Sigue la configuración (ver GUIA_FIREBASE_PASO_A_PASO.md)

### "Invalid API key"
**Solución:** Verifica que hayas copiado correctamente
- Sin espacios al inicio o final
- Completo (empieza con AIzaSy...)
- Del proyecto correcto (superpuntos)

### La ventana de Google no se abre
**Solución:** Habilita pop-ups en tu navegador

---

## 📱 ¿Necesitas Ayuda?

Si tienes las credenciales pero no sabes cómo actualizar el archivo:

1. **Copia aquí (en el chat) tus 3 valores:**
   - apiKey: _____________
   - appId: _____________
   - messagingSenderId: _____________

2. Te ayudaré a actualizar el archivo correctamente

---

## 📖 Guías Completas

- **GUIA_FIREBASE_PASO_A_PASO.md** - Guía detallada con capturas
- **CONFIGURACION_FIREBASE.md** - Configuración completa
- **verificar-firebase.js** - Script de diagnóstico

---

**⏱️ Tiempo estimado: 5-10 minutos**

Una vez tengas las credenciales, el error desaparecerá y podrás usar la aplicación normalmente.
