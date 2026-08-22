# 🔐 Credenciales de Acceso Administrativo

## Usuarios Administradores Configurados

El sistema SuperGIROS Superpuntos tiene **3 usuarios administradores** preconfigurados para que múltiples personas puedan gestionar el sistema.

---

### 👤 Administrador Principal
**Correo:** `admin@supergiros.com`  
**Documento:** `900850320`  
**Contraseña:** `SuperGiros2026!`  
**Área:** Dirección Nacional

---

### 👤 Administrador de Sistemas
**Correo:** `sistemas@supergiros.com`  
**Documento:** `900850321`  
**Contraseña:** `Sistemas2026!`  
**Área:** Tecnología

---

### 👤 Administrador de Operaciones
**Correo:** `operaciones@supergiros.com`  
**Documento:** `900850322`  
**Contraseña:** `Operaciones2026!`  
**Área:** Operaciones

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
