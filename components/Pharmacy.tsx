
import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Search, Plus, Trash2, Pencil, X, 
  Check, ClipboardList, Clock, User, Pill, AlertCircle,
  ArrowLeft, LayoutGrid, List, PlusCircle
} from 'lucide-react';
import { Prescription, Patient, Doctor, Medicine } from '../types';

interface PharmacyProps {
  prescriptions: Prescription[];
  patients: Patient[];
  doctors: Doctor[];
  medicines: Medicine[];
  onAdd: (rx: Prescription) => void;
  onUpdate: (rx: Prescription) => void;
  onDelete: (id: string) => void;
  onAddMedicine: (med: Medicine) => void;
  onUpdateMedicine: (med: Medicine) => void;
  onDeleteMedicine: (id: string) => void;
}

export const Pharmacy: React.FC<PharmacyProps> = ({ 
  prescriptions, patients, doctors, medicines,
  onAdd, onUpdate, onDelete,
  onAddMedicine, onUpdateMedicine, onDeleteMedicine
}) => {
  const [view, setView] = useState<'prescriptions' | 'stock'>('prescriptions');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRx, setEditingRx] = useState<Prescription | null>(null);
  const [rxToDelete, setRxToDelete] = useState<string | null>(null);

  // Medicine Stock Modal States
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [isMedDeleteModalOpen, setIsMedDeleteModalOpen] = useState(false);
  const [medToDelete, setMedToDelete] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState<Partial<Prescription>>({
    patientName: '',
    doctorName: '',
    status: 'Menunggu Antrian',
    medicines: '',
  });

  const [medFormData, setMedFormData] = useState<Partial<Medicine>>({
    name: '',
    category: 'Obat Bebas',
    stock: 0,
    unit: 'Tab',
    price: 0
  });

  // Searchable Patient Selection
  const [patientSearch, setPatientSearch] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const patientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientRef.current && !patientRef.current.contains(event.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
    p.rmNumber.includes(patientSearch)
  );

  const filteredItems = view === 'prescriptions' 
    ? prescriptions.filter(rx => rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || rx.id.toLowerCase().includes(searchTerm.toLowerCase()))
    : medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.category.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenModal = (rx?: Prescription) => {
    if (rx) {
      setEditingRx(rx);
      setFormData(rx);
      setPatientSearch(rx.patientName);
    } else {
      setEditingRx(null);
      setFormData({
        patientName: '',
        doctorName: doctors[0]?.name || '',
        status: 'Menunggu Antrian',
        medicines: '',
      });
      setPatientSearch('');
    }
    setIsModalOpen(true);
  };

  const handleOpenMedModal = (med?: Medicine) => {
    if (med) {
      setEditingMed(med);
      setMedFormData(med);
    } else {
      setEditingMed(null);
      setMedFormData({
        name: '',
        category: 'Obat Bebas',
        stock: 0,
        unit: 'Tab',
        price: 0
      });
    }
    setIsMedModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRx) {
      onUpdate({ ...editingRx, ...formData } as Prescription);
    } else {
      const newRx: Prescription = {
        ...formData,
        id: `RX${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
      } as Prescription;
      onAdd(newRx);
    }
    setIsModalOpen(false);
  };

  const handleMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMed) {
      onUpdateMedicine({ ...editingMed, ...medFormData } as Medicine);
    } else {
      const newMed: Medicine = {
        ...medFormData,
        id: `OB-${Math.floor(100 + Math.random() * 900)}`,
      } as Medicine;
      onAddMedicine(newMed);
    }
    setIsMedModalOpen(false);
  };

  const confirmDelete = (id: string) => {
    setRxToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmMedDelete = (id: string) => {
    setMedToDelete(id);
    setIsMedDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {view === 'stock' && (
            <button 
              onClick={() => setView('prescriptions')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{view === 'prescriptions' ? 'Antrian Apotek' : 'Stok Obat'}</h2>
            <p className="text-gray-500">
              {view === 'prescriptions' ? 'Kelola resep obat dan distribusi farmasi.' : 'Manajemen persediaan obat klinik.'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setView(view === 'prescriptions' ? 'stock' : 'prescriptions')}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-sm border ${
              view === 'stock' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ClipboardList size={18} />
            <span>{view === 'prescriptions' ? 'Stok Obat' : 'Lihat Antrian'}</span>
          </button>
          <button 
            onClick={() => view === 'prescriptions' ? handleOpenModal() : handleOpenMedModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus size={18} />
            <span>{view === 'prescriptions' ? 'Tambah Resep' : 'Tambah Obat'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder={`Cari ${view === 'prescriptions' ? 'pasien atau ID resep...' : 'nama obat atau kategori...'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            
            <div className="divide-y divide-gray-50">
              {view === 'prescriptions' ? (
                // Prescription List View
                filteredItems.map((item) => {
                  const rx = item as Prescription;
                  return (
                    <div key={rx.id} className="p-6 hover:bg-blue-50/10 transition-all group relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                            rx.status === 'Siap Diambil' ? 'bg-emerald-50 text-emerald-600' : 
                            rx.status === 'Diproses' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            <Pill size={28} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-gray-900 text-lg">{rx.patientName}</h4>
                              <span className="text-[10px] font-mono text-gray-400">#{rx.id}</span>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center mt-0.5">
                              <User size={12} className="mr-1" /> {rx.doctorName}
                            </p>
                            <p className="text-xs text-gray-400 mt-2 italic line-clamp-1">"{rx.medicines}"</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                              rx.status === 'Siap Diambil' ? 'bg-emerald-100 text-emerald-700' : 
                              rx.status === 'Diproses' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
                            }`}>
                              {rx.status}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold flex items-center justify-end">
                              <Clock size={10} className="mr-1" /> {rx.date}
                            </p>
                          </div>
                          
                          <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(rx)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
                            <button onClick={() => confirmDelete(rx.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Medicine Stock View
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Obat</th>
                        <th className="px-6 py-4">Kategori</th>
                        <th className="px-6 py-4">Stok</th>
                        <th className="px-6 py-4">Harga Satuan</th>
                        <th className="px-6 py-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredItems.map((item) => {
                        const med = item as Medicine;
                        return (
                          <tr key={med.id} className="hover:bg-gray-50/50 group">
                            <td className="px-6 py-4">
                              <p className="font-bold text-gray-900">{med.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">{med.id}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600 uppercase">{med.category}</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className={`font-black ${med.stock < 20 ? 'text-red-600' : 'text-gray-900'}`}>{med.stock} <span className="text-[10px] font-medium text-gray-400 uppercase">{med.unit}</span></p>
                              {med.stock < 20 && <p className="text-[9px] font-black text-red-500 uppercase">Segera Re-stock</p>}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">Rp {med.price.toLocaleString('id-ID')}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center space-x-2">
                                <button onClick={() => handleOpenMedModal(med)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={14} /></button>
                                <button onClick={() => confirmMedDelete(med.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredItems.length === 0 && (
                <div className="p-20 text-center">
                  <Package className="mx-auto text-gray-200 mb-4" size={48} />
                  <p className="text-gray-400 font-medium">Tidak ada data yang ditemukan.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
            <h3 className="font-bold text-gray-900 text-lg">Informasi Ringkas</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{view === 'prescriptions' ? 'Total Antrian' : 'Total Item Obat'}</p>
                  <p className="text-3xl font-black text-blue-900 mt-1">{filteredItems.length}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  {view === 'prescriptions' ? <ClipboardList size={24} /> : <Package size={24} />}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{view === 'prescriptions' ? 'Dalam Proses' : 'Stok Kritis'}</p>
                  <p className="text-3xl font-black text-orange-900 mt-1">
                    {view === 'prescriptions' 
                      ? prescriptions.filter(r => r.status === 'Diproses').length
                      : medicines.filter(m => m.stock < 20).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm">
                  {view === 'prescriptions' ? <Clock size={24} /> : <AlertCircle size={24} />}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-100">
            <h4 className="font-bold text-lg mb-2">Bantuan Cepat</h4>
            <p className="text-sm text-indigo-100 leading-relaxed mb-6 italic">
              "Kesehatan pasien adalah prioritas utama. Pastikan akurasi dosis obat sebelum diserahkan."
            </p>
            <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
              Hubungi Admin Farmasi
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form Resep dengan Searchable Patient */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{editingRx ? 'Update Resep' : 'Buat Resep Baru'}</h3>
                <p className="text-sm text-gray-500 mt-1">Input rincian obat untuk pasien.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full text-gray-400 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 relative" ref={patientRef}>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Pilih Pasien</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      required
                      type="text"
                      placeholder="Cari nama/No. RM..."
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        setIsPatientDropdownOpen(true);
                        setFormData({...formData, patientName: ''});
                      }}
                      onFocus={() => setIsPatientDropdownOpen(true)}
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800"
                    />
                  </div>
                  {isPatientDropdownOpen && patientSearch && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setPatientSearch(p.name);
                              setFormData({...formData, patientName: p.name});
                              setIsPatientDropdownOpen(false);
                            }}
                            className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors flex flex-col"
                          >
                            <span className="font-bold text-gray-900">{p.name}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-bold">{p.rmNumber}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-5 py-4 text-center text-xs text-gray-400 italic">Pasien tidak ditemukan.</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Dokter Pemeriksa</label>
                  <select 
                    required
                    value={formData.doctorName}
                    onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800 appearance-none"
                  >
                    {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Daftar Obat & Dosis</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.medicines}
                  onChange={(e) => setFormData({...formData, medicines: e.target.value})}
                  placeholder="Contoh: Paracetamol 500mg (10 Tab), 3x1 sehari"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Status Antrian</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Menunggu Antrian', 'Diproses', 'Siap Diambil'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({...formData, status: s as any})}
                      className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        formData.status === s 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                          : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {s.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-sm text-gray-400">Batal</button>
                <button 
                  disabled={!formData.patientName}
                  type="submit" 
                  className={`flex-[2] py-4 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center space-x-2 transition-all ${
                    formData.patientName ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Check size={20} />
                  <span>{editingRx ? 'SIMPAN PERUBAHAN' : 'BUAT RESEP'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form Stok Obat */}
      {isMedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{editingMed ? 'Update Item Obat' : 'Tambah Stok Obat'}</h3>
                <p className="text-sm text-gray-500 mt-1">Kelola persediaan farmasi klinik.</p>
              </div>
              <button onClick={() => setIsMedModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full text-gray-400 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleMedSubmit} className="p-8 pt-4 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Obat</label>
                <input 
                  required
                  type="text"
                  value={medFormData.name}
                  onChange={(e) => setMedFormData({...medFormData, name: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800"
                  placeholder="Contoh: Paracetamol 500mg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Kategori</label>
                  <select 
                    required
                    value={medFormData.category}
                    onChange={(e) => setMedFormData({...medFormData, category: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800"
                  >
                    <option value="Obat Bebas">Obat Bebas</option>
                    <option value="Antibiotik">Antibiotik</option>
                    <option value="Suplemen">Suplemen</option>
                    <option value="Antihistamin">Antihistamin</option>
                    <option value="Alat Kesehatan">Alat Kesehatan</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Satuan</label>
                  <input 
                    required
                    type="text"
                    value={medFormData.unit}
                    onChange={(e) => setMedFormData({...medFormData, unit: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800"
                    placeholder="Tab / Kap / Strip / Btl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Jumlah Stok</label>
                  <input 
                    required
                    type="number"
                    value={medFormData.stock}
                    onChange={(e) => setMedFormData({...medFormData, stock: Number(e.target.value)})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Harga (Rp)</label>
                  <input 
                    required
                    type="number"
                    value={medFormData.price}
                    onChange={(e) => setMedFormData({...medFormData, price: Number(e.target.value)})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800"
                  />
                </div>
              </div>

              <div className="pt-4 flex space-x-4">
                <button type="button" onClick={() => setIsMedModalOpen(false)} className="flex-1 py-4 font-black text-sm text-gray-400">Batal</button>
                <button type="submit" className="flex-[2] py-4 bg-emerald-600 text-white font-black text-sm rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 flex items-center justify-center space-x-2 transition-all">
                  <Check size={20} />
                  <span>{editingMed ? 'UPDATE OBAT' : 'SIMPAN OBAT'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation (Resep) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-sm p-10 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertCircle size={40} /></div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Batalkan Resep?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">Data antrian resep ini akan dihapus permanen dari sistem.</p>
            <div className="flex space-x-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Tutup</button>
              <button 
                onClick={() => { if(rxToDelete) onDelete(rxToDelete); setIsDeleteModalOpen(false); }}
                className="flex-[1.5] py-4 bg-red-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-red-100 uppercase tracking-widest"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation (Obat) */}
      {isMedDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-sm p-10 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertCircle size={40} /></div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Hapus Obat?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">Item obat ini akan dihapus dari inventaris farmasi secara permanen.</p>
            <div className="flex space-x-4">
              <button onClick={() => setIsMedDeleteModalOpen(false)} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Tutup</button>
              <button 
                onClick={() => { if(medToDelete) onDeleteMedicine(medToDelete); setIsMedDeleteModalOpen(false); }}
                className="flex-[1.5] py-4 bg-red-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-red-100 uppercase tracking-widest"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
