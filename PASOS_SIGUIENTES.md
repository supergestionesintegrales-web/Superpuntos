# 🚀 Próximos Pasos para Configurar Superpuntos

## ✅ Lo que ya está configurado:
1. ✅ Proyecto configurado con el nombre correcto
2. ✅ ID de Google Sheets configurado
3. ✅ Estructura de Firebase preparada para el proyecto "superpuntos"
4. ✅ Credenciales del administrador documentadas

---

## 📋 Pasos que Debes Completar:

### Paso 1: Obtener Credenciales de Firebase (URGENTE) ⭐
1. Ve a: https://console.firebase.google.com/
2. Inicia sesión con: **supergestionesintegrales@gmail.com**
3. Selecciona o crea el proyecto: **"superpuntos"**
4. Sigue las instrucciones del archivo: **`CONFIGURACION_FIREBASE.md`**
5. Actualiza el archivo: **`firebase-applet-config.json`** con las credenciales reales

### Paso 2: Habilitar APIs Necesarias
En Firebase Console (proyecto "superpuntos"):
- ✅ Authentication → Habilitar Google Sign-In
- ✅ Google Cloud Console → Habilitar Google Sheets API

### Paso 3: Crear y Configurar Google Sheet
1. Ve a: https://docs.google.com/spreadsheets/
2. Abre la hoja con ID: `18T8ZOHYRFIKyG8W24gwydRBwoJPAA_XsSJporVR-CgM`
   - O crea una nueva y actualiza el ID en `.env`
3. Comparte la hoja con: **supergestionesintegrales@gmail.com**
4. Dale permisos de **Editor**

### Paso 4: Iniciar la Aplicación
```bash
# Instalar dependencias
npm install
# o
bun install

# Iniciar en modo desarrollo
npm run dev
# o
bun run dev
```

### Paso 5: Primera Conexión
1. Abre la app en: http://localhost:3000
2. Haz clic en "Conectar con Google"
3. Autoriza el acceso a Google Sheets
4. El sistema automáticamente:
   - ✅ Creará las 8 pestañas necesarias
   - ✅ Creará los encabezados
   - ✅ Creará el usuario administrador
   - ✅ Creará productos y campañas iniciales

### Paso 6: Iniciar Sesión como Admin
- **Email**: admin@superpuntos.com
- **Contraseña**: admin
- ⚠️ **IMPORTANTE**: Cambia esta contraseña después del primer login

---

## 🔍 Verificar que Todo Funcione

### 1. Verificar Google Sheets
Tu hoja debe tener estas 8 pestañas:
- ✅ Usuarios
- ✅ Articulos
- ✅ Bonos
- ✅ Promocionales
- ✅ Gestiones_SOAT
- ✅ Canjes_Pedidos
- ✅ Historial_Accesos
- ✅ Libro_Puntos

### 2. Verificar Usuario Admin
En la pestaña "Usuarios", fila 2 debe aparecer:
- **Nombre**: Administrador General
- **Cédula**: 900850320
- **Email**: admin@supergiros.com (o admin@superpuntos.com)
- **Contraseña**: admin

### 3. Verificar Productos
En "Articulos" deben aparecer:
- Kit Supergiros
- Gafas Mundialistas  
- Olla a Presión

En "Bonos" deben aparecer:
- Bono $100.000 COP
- Bono $150.000 COP

---

## 🆘 Si el Usuario Admin NO se Crea Automáticamente

### Opción A: Usar el Botón de Calibración
1. Inicia sesión como administrador (si puedes)
2. Ve al Panel de Administración
3. Busca el botón "Calibrar Google Sheets"
4. Haz clic para forzar la creación

### Opción B: Crear Manualmente en Google Sheets
Si la opción A no funciona, crea manualmente en la pestaña "Usuarios":

| Columna | Valor |
|---------|-------|
| A (ID Usuario) | usr_admin |
| B (Nombre) | Administrador General |
| C (Cédula) | 900850320 |
| D (Email) | admin@superpuntos.com |
| E (Teléfono) | 3009876543 |
| F (Rol) | Administrador |
| G (Punto de Venta) | Superpuntos Central |
| H (Zona) | Dirección Nacional |
| I (Saldo Puntos) | 0 |
| J (Puntos Ganados) | 0 |
| K (Puntos Redimidos) | 0 |
| L (Estado) | Activo |
| M (Contraseña) | admin |
| N (Fecha Registro) | (fecha actual) |

---

## 📚 Archivos de Referencia

- `CONFIGURACION_FIREBASE.md` → Guía completa de Firebase
- `README.md` → Documentación general del proyecto
- `.env.example` → Ejemplo de variables de entorno

---

## 🎯 Orden Recomendado

1. ⭐ **PRIMERO**: Obtener credenciales de Firebase
2. ⭐ **SEGUNDO**: Actualizar `firebase-applet-config.json`
3. Habilitar Google Sheets API
4. Instalar dependencias (`npm install`)
5. Iniciar aplicación (`npm run dev`)
6. Conectar con Google
7. Verificar que se creen las pestañas y el usuario admin
8. Iniciar sesión como admin y cambiar contraseña

---

## ✨ Una Vez Configurado

Tu aplicación estará lista para:
- ✅ Registro de aliados comerciales
- ✅ Gestión de puntos y recompensas
- ✅ Catálogo de productos
- ✅ Sistema de canjes
- ✅ Sincronización en tiempo real con Google Sheets
- ✅ Panel de administración completo

---

## 📞 Información de Contacto del Proyecto

- **Cuenta Google**: supergestionesintegrales@gmail.com
- **Proyecto Firebase**: superpuntos
- **Google Sheet ID**: 18T8ZOHYRFIKyG8W24gwydRBwoJPAA_XsSJporVR-CgM

---

**¡Éxito con tu proyecto Superpuntos! 🎉**
