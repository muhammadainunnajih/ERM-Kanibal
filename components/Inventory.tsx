
import React, { useState } from 'react';
import { 
  Package, Search, AlertTriangle, ArrowUpRight, ArrowDownRight, 
  Plus, Pencil, Trash2, X, Check, Filter, 
  TrendingUp, TrendingDown, MoreVertical, Archive
} from 'lucide-react';
import { Medicine } from '../types';

interface InventoryProps {
  medicines: Medicine[];
  onAdd: (med: Medicine) => void;
  onUpdate: (med: Medicine) => void;
  onDelete: (id: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ medicines, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Semua' | 'Aman' | 'Hampir Habis' | 'Kritis'>('Semua');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustQty, setAdjustQty] = useState(1);

  // Form State for Add/Edit
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: '',
    category: 'Obat Bebas',
    stock: 0,
    unit: 'Tab',
    price: 0
  });

  const getStatus = (stock: number) => {
    if (stock <= 15) return 'Kritis';
    if (stock <= 50) return 'Hampir Habis';
    return 'Aman';
  };

  const filteredItems = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         med.id.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getStatus(med.stock);
    const matchesFilter = filterStatus === 'Semua' || status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const criticalCount = medicines.filter(m => getStatus(m.stock) === 'Kritis').length;
  const warningCount = medicines.filter(m => getStatus(m.stock) === 'Hampir Habis').length;

  const handleOpenModal = (med?: Medicine) => {
    if (med) {
      setSelectedMed(med);
      setFormData(med);
    } else {
      setSelectedMed(null);
      setFormData({
        name: '',
        category: 'Obat Bebas',
        stock: 0,
        unit: 'Tab',
        price: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenAdjust = (med: Medicine, type: 'in' | 'out') => {
    setSelectedMed(med);
    setAdjustType(type);
    setAdjustQty(1);
    setIsAdjustModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMed) {
      onUpdate({ ...selectedMed, ...formData } as Medicine);
    } else {
      const newMed: Medicine = {
        ...formData,
        id: `OB-${Math.floor(1000 + Math.random() * 9000)}`,
      } as Medicine;
      onAdd(newMed);
    }
    setIsModalOpen(false);
  };

  const handleExecuteAdjust = () => {
    if (!selectedMed) return;
    const newStock = adjustType === 'in' 
      ? selectedMed.stock + adjustQty 
      : Math.max(0, selectedMed.stock - adjustQty);
    
    onUpdate({ ...selectedMed, stock: newStock });
    setIsAdjustModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedMed) {
      onDelete(selectedMed.id);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventaris & Stok</h2>
          <p className="text-gray-500">Kelola persediaan obat dan peralatan medis secara real-time.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={20} />
          <span>Tambah Barang Baru</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Total Item</p>
            <p className="text-3xl font-black text-gray-900 leading-tight">{medicines.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Archive size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-orange-400 uppercase tracking-widest leading-none">Hampir Habis</p>
            <p className="text-3xl font-black text-orange-600 leading-tight">{warningCount}</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
            <Filter size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-red-400 uppercase tracking-widest leading-none">Stok Kritis</p>
            <p className="text-3xl font-black text-red-600 leading-tight">{criticalCount}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama barang atau kode..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            {['Semua', 'Aman', 'Hampir Habis', 'Kritis'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === status 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Nama Barang</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Stok Saat Ini</th>
                <th className="px-6 py-4">Harga Satuan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi Stok</th>
                <th className="px-6 py-4 text-center">Menu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredItems.map((item) => {
                const status = getStatus(item.stock);
                return (
                  <tr key={item.id} className="hover:bg-blue-50/10 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-tighter">{item.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-baseline space-x-1">
                        <span className={`text-xl font-black ${status === 'Kritis' ? 'text-red-600' : status === 'Hampir Habis' ? 'text-orange-600' : 'text-gray-900'}`}>
                          {item.stock}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      Rp {item.price.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        status === 'Aman' ? 'bg-emerald-100 text-emerald-700' : 
                        status === 'Kritis' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleOpenAdjust(item, 'in')}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          title="Masuk (+)"
                        >
                          <TrendingUp size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenAdjust(item, 'out')}
                          className="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                          title="Keluar (-)"
                        >
                          <TrendingDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => { setSelectedMed(item); setIsDeleteModalOpen(true); }}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <Package className="mx-auto text-gray-200 mb-4" size={56} />
                    <p className="text-gray-400 font-bold text-lg">Tidak ada item yang ditemukan.</p>
                    <button onClick={() => setFilterStatus('Semua')} className="text-blue-600 text-sm font-bold mt-2 hover:underline">Tampilkan semua barang</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedMed ? 'Update Item Barang' : 'Tambah Barang Baru'}</h3>
                <p className="text-sm text-gray-500 mt-1">Lengkapi informasi inventaris klinik.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full text-gray-400 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Barang / Obat</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-800 shadow-inner"
                  placeholder="Contoh: Paracetamol Syrup"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Kategori</label>
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-800 appearance-none shadow-inner"
                  >
                    <option value="Obat Bebas">Obat Bebas</option>
                    <option value="Antibiotik">Antibiotik</option>
                    <option value="Alat Kesehatan">Alat Kesehatan</option>
                    <option value="Sanitasi">Sanitasi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Satuan</label>
                  <input 
                    required
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-800 shadow-inner"
                    placeholder="Tab / Kap / Btl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Jumlah Stok</label>
                  <input 
                    required
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-800 shadow-inner"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Harga Satuan (Rp)</label>
                  <input 
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-800 shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-6 flex space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-sm text-gray-400">BATAL</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center space-x-2 transition-all">
                  <Check size={20} />
                  <span>{selectedMed ? 'SIMPAN PERUBAHAN' : 'SIMPAN BARANG'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quick Adjustment */}
      {isAdjustModalOpen && selectedMed && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className={`p-8 text-white ${adjustType === 'in' ? 'bg-emerald-600' : 'bg-orange-600'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">STOK {adjustType === 'in' ? 'MASUK' : 'KELUAR'}</h3>
                  <p className="text-xs font-bold opacity-80 mt-1">{selectedMed.name}</p>
                </div>
                <button onClick={() => setIsAdjustModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full"><X size={20} /></button>
              </div>
              <div className="mt-8 flex items-center justify-center space-x-6">
                <button 
                  onClick={() => setAdjustQty(Math.max(1, adjustQty - 1))}
                  className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center hover:bg-white/10 transition-all font-black text-2xl"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="text-5xl font-black">{adjustQty}</span>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{selectedMed.unit}</p>
                </div>
                <button 
                  onClick={() => setAdjustQty(adjustQty + 1)}
                  className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center hover:bg-white/10 transition-all font-black text-2xl"
                >
                  +
                </button>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center text-gray-500 font-bold text-xs uppercase tracking-widest">
                <span>Stok Saat Ini</span>
                <span>{selectedMed.stock} {selectedMed.unit}</span>
              </div>
              <div className="flex justify-between items-center font-black text-gray-900">
                <span className="uppercase text-xs tracking-widest">Stok Baru</span>
                <span className="text-xl">
                  {adjustType === 'in' ? selectedMed.stock + adjustQty : Math.max(0, selectedMed.stock - adjustQty)} {selectedMed.unit}
                </span>
              </div>
              <button 
                onClick={handleExecuteAdjust}
                className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all text-white ${
                  adjustType === 'in' ? 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700' : 'bg-orange-600 shadow-orange-100 hover:bg-orange-700'
                }`}
              >
                KONFIRMASI PERUBAHAN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedMed && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-sm p-10 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={40} /></div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Hapus Barang?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">Item <b>{selectedMed.name}</b> akan dihapus permanen dari data inventaris klinik.</p>
            <div className="flex space-x-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">BATAL</button>
              <button 
                onClick={handleDelete}
                className="flex-[1.5] py-4 bg-red-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-red-100 uppercase tracking-widest"
              >
                YA, HAPUS BARANG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
