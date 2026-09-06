import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  ShoppingBag, 
  ShoppingCart,
  ArrowRight, 
  Plus, 
  Tag,
  Banknote,
  Filter,
  Gift,
  Check,
  Truck,
  Wallet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatPoints } from '../../utils/helpers';
import { ProductImage } from '../common/ProductImage';

interface CatalogViewProps {
  onOpenReportModal: () => void;
  onOpenCart: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ onOpenReportModal, onOpenCart }) => {
  const { products, currentUser, addToCart, cart } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<'featured' | 'points_asc' | 'points_desc' | 'name'>('featured');
  const [onlyAffordable, setOnlyAffordable] = useState(false);
  const [onlyDigital, setOnlyDigital] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Available categories with at least 1 product
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.filter(p => p.active).forEach(p => cats.add(p.category));
    return ['Todos', ...Array.from(cats)];
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.active) return false;
      
      // Category filter
      if (selectedCategory !== 'Todos' && p.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesBrand = p.brand?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesBrand) return false;
      }

      // Affordability filter
      if (onlyAffordable && p.pointsCost > currentUser.pointsBalance) {
        return false;
      }

      // Digital filter
      if (onlyDigital && !p.isDigital) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'points_asc') return a.pointsCost - b.pointsCost;
      if (sortBy === 'points_desc') return b.pointsCost - a.pointsCost;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // Default: featured first, then stock
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.stock - a.stock;
    });
  }, [products, selectedCategory, searchQuery, onlyAffordable, onlyDigital, sortBy, currentUser.pointsBalance]);

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const result = addToCart(product, 1);
    setFeedbackToast(result.message);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const getProductCartQty = (productId: string): number => {
    const found = cart.find(item => item.product.id === productId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-5 h-5 text-blue-300 shrink-0" />
          <span className="text-sm font-medium">{feedbackToast}</span>
        </div>
      )}

      {/* Compact & Minimalist Banner */}
      <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Coins className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Hola, {currentUser.name}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400">Tu Billetera de Puntos:</span>
              <span className="text-sm font-black text-blue-300">
                {formatPoints(currentUser.pointsBalance)} PTS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Filters & Search Section */}
      <div className="space-y-4">
        
        {/* Search Bar & Fast Toggles */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar premios por nombre, marca o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all bg-slate-50"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Chips & Sorters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            
            {/* Affordability Toggle */}
            <button
              onClick={() => setOnlyAffordable(!onlyAffordable)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                onlyAffordable 
                  ? 'bg-slate-900 text-blue-300 border-slate-900 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Solo con mis puntos</span>
            </button>

            {/* Digital Only Toggle */}
            {/* Digital Bonos Toggle */}
            <button
              onClick={() => setOnlyDigital(!onlyDigital)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                onlyDigital 
                  ? 'bg-slate-900 text-emerald-400 border-slate-900 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bonos (App SuperGiros)</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-slate-900 cursor-pointer"
              >
                <option value="featured">Destacados</option>
                <option value="points_asc">Puntos: Menor a Mayor</option>
                <option value="points_desc">Puntos: Mayor a Menor</option>
                <option value="name">Nombre: A - Z</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Category Tabs (Artículos & Bonos separated) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {availableCategories.map(category => {
            const isSelected = selectedCategory === category;
            const count = category === 'Todos' 
              ? products.filter(p => p.active).length 
              : products.filter(p => p.active && p.category === category).length;

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border ${
                  isSelected 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {category === 'Artículos' && <Truck className="w-4 h-4 text-blue-400" />}
                {category === 'Bonos' && <Sparkles className="w-4 h-4 text-blue-300" />}
                {category === 'Todos' && <ShoppingBag className="w-4 h-4 text-slate-400" />}
                <span>{category === 'Artículos' ? 'Artículos (Con Despacho)' : category === 'Bonos' ? 'Bonos de Dinero' : 'Todos los Premios'}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-blue-600 text-white font-black' : 'bg-slate-100 text-slate-600 font-bold'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto border border-blue-200/60">
            <Gift className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              {products.length === 0 ? 'Catálogo en Actualización' : 'No encontramos premios con estos filtros'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {products.length === 0 
                ? 'Próximamente se publicarán los nuevos artículos y bonos disponibles para redimir con tus puntos.'
                : 'Intenta cambiar la categoría, limpiar el buscador o desactivar el filtro de puntos.'}
            </p>
          </div>
          {products.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
                setOnlyAffordable(false);
                setOnlyDigital(false);
              }}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Restablecer todos los filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const inCartQty = getProductCartQty(product.id);
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`bg-white rounded-3xl border transition-all shadow-xs flex flex-col justify-between overflow-hidden group cursor-pointer ${
                  isOutOfStock
                    ? 'border-red-200 hover:border-red-300'
                    : product.stock <= 5
                    ? 'border-blue-200 hover:border-blue-300'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Image Preview or Fallback with mix-blend-multiply */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                    <ProductImage 
                      product={product} 
                      containerClassName="w-full h-full flex items-center justify-center relative overflow-hidden" 
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-xs shadow-xs tracking-wider">
                        {product.category}
                      </span>
                      {(product.isDigital || product.category === 'Bonos') && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-1 rounded-full bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                          <Banknote className="w-3 h-3" /> App SuperGIROS
                        </span>
                      )}
                      {(product.isFeatured || product.featured) && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-1 rounded-full bg-blue-900 text-white flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3 text-blue-300" /> Destacado
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 z-10">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-2xs ${
                        isOutOfStock 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isOutOfStock ? 'Agotado' : 'Activo'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block truncate">
                          {product.brand || 'SuperGIROS'}
                        </span>
                        <h3 className="font-heading font-extrabold text-base text-slate-900 leading-tight group-hover:text-blue-900 transition-colors">
                          {product.name}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base sm:text-lg font-black text-blue-900 flex items-baseline justify-end gap-1">
                          {formatPoints(product.pointsCost)} <span className="text-xs font-bold text-slate-400 uppercase">PTS</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>

                    {/* Specifications Pills */}
                    {product.specifications && product.specifications.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {product.specifications.slice(0, 3).map((spec, idx) => (
                          <div key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5 bg-slate-50/80 px-2 py-1 rounded-md border border-slate-100">
                            <span className="text-blue-800 font-bold">•</span>
                            <span className="truncate">{spec}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Section: Existencias & Button */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        EXISTENCIAS
                      </span>
                      <span className={`text-xs font-black ${
                        isOutOfStock 
                          ? 'text-red-600' 
                          : product.stock <= 5 
                          ? 'text-blue-800' 
                          : 'text-slate-800'
                      }`}>
                        {product.stock} disponibles
                      </span>
                    </div>

                    {inCartQty > 0 && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        {inCartQty} en carrito
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={isOutOfStock}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                        : inCartQty > 0
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                          : 'bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white shadow-blue-900/20 hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                  >
                    {inCartQty > 0 ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Agregado ({inCartQty})</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>{isOutOfStock ? 'Agotado' : product.isDigital ? 'Canjear Bono' : 'Agregar al carrito'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-md transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Image / Bono Visual */}
              <div className="relative aspect-4/3 md:aspect-auto bg-slate-100 flex items-center justify-center p-6 overflow-hidden border-b md:border-b-0 md:border-r border-slate-200">
                <ProductImage
                  product={selectedProduct}
                  fallbackSize="lg"
                  className="w-full h-full object-contain max-h-72 mix-blend-multiply"
                  containerClassName="w-full h-full flex items-center justify-center relative overflow-hidden"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-900/85 text-white shadow-xs">
                    {selectedProduct.category}
                  </span>
                  {(selectedProduct.isDigital || selectedProduct.category === 'Bonos') && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                      <Banknote className="w-3 h-3" />
                      App SuperGIROS
                    </span>
                  )}
                  {(selectedProduct.isFeatured || selectedProduct.featured) && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-900 text-white shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-300" /> Destacado
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {selectedProduct.brand && (
                    <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
                      {selectedProduct.brand}
                    </span>
                  )}
                  <h2 className="text-xl font-bold text-slate-900 leading-snug">
                    {selectedProduct.name}
                  </h2>

                  {/* Points Box */}
                  <div className="bg-blue-50/80 rounded-2xl p-3.5 border border-blue-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide block">
                        Costo de Canje
                      </span>
                      <div className="flex items-center gap-1.5 text-2xl font-black text-blue-900">
                        <Coins className="w-6 h-6 text-blue-800" />
                        <span>{formatPoints(selectedProduct.pointsCost)}</span>
                        <span className="text-xs font-bold text-slate-600">pts</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Tu saldo actual</span>
                      <span className="text-sm font-bold text-slate-900">
                        {formatPoints(currentUser.pointsBalance)} pts
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {/* Specifications */}
                  {selectedProduct.specifications && selectedProduct.specifications.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Características:
                      </span>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {selectedProduct.specifications.map((spec, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-blue-800 font-bold">•</span>
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Delivery type note */}
                  <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {selectedProduct.isDigital || selectedProduct.category === 'Bonos' ? (
                      <>
                        <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Sin despacho físico. El bono es cargado a tu <strong>App SuperGIROS</strong> con cédula, nombre y teléfono registrados.</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4 text-blue-800 shrink-0" />
                        <span>Los artículos tienen despacho: a la dirección que indiques o para retirar en Oficina Principal SuperGIROS.</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock <= 0}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedProduct.stock <= 0
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white shadow-lg shadow-blue-950/30'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>
                      {selectedProduct.stock <= 0 
                        ? 'Premio Agotado' 
                        : 'Agregar'}
                    </span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black shadow-md shadow-blue-950/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-300">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.length === 1 ? 'premio' : 'premios'} en carrito
              </p>
              <div className="text-sm font-black flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-blue-400" />
                <span>{formatPoints(cart.reduce((sum, i) => sum + (i.product.pointsCost * i.quantity), 0))} pts</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenCart}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all cursor-pointer"
          >
            <span>Ver Carrito</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
