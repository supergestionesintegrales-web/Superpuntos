import React from 'react';
import { 
  Users, 
  X, 
  ShieldCheck, 
  UserCheck, 
  Coins, 
  Store, 
  UserPlus, 
  ArrowRight, 
  Sparkles,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPoints, getAllyTier } from '../../utils/helpers';

interface LoginSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export const LoginSwitchModal: React.FC<LoginSwitchModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister
}) => {
  const { users, currentUser, switchUserById, deleteUser } = useApp();

  if (!isOpen) return null;

  const adminUsers = users.filter(u => u.role === 'admin');
  const allyUsers = users.filter(u => u.role === 'ally');

  const handleSelectUser = (userId: string) => {
    switchUserById(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                Acceso Rápido
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Cambiar de Cuenta
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Admin Role Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Rol Administrador (Auditoría, Inventario & Reglas)</span>
            </h4>

            <div className="space-y-2">
              {adminUsers.map(admin => {
                const isActive = currentUser.id === admin.id;
                return (
                  <div
                    key={admin.id}
                    onClick={() => handleSelectUser(admin.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive 
                        ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={admin.avatarUrl} alt={admin.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="font-bold text-sm text-slate-900">{admin.name}</strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                            Super Admin
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{admin.email}</p>
                      </div>
                    </div>

                    {isActive && (
                      <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                        <UserCheck className="w-4 h-4" />
                        Activo
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allies Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-600" />
                <span>Rol Aliado Comercial (Canjes & Reportes)</span>
              </h4>

              <button
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Registrar Nuevo</span>
              </button>
            </div>

            <div className="space-y-2">
              {allyUsers.map(ally => {
                const isActive = currentUser.id === ally.id;
                const tier = getAllyTier(ally.totalPointsEarned || 0);

                return (
                  <div
                    key={ally.id}
                    onClick={() => handleSelectUser(ally.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive 
                        ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={ally.avatarUrl} alt={ally.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <strong className="font-bold text-sm text-slate-900 truncate">{ally.name}</strong>
                          <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full border shrink-0 ${tier.current.badgeBg}`}>
                            {tier.current.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {ally.businessName} • {ally.zone}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <div className="font-black text-amber-600 text-xs flex items-center gap-1 justify-end">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          <span>{formatPoints(ally.pointsBalance)} pts</span>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                            ✓ Sesión Actual
                          </span>
                        )}
                      </div>

                      {currentUser.role === 'admin' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`¿Seguro que deseas eliminar al usuario "${ally.name}" del sistema y de Firebase?`)) {
                              deleteUser(ally.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar usuario de Firebase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Cambia de usuario instantáneamente para probar ambos lados del sistema.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
