import React, { useState } from 'react';
import { 
  ShoppingCart, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Banknote, 
  Truck, 
  ShieldCheck, 
  Gift 
} from 'lucide-react';
import { CoinIcon } from '../common/CoinIcon';
import { useApp } from '../../context/AppContext';
import { formatPoints } from '../../utils/helpers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedToCheckout }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartPointsTotal, currentUser } = useApp();

  if (!isOpen) return null;

  const hasEnoughPoints = currentUser.pointsBalance >= cartPointsTotal;
  const remainingBalance = currentUser.pointsBalance - cartPointsTotal;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div 
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-slate-900">
                Carrito de Canjes
              </h2>
              <p className="text-xs text-slate-500">
                {cart.length} {cart.length === 1 ? 'premio seleccionado' : 'premios seleccionados'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Tu carrito está vacío</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Explora el catálogo de premios y agrega las recompensas que desees canjear con tus Superpuntos.
              </p>
            </div>
          ) : (
            cart.map(item => {
              const itemTotal = item.product.pointsCost * item.quantity;
              return (
                <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                  
                  {/* Product Thumbnail */}
                  {item.product.imageUrl ? (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-1.5 mix-blend-multiply"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className={`w-16 h-16 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${
                      item.product.isDigital || item.product.category === 'Bonos'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-blue-100 text-blue-900 border-blue-200'
                    }`}>
                      {item.product.isDigital || item.product.category === 'Bonos' ? <Banknote className="w-7 h-7" /> : <Gift className="w-7 h-7" />}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.product.name}
                    </h4>
                    
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-500">
                        {item.product.category}
                      </span>
                      {(item.product.isDigital || item.product.category === 'Bonos') && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                          <Banknote className="w-2.5 h-2.5" />
                          App SuperGiros
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 font-bold text-blue-900 text-xs">
                        <CoinIcon className="w-3.5 h-3.5" />
                        <span>{formatPoints(itemTotal)} pts</span>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 text-xs transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 text-xs transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                    title="Eliminar del carrito"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
            
            {/* Calculation details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tu saldo actual:</span>
                <span className="font-bold text-slate-900">{formatPoints(currentUser.pointsBalance)} pts</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total costo canje:</span>
                <span className="font-bold text-blue-900 flex items-center gap-1">
                  <CoinIcon className="w-3.5 h-3.5" />
                  {formatPoints(cartPointsTotal)} pts
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                <span className={remainingBalance < 0 ? 'text-red-600' : 'text-slate-800'}>
                  {remainingBalance < 0 ? 'Te faltan puntos:' : 'Saldo restante tras canje:'}
                </span>
                <span className={remainingBalance < 0 ? 'text-red-600 font-extrabold' : 'text-emerald-700'}>
                  {remainingBalance < 0 
                    ? `-${formatPoints(Math.abs(remainingBalance))} pts`
                    : `${formatPoints(remainingBalance)} pts`}
                </span>
              </div>
            </div>

            {/* Validation warning if not enough points */}
            {!hasEnoughPoints && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  No cuentas con suficientes puntos para este canje. Reporta más gestiones comerciales o elimina algún premio.
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                disabled={!hasEnoughPoints}
                className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  hasEnoughPoints
                    ? 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white shadow-lg shadow-blue-950/25 hover:scale-101'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Proceder al Canje de Premios</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={clearCart}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors text-center cursor-pointer"
              >
                Vaciar Carrito
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
