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
  Zap,
  Filter,
  Gift,
  Check,
  Truck,
  Wallet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatPoints } from '../../utils/helpers';

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
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium">{feedbackToast}</span>
        </div>
      )}

      {/* Compact & Minimalist Banner */}
      <div className="rounded-2xl bg-slate-900 text-white p-4 sm:p-5 border border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
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
              <span className="text-sm font-black text-amber-400">
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
                  ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Solo con mis puntos</span>
            </button>

            {/* Digital Only Toggle */}
            <button
              onClick={() => setOnlyDigital(!onlyDigital)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                onlyDigital 
                  ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Bonos Digitales</span>
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
                {category === 'Artículos' && <Truck className="w-4 h-4 text-amber-500" />}
                {category === 'Bonos' && <Sparkles className="w-4 h-4 text-amber-400" />}
                {category === 'Todos' && <ShoppingBag className="w-4 h-4 text-slate-400" />}
                <span>{category === 'Artículos' ? 'Artículos Físicos' : category === 'Bonos' ? 'Bonos de Dinero' : 'Todos los Premios'}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-amber-500 text-slate-900 font-black' : 'bg-slate-100 text-slate-600 font-bold'
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
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200/60">
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
            const isBono = product.category === 'Bonos';
            
            // Extract monetary value (e.g. $100.000 or $150.000)
            const moneyMatch = product.name.match(/\$[\d\.]+/);
            const bonoAmount = moneyMatch ? moneyMatch[0] : '$100.000';

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:shadow-lg border border-slate-200/80 transition-all duration-200 cursor-pointer relative group"
              >
                <div>
                  {isBono ? (
                    /* Top Dark Container for Bonos */
                    <div className="relative h-48 bg-[#1e293b] rounded-xl mb-4 flex flex-col items-center justify-center p-4 overflow-hidden">
                      {/* Tag Top Right */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-[#1e293b] text-amber-500 border border-amber-500/60 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                          BONO
                        </span>
                      </div>

                      {/* Green Wallet Circle Icon */}
                      <div className="w-12 h-12 rounded-full bg-slate-700/60 border border-slate-600 flex items-center justify-center text-emerald-400 mb-2.5 shadow-inner">
                        <Wallet className="w-6 h-6" />
                      </div>

                      {/* Price / Denomination */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          {bonoAmount}
                        </span>
                        <span className="text-xs font-bold text-slate-300">COP</span>
                      </div>
                    </div>
                  ) : (
                    /* Top Image Container with ARTICULO Tag */
                    <div className="relative h-48 bg-white rounded-xl mb-4 flex items-center justify-center p-2 overflow-hidden">
                      {/* Tag Top Right */}
                      <div className="absolute top-0 right-0 z-10">
                        <span className="bg-amber-50/90 text-amber-700 border border-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-2xs">
                          {product.category === 'Artículos' ? 'ARTÍCULO' : product.category}
                        </span>
                      </div>

                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Footer Section: Inversion & Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      INVERSIÓN
                    </span>
                    <div className="flex items-center gap-1.5 font-black text-amber-500 text-base sm:text-lg">
                      <Coins className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                      <span>{formatPoints(product.pointsCost)} pts</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={isOutOfStock}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                        : inCartQty > 0
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.99]'
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
                        <span>{isOutOfStock ? 'Agotado' : isBono ? 'Agregar bono' : 'Agregar al carrito'}</span>
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
              {selectedProduct.category === 'Bonos' ? (
                <div className="relative aspect-4/3 md:aspect-auto bg-[#1e293b] flex flex-col items-center justify-center p-6 overflow-hidden border-b md:border-b-0 md:border-r border-slate-700">
                  <div className="w-16 h-16 rounded-full bg-slate-700/70 border border-slate-600 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">
                      {selectedProduct.name.match(/\$[\d\.]+/)?.[0] || '$100.000'}
                    </span>
                    <span className="text-sm font-bold text-slate-300">COP</span>
                  </div>
                  <span className="mt-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Acreditación App Supergiros
                  </span>
                </div>
              ) : (
                <div className="relative aspect-4/3 md:aspect-auto bg-white flex items-center justify-center p-6 overflow-hidden border-b md:border-b-0 md:border-r border-slate-100">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain max-h-72"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/95 text-slate-900 shadow-sm">
                      {selectedProduct.category}
                    </span>
                    {selectedProduct.isDigital && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-600 text-white shadow-sm flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        Entrega Digital Instantánea
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Product Info */}
              <div className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {selectedProduct.brand && (
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
                      {selectedProduct.brand}
                    </span>
                  )}
                  <h2 className="text-xl font-bold text-slate-900 leading-snug">
                    {selectedProduct.name}
                  </h2>

                  {/* Points Box */}
                  <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block">
                        Costo de Canje
                      </span>
                      <div className="flex items-center gap-1.5 text-2xl font-black text-amber-600">
                        <Coins className="w-6 h-6 text-amber-500" />
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
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Delivery type note */}
                  <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {selectedProduct.isDigital ? (
                      <>
                        <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>Recepción de código y PIN por correo/SMS inmediatamente tras el canje.</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Envío físico coordinado con la red logística a tu punto o dirección.</span>
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
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30'
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
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-400">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.length === 1 ? 'premio' : 'premios'} en carrito
              </p>
              <div className="text-sm font-black flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>{formatPoints(cart.reduce((sum, i) => sum + (i.product.pointsCost * i.quantity), 0))} pts</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenCart}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <span>Ver Carrito</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
