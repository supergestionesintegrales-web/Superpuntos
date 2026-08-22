# Superpuntos SuperGIROS - Portal de Fidelización y Canjes

Sistema de fidelización comercial para Aliados SuperGIROS conectado en tiempo real con **Google Sheets** como base de datos en la nube.

---

## 🌟 Características Principales

- **Base de Datos 100% en Google Sheets**: Toda la información de usuarios, contraseñas, saldos de puntos, productos, bonos de dinero, gestiones de SOAT y canjes se guarda y lee directamente en tu archivo de Excel.
- **Autocalibración y Creación Automática de Hojas**: Si conectas una hoja de cálculo en blanco (vacía o recién creada), el sistema automáticamente crea las 8 pestañas requeridas, escribe los encabezados oficiales, fija la fila superior y crea el usuario Administrador, las campañas promocionales y los productos iniciales.
- **Portal de Login Seguro**: Autenticación para Aliados (por Cédula y Contraseña) y Administradores (Email y Contraseña) validada contra la pestaña `Usuarios` de Google Sheets.
- **Gestión de SOAT y Promocionales**: Registro de ventas de SOAT y múltiples campañas comerciales configurables desde Google Sheets, con cálculo automático de puntos y módulo de auditoría/aprobación.
- **Tienda y Canjes**: Catálogo de artículos físicos y bonos de dinero con generación de comprobantes digitales (PIN/Voucher).

---

## 🚀 Despliegue en GitHub y Cloudflare Pages

### 1. Subir el proyecto a GitHub
```bash
git init
git add .
git commit -m "Initial commit Superpuntos"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

### 2. Conectar en Cloudflare Pages
1. Inicia sesión en tu cuenta de [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Dirígete a **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Selecciona tu repositorio de GitHub.
4. En los ajustes de construcción (**Build settings**), configura:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: `18` o `20` (en Variables de entorno opcionalmente: `NODE_VERSION` = `20.10.0`)
5. Haz clic en **Save and Deploy**.

---

## ⚙️ Estructura de Pestañas en Google Sheets

El sistema crea y gestiona automáticamente las siguientes 8 pestañas con formato ordenado y encabezados profesionales:

1. `Usuarios`: ID, Nombre, Cédula, Email, Teléfono, Rol, Punto de Venta, Zona, Saldo, Puntos Ganados, Puntos Redimidos, Estado, Contraseña, Fecha Registro.
2. `Articulos`: ID, Nombre, Categoría, Costo Puntos, Stock, Marca, Descripción, Especificaciones, Destacado, Estado, Imagen, Fecha.
3. `Bonos`: ID, Nombre, Valor, Costo Puntos, Plataforma, Cupos, Descripción, Condiciones, Destacado, Estado, Fecha.
4. `Promocionales`: ID Promocional, Nombre Promocional, Tipo Servicio/Trámite, Puntos Otorgados, Tipo Cálculo, Categoría, Estado, Descripción, Reglas, Requiere Comprobante, Icono Visual, Color Banner, Fecha Registro.
5. `Gestiones_SOAT`: ID, ID Aliado, Nombre, Cédula, Zona, Campaña, Puntos, Valor Prima, Placa/Ref, Estado, Fecha, Auditor, Fecha Auditoría, Observaciones.
6. `Canjes_Pedidos`: ID Canje, ID Aliado, Nombre, Email, Productos, Total Puntos, Tipo Canje, Estado, PIN/Voucher, Guía Envío, Dirección, Fecha Canje, Fecha Entrega.
7. `Historial_Accesos`: ID Evento, Fecha/Hora, ID Usuario, Nombre, Cédula, Rol, Tipo Evento, Detalles, IP/Dispositivo.
8. `Libro_Puntos`: ID Transacción, Fecha/Hora, ID Aliado, Nombre, Tipo Movimiento, Puntos, Saldo Anterior, Nuevo Saldo, Concepto, ID Referencia.

---

## 🔑 Credenciales Iniciales de Administración

- **Email**: `admin@superpuntos.com` (o `admin@supergiros.com`)
- **Contraseña**: `admin`
- **Cédula**: `900850320`

⚠️ **IMPORTANTE**: Cambia esta contraseña después del primer inicio de sesión.

---

## 📧 Información del Proyecto

- **Cuenta Google/Firebase**: `supergestionesintegrales@gmail.com`
- **Proyecto Firebase**: `superpuntos`
- **Google Sheets ID**: `18T8ZOHYRFIKyG8W24gwydRBwoJPAA_XsSJporVR-CgM`

---

## ⚙️ Configuración Rápida

Para configurar el proyecto completamente, consulta estos archivos:

1. **`CONFIGURACION_FIREBASE.md`** - Guía completa para obtener credenciales de Firebase
2. **`PASOS_SIGUIENTES.md`** - Lista paso a paso de configuración
3. **`verificar-configuracion.md`** - Checklist de verificación completa

### Configuración Mínima Requerida

1. Obtener credenciales de Firebase Console
2. Actualizar `firebase-applet-config.json` con las credenciales reales
3. Habilitar Google Sheets API en Google Cloud Console
4. Ejecutar `npm install` y luego `npm run dev`
5. Conectar con Google Sheets desde la aplicación
