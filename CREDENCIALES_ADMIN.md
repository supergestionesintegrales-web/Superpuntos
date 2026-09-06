# 🔐 Credenciales de Acceso Administrativo Autorizadas

## Usuarios Administradores Únicos Autorizados

Por directriz de seguridad estricta, únicamente existen **2 cuentas autorizadas** con privilegios administrativos en el sistema Superpuntos:

---

### 👤 1. Super Gestiones Integrales (Administrador Principal)
- **Correo:** `supergestionesintegrales@gmail.com`
- **Documento:** `901234567`
- **Contraseña:** `Admin2026**`
- **Rol:** Administrador Principal (`admin`)
- **Organización:** Super Gestiones Integrales - Dirección Central

---

### 👤 2. Administrador Superpuntos
- **Correo:** `admin@superpuentos.online`
- **Documento:** `900850320`
- **Contraseña:** `Admin2026**`
- **Rol:** Administrador General (`admin`)
- **Organización:** Superpuntos Online - Dirección General

---

> ⚠️ **RESTRICCIÓN DE SEGURIDAD ABSOLUTA:**
> Ningún otro correo electrónico tiene permisos administrativos en el portal ni en Firebase Firestore. Cualquier otro usuario registrado o autenticado mediante Google u otro medio tendrá exclusivamente el rol de Aliado Comercial (`ally`). Toda interacción queda registrada en la colección `access_logs` de Firebase Firestore.

---

## 🚀 Cómo Ingresar

1. Ve a la página de login del sistema
2. Haz clic en **"Acceso Administrativo"** en la parte inferior
3. Ingresa el **correo** o **documento** del administrador
4. Ingresa la **contraseña** correspondiente
5. Haz clic en **"Ingresar al Panel Administrativo"**

---

## ⚠️ Notas Importantes

- **NO compartas estas credenciales** con personas no autorizadas
- Los administradores tienen acceso completo al sistema
- Pueden:
  - Aprobar gestiones de SOATs
  - Gestionar inventario de productos
  - Crear campañas promocionales
  - Administrar usuarios aliados
  - Asignar puntos manualmente
  - Sincronizar con Google Sheets
  - Ver auditoría completa del sistema

---

## 🔄 Cambiar Contraseñas

Para cambiar las contraseñas predeterminadas:

1. Edita el archivo `src/data/initialData.ts`
2. Modifica el campo `password` del usuario correspondiente
3. Guarda y reconstruye el sistema con `npm run build`
4. Despliega la nueva versión

---

## 📝 Agregar Más Administradores

Para agregar más usuarios administradores, edita el array `INITIAL_USERS` en `src/data/initialData.ts` y añade un nuevo objeto con:

```typescript
{
  id: 'usr_admin_nuevo',
  name: 'Nombre del Administrador',
  documentId: 'DOCUMENTO_UNICO',
  email: 'correo@supergiros.com',
  phone: '3001234567',
  role: 'admin',
  password: 'ContraseñaSegura2026!',
  zone: 'Área Correspondiente',
  pointsBalance: 0,
  totalPointsEarned: 0,
  totalPointsRedeemed: 0,
  avatarUrl: 'https://ui-avatars.com/api/?name=Nuevo+Admin&background=0f172a&color=fff&bold=true',
  status: 'active',
  createdAt: new Date().toISOString(),
  businessName: 'SuperGIROS'
}
```

---

## 🛡️ Seguridad

- Las contraseñas se validan en texto plano (para simplicidad en esta versión)
- En producción, considera implementar hash de contraseñas (bcrypt)
- Implementa autenticación de dos factores (2FA) si es necesario
- Mantén un registro de accesos administrativos (ya implementado en el sistema)

---

**Última actualización:** Agosto 2026  
**Versión del sistema:** 1.0
