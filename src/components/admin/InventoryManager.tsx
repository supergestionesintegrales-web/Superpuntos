import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Coins, 
  AlertTriangle, 
  CheckCircle2, 
  Image as ImageIcon, 
  Sparkles, 
  Zap, 
  Filter,
  X,
  Layers,
  Star
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import { formatPoints } from '../../utils/helpers';

const CATEGORIES: ProductCategory[] = [
  'Artículos',
  'Bonos'
];

interface InventoryManagerProps {
  isModalOpenExternal?: boolean;
  onCloseExternalModal?: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  isModalOpenExternal,
  onCloseExternalModal
}) => {
  const { products, addProduct, updateProduct, deleteProduct, updateProductStock } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(isModalOpenExternal || false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Artículos' as ProductCategory,
    pointsCost: 25,
    stock: 10,
    brand: '',
    description: '',
    specifications: '',
    imageUrl: '',
    isDigital: false,
    isFeatured: false,
    active: true
  });

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q));
    }
    return true;
  });

  const lowStockCount = products.filter(p => p.stock < 5).length;
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Artículos',
      pointsCost: 25,
      stock: 10,
      brand: '',
      description: '',
      specifications: '',
      imageUrl: '',
      isDigital: false,
      isFeatured: false,
      active: true
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      pointsCost: product.pointsCost,
      stock: product.stock,
      brand: product.brand || '',
      description: product.description,
      specifications: product.specifications ? product.specifications.join('\n') : '',
      imageUrl: product.imageUrl,
      isDigital: product.isDigital,
      isFeatured: product.isFeatured || false,
      active: product.active
    });
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingProduct(null);
    if (onCloseExternalModal) onCloseExternalModal();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const specsArray = formData.specifications
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        category: formData.category,
        pointsCost: formData.pointsCost,
        stock: formData.stock,
        brand: formData.brand || undefined,
        description: formData.description,
        specifications: specsArray,
        imageUrl: formData.imageUrl,
        isDigital: formData.isDigital,
        isFeatured: formData.isFeatured,
        active: formData.active
      });
    } else {
      addProduct({
        name: formData.name,
        category: formData.category,
        pointsCost: formData.pointsCost,
        stock: formData.stock,
        brand: formData.brand || undefined,
        description: formData.description,
        specifications: specsArray,
        imageUrl: formData.imageUrl,
        isDigital: formData.isDigital,
        isFeatured: formData.isFeatured,
        active: formData.active
      });
    }

    handleCloseModal();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${name}" del catálogo?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Administración del Catálogo de Premios
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Gestión de Inventario y Recompensas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Agrega nuevos premios, actualiza costos en puntos, controla existencias y define productos destacados.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Agregar Nuevo Premio</span>
        </button>
      </div>

      {/* KPI mini strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">Total Productos</span>
          <span className="text-xl font-black text-slate-900">{products.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">Unidades en Stock</span>
          <span className="text-xl font-black text-slate-900">{totalStockUnits} un.</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 block">Stock Bajo (&lt;5 un.)</span>
          <span className={`text-xl font-black ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {lowStockCount} alertas
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-700 block">Bonos Digitales</span>
          <span className="text-xl font-black text-indigo-600">
            {products.filter(p => p.isDigital).length}
          </span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o marca de producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 shrink-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({products.length})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Producto & Categoría</th>
                <th className="p-4">Costo en Puntos</th>
                <th className="p-4 text-center">Stock Actual</th>
                <th className="p-4 text-center">Tipo / Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const isLow = product.stock < 5;
                const isOut = product.stock <= 0;

                return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Product Name & Img */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{product.name}</span>
                            {product.isFeatured && (
                              <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-sm flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                Destacado
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span>{product.category}</span>
                            {product.brand && <span>• Marca: {product.brand}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cost in points */}
                    <td className="p-4">
                      <div className="font-black text-amber-600 text-sm flex items-center gap-1">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span>{formatPoints(product.pointsCost)}</span>
                        <span className="text-[10px] text-slate-500">pts</span>
                      </div>
                    </td>

                    {/* Stock Stepper */}
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          onClick={() => updateProductStock(product.id, Math.max(0, product.stock - 1))}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer"
                        >
                          -
                        </button>

                        <span className={`px-2 font-black text-xs ${
                          isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-800'
                        }`}>
                          {product.stock} un.
                        </span>

                        <button
                          onClick={() => updateProductStock(product.id, product.stock + 5)}
                          className="px-1.5 py-0.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
                          title="Sumar +5 unidades"
                        >
                          +5
                        </button>
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {product.isDigital ? (
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Digital
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                            Físico
                          </span>
                        )}

                        {!product.active && (
                          <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.2 rounded-sm">
                            Inactivo
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-inner">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    {editingProduct ? 'Modificar Premio' : 'Nuevo Registro'}
                  </span>
                  <h2 className="text-xl font-bold mt-0.5">
                    {editingProduct ? `Editar: ${editingProduct.name}` : 'Crear Nuevo Premio en Catálogo'}
                  </h2>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nombre del Premio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Freidora de Aire Digital 4.5L"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 bg-slate-50"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Costo en Puntos *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-amber-600 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Stock Inicial *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Marca / Proveedor</label>
                  <input
                    type="text"
                    placeholder="Ej: Philips, Oster, Puma..."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">URL de Imagen del Producto</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                  />
                  {formData.imageUrl && (
                    <div className="w-9 h-9 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Descripción Comercial *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe las características atractivas del premio..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Specifications */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Especificaciones Técnicas (Una por línea)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Capacidad 4.5 Litros&#10;Potencia 1500W&#10;Garantía 1 año"
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-amber-500 font-mono"
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDigital}
                    onChange={(e) => setFormData({ ...formData, isDigital: e.target.checked })}
                    className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Bono / Voucher Digital</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded-md border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Producto Destacado</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Activo en Tienda</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{editingProduct ? 'Guardar Cambios' : 'Publicar en Catálogo'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
