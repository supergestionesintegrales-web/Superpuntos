import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Coins, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  Layers, 
  Gift, 
  Banknote, 
  Check, 
  X, 
  Image as ImageIcon,
  Minus,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import { formatPoints } from '../../utils/helpers';

interface InventoryManagerProps {
  isModalOpenExternal?: boolean;
  onCloseExternalModal?: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  isModalOpenExternal,
  onCloseExternalModal
}) => {
  const { products, addProduct, updateProduct, deleteProduct, updateStock } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(isModalOpenExternal || false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Todos' | ProductCategory>('Todos');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'active' | 'inactive'>('all');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Artículos' as ProductCategory,
    pointsCost: 20,
    stock: 25,
    imageUrl: '',
    brand: 'SuperGIROS',
    specificationsText: '',
    isDigital: false,
    isFeatured: false,
    active: true
  });

  // Watch external trigger
  useEffect(() => {
    if (isModalOpenExternal) {
      handleOpenAdd();
    }
  }, [isModalOpenExternal]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'Artículos',
      pointsCost: 20,
      stock: 25,
      imageUrl: '',
      brand: 'SuperGIROS',
      specificationsText: '',
      isDigital: false,
      isFeatured: false,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      pointsCost: product.pointsCost,
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      brand: product.brand || 'SuperGIROS',
      specificationsText: Array.isArray(product.specifications) 
        ? product.specifications.join('\n') 
        : (product.specifications || ''),
      isDigital: !!product.isDigital,
      isFeatured: !!(product.isFeatured || product.featured),
      active: product.active
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    if (onCloseExternalModal) {
      onCloseExternalModal();
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Por favor ingresa el nombre del premio.');
      return;
    }

    const specsArray = formData.specificationsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        pointsCost: Number(formData.pointsCost) || 1,
        stock: Number(formData.stock) || 0,
        imageUrl: formData.imageUrl.trim(),
        brand: formData.brand.trim() || 'SuperGIROS',
        specifications: specsArray,
        isDigital: formData.isDigital,
        isFeatured: formData.isFeatured,
        featured: formData.isFeatured,
        active: formData.active
      });
    } else {
      addProduct({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        pointsCost: Number(formData.pointsCost) || 1,
        stock: Number(formData.stock) || 0,
        imageUrl: formData.imageUrl.trim(),
        brand: formData.brand.trim() || 'SuperGIROS',
        specifications: specsArray,
        isDigital: formData.isDigital,
        isFeatured: formData.isFeatured,
        featured: formData.isFeatured,
        active: formData.active
      });
    }

    handleCloseModal();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el premio "${name}" del catálogo?`)) {
      deleteProduct(id);
    }
  };

  // Filtered products
  const filteredProducts = products.filter(p => {
    // Category filter
    if (categoryFilter !== 'Todos' && p.category !== categoryFilter) {
      return false;
    }

    // Stock/Status filter
    if (stockStatusFilter === 'low' && (p.stock >= 5 || p.stock <= 0)) return false;
    if (stockStatusFilter === 'out' && p.stock > 0) return false;
    if (stockStatusFilter === 'active' && !p.active) return false;
    if (stockStatusFilter === 'inactive' && p.active) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;
      if (!matchName && !matchDesc && !matchBrand) return false;
    }

    return true;
  });

  // KPIs
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 5 && p.active).length;
  const outOfStockCount = products.filter(p => p.stock <= 0 && p.active).length;
  const bonosCount = products.filter(p => p.category === 'Bonos').length;
  const articulosCount = products.filter(p => p.category === 'Artículos').length;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Control de Premios y Almacén
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Gestión de Inventario
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administra los premios del catálogo, ajusta existencias y crea nuevos bonos o artículos.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-900 hover:bg-blue-800 text-white shadow-md shadow-blue-950/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Nuevo Premio</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Premios</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{products.length}</span>
            <span className="text-xs text-slate-500">{articulosCount} art. / {bonosCount} bonos</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unidades en Almacén</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{totalStock}</span>
            <span className="text-xs text-emerald-600 font-semibold">Existencias</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stock Crítico (&lt; 5)</p>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-black ${lowStockCount > 0 ? 'text-blue-900' : 'text-slate-900'}`}>
              {lowStockCount}
            </span>
            {lowStockCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900">
                Atención
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Agotados (0 un.)</p>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-black ${outOfStockCount > 0 ? 'text-red-500' : 'text-slate-900'}`}>
              {outOfStockCount}
            </span>
            {outOfStockCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                Reponer
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar premio por nombre, marca o especificación..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 transition-all text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stock status filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStockStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                stockStatusFilter === 'all' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setStockStatusFilter('low')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                stockStatusFilter === 'low' 
                  ? 'bg-blue-900 text-white font-bold' 
                  : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
              }`}
            >
              Stock Bajo ({lowStockCount})
            </button>
            <button
              onClick={() => setStockStatusFilter('out')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                stockStatusFilter === 'out' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Agotados ({outOfStockCount})
            </button>
            <button
              onClick={() => setStockStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                stockStatusFilter === 'active' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Activos
            </button>
          </div>

        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Categoría:</span>
          {(['Todos', 'Artículos', 'Bonos'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No se encontraron productos</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ajusta los filtros de búsqueda o agrega un nuevo premio al catálogo comercial.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            + Crear Nuevo Premio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map(product => {
            const isLowStock = product.stock > 0 && product.stock < 5;
            const isOutOfStock = product.stock <= 0;

            return (
              <div 
                key={product.id}
                className={`bg-white rounded-3xl border transition-all shadow-xs flex flex-col justify-between overflow-hidden ${
                  !product.active 
                    ? 'border-slate-200 opacity-60 bg-slate-50/50' 
                    : isOutOfStock
                    ? 'border-red-200 hover:border-red-300'
                    : isLowStock
                    ? 'border-blue-300 hover:border-blue-400'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Image Preview or Fallback */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-contain p-4 mix-blend-multiply"
                        onError={(e) => {
                          // Fallback on broken image link
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold ${
                        product.isDigital || product.category === 'Bonos'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-900'
                      }`}>
                        {product.isDigital || product.category === 'Bonos' ? <Banknote className="w-8 h-8" /> : <Gift className="w-8 h-8" />}
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-xs shadow-xs">
                        {product.category}
                      </span>
                      {(product.isDigital || product.category === 'Bonos') && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-1 rounded-full bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                          <Banknote className="w-3 h-3" />
                          App SuperGiros
                        </span>
                      )}
                      {(product.isFeatured || product.featured) && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-1 rounded-full bg-blue-900 text-white flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3" /> Destacado
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        product.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          {product.brand || 'SuperGIROS'}
                        </span>
                        <h3 className="font-heading font-extrabold text-base text-slate-900 leading-tight">
                          {product.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-baseline gap-1 font-black text-lg text-blue-900 shrink-0">
                        {formatPoints(product.pointsCost)}
                        <span className="text-[10px] font-bold text-slate-400">PTS</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description || 'Sin descripción comercial.'}
                    </p>

                    {/* Specifications List */}
                    {product.specifications && product.specifications.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {product.specifications.slice(0, 3).map((spec, i) => (
                          <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md truncate max-w-full">
                            • {spec}
                          </span>
                        ))}
                        {product.specifications.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">
                            +{product.specifications.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls & Stock Quick-Edit */}
                <div className="p-5 pt-0 space-y-3">
                  
                  {/* Stock Quick Stepper */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Existencias</span>
                      <span className={`font-black ${
                        isOutOfStock 
                          ? 'text-red-600' 
                          : isLowStock 
                          ? 'text-blue-900' 
                          : 'text-slate-800'
                      }`}>
                        {product.stock} disponibles
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateStock(product.id, Math.max(0, product.stock - 1))}
                        disabled={product.stock <= 0}
                        title="Disminuir stock en 1"
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 border border-slate-300 disabled:opacity-40 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => updateStock(product.id, product.stock + 1)}
                        title="Aumentar stock en 1"
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Product Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900">
                    {editingProduct ? 'Editar Premio' : 'Nuevo Premio del Catálogo'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configura la información del producto y costo en Superpuntos
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Premio / Bono *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Kit Supergiros, Bono $100.000 COP, Freidora de Aire"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-slate-900"
                />
              </div>

              {/* Two Column: Category & Points Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-slate-900 cursor-pointer"
                  >
                    <option value="Artículos">Artículos (Físico)</option>
                    <option value="Bonos">Bonos (Digital / Saldo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Costo en Puntos *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="25"
                      value={formData.pointsCost}
                      onChange={e => setFormData({ ...formData, pointsCost: Number(e.target.value) })}
                      className="w-full pl-3.5 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-slate-900 font-bold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-900">
                      PTS
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Column: Stock & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Inicial (Unidades) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="50"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Marca / Proveedor
                  </label>
                  <input
                    type="text"
                    placeholder="SuperGIROS, Oster, Sony, etc."
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-slate-900"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL de Imagen del Producto
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://i.postimg.cc/... o enlace directo a la imagen"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-slate-900"
                  />
                  {formData.imageUrl && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md overflow-hidden border border-slate-200">
                      <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Recomendado usar enlaces a imágenes directas (Postimages, Imgur, Cloudinary).
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción Comercial
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre el premio, garantía o condiciones de redención..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-slate-900 resize-none"
                />
              </div>

              {/* Specifications (one per line) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Especificaciones / Viñetas (una por línea)
                </label>
                <textarea
                  rows={3}
                  placeholder="Capacidad 4 Litros&#10;Garantía de 1 año&#10;Incluye recetario oficial"
                  value={formData.specificationsText}
                  onChange={e => setFormData({ ...formData, specificationsText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-slate-900 font-mono text-xs resize-none"
                />
              </div>

              {/* Checkboxes / Toggles */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isDigital}
                    onChange={e => setFormData({ ...formData, isDigital: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Es Digital</p>
                    <span className="text-[10px] text-slate-500">Bono o pin</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Destacado</p>
                    <span className="text-[10px] text-slate-500">Prioridad catálogo</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Disponible</p>
                    <span className="text-[10px] text-slate-500">Visible a aliados</span>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs shadow-md shadow-blue-950/20 transition-all active:scale-95 cursor-pointer"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
