
import React, { useState, useRef, useEffect } from 'react';
import { 
  CreditCard, History, Wallet, CheckCircle2, AlertCircle, 
  Plus, Search, Trash2, Pencil, Printer, X, 
  FileText, Download, User, ArrowRight, Check,
  MinusCircle, PlusCircle, Smartphone, RefreshCcw
} from 'lucide-react';
import { Invoice, Patient, InvoiceItem } from '../types';

interface CashierProps {
  invoices: Invoice[];
  patients: Patient[];
  onAdd: (inv: Invoice) => void;
  onUpdate: (inv: Invoice) => void;
  onDelete: (id: string) => void;
}

export const Cashier: React.FC<CashierProps> = ({ invoices, patients, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [printType, setPrintType] = useState<'thermal' | 'standard' | 'pdf'>('standard');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invToDelete, setInvToDelete] = useState<string | null>(null);

  // Invoice Form State
  const [formData, setFormData] = useState<Partial<Invoice>>({
    patientName: '',
    patientId: '',
    status: 'Lunas',
    paymentMethod: 'Tunai',
    items: [{ name: 'Jasa Konsultasi Umum', qty: 1, price: 50000 }]
  });

  // Patient Search in Modal
  const [patientSearch, setPatientSearch] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const patientRef = useRef<HTMLDivElement>(null);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
    p.rmNumber.includes(patientSearch)
  );

  const filteredInvoices = invoices.filter(inv => 
    inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const revenueToday = invoices.reduce((acc, inv) => inv.status === 'Lunas' ? acc + inv.total : acc, 0);
  const pendingCount = invoices.filter(inv => inv.status === 'Pending').length;
  const successCount = invoices.filter(inv => inv.status === 'Lunas').length;

  const handleOpenModal = (inv?: Invoice) => {
    if (inv) {
      setFormData(inv);
      setPatientSearch(inv.patientName);
    } else {
      setFormData({
        patientName: '',
        patientId: '',
        status: 'Lunas',
        paymentMethod: 'Tunai',
        items: [{ name: 'Jasa Konsultasi Umum', qty: 1, price: 50000 }]
      });
      setPatientSearch('');
    }
    setIsModalOpen(true);
  };

  const addItem = () => {
    const items = [...(formData.items || [])];
    items.push({ name: '', qty: 1, price: 0 });
    setFormData({ ...formData, items });
  };

  const removeItem = (index: number) => {
    const items = [...(formData.items || [])];
    if (items.length > 1) {
      items.splice(index, 1);
      setFormData({ ...formData, items });
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const items = [...(formData.items || [])];
    items[index] = { ...items[index], [field]: value };
    setFormData({ ...formData, items });
  };

  const calculateTotal = (itemsToCalc?: InvoiceItem[]) => {
    return (itemsToCalc || formData.items || []).reduce((acc, item) => acc + (item.qty * item.price), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotal();
    if (formData.id) {
      onUpdate({ ...formData, total } as Invoice);
    } else {
      const newInv: Invoice = {
        ...formData,
        id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
        total
      } as Invoice;
      onAdd(newInv);
    }
    setIsModalOpen(false);
  };

  const handleStatusToggle = (inv: Invoice) => {
    const newStatus = inv.status === 'Lunas' ? 'Pending' : 'Lunas';
    onUpdate({ ...inv, status: newStatus });
  };

  const executePrint = () => {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Invoice - ${selectedInvoice?.id}</title>
          ${styles}
          <style>
            @page { margin: 0; }
            body { background: white; margin: 0; padding: 0; }
            #print-area { width: 100% !important; height: auto !important; box-shadow: none !important; margin: 0 !important; }
            ${printType === 'thermal' ? 'body { width: 80mm; }' : 'body { width: 210mm; padding: 20px; }'}
          </style>
        </head>
        <body>
          ${printArea.outerHTML}
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrint = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kasir & Pembayaran</h2>
          <p className="text-gray-500">Manajemen invoice dan transaksi keuangan klinik secara akurat.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={20} />
          <span>Buat Invoice Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-xs font-black uppercase tracking-widest">Pendapatan Hari Ini</span>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Wallet size={20} /></div>
          </div>
          <p className="text-3xl font-black text-gray-900">Rp {revenueToday.toLocaleString('id-ID')}</p>
          <div className="mt-2 flex items-center text-xs font-bold text-emerald-500">
            <Check size={14} className="mr-1" />
            <span>Dari {successCount} transaksi sukses</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-xs font-black uppercase tracking-widest">Pending Payments</span>
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600"><AlertCircle size={20} /></div>
          </div>
          <p className="text-3xl font-black text-gray-900">{pendingCount} Invoice</p>
          <div className="mt-2 flex items-center text-xs font-bold text-orange-500">
            <span>Perlu konfirmasi pembayaran</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-xs font-black uppercase tracking-widest">Transaksi Sukses</span>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><CheckCircle2 size={20} /></div>
          </div>
          <p className="text-3xl font-black text-gray-900">{successCount} Transaksi</p>
          <div className="mt-2 flex items-center text-xs font-bold text-emerald-500">
            <span>Semua pembayaran diverifikasi</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2">
            <History size={18} className="text-gray-400" />
            <span>Riwayat Transaksi Terbaru</span>
          </h3>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari invoice atau pasien..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Pasien</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Metode</th>
                <th className="px-6 py-4">Total Tagihan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-blue-50/10 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{inv.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{inv.patientName}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{inv.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-gray-600">
                      {inv.paymentMethod === 'QRIS' ? <Smartphone size={14} /> : <CreditCard size={14} />}
                      <span className="text-[10px] font-bold uppercase">{inv.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900">Rp {inv.total.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleStatusToggle(inv)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center mx-auto space-x-1 ${
                        inv.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                      title="Klik untuk ubah status"
                    >
                      <RefreshCcw size={10} className="mr-1" />
                      {inv.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handlePrint(inv)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Cetak Nota"
                      >
                        <Printer size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(inv)}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => { setInvToDelete(inv.id); setIsDeleteModalOpen(true); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <FileText className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-gray-400 font-medium">Belum ada transaksi yang tercatat.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Invoice Baru/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{formData.id ? 'Update Invoice' : 'Buat Invoice Baru'}</h3>
                <p className="text-sm text-gray-500 mt-1">Lengkapi rincian biaya untuk pasien.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full text-gray-400 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6 overflow-y-auto max-h-[80vh]">
              {/* Patient Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 relative" ref={patientRef}>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Pasien</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      required
                      type="text"
                      placeholder="Cari pasien..."
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        setIsPatientDropdownOpen(true);
                      }}
                      onFocus={() => setIsPatientDropdownOpen(true)}
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800"
                    />
                  </div>
                  {isPatientDropdownOpen && patientSearch && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                      {filteredPatients.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPatientSearch(p.name);
                            setFormData({...formData, patientName: p.name, patientId: p.id});
                            setIsPatientDropdownOpen(false);
                          }}
                          className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors flex flex-col"
                        >
                          <span className="font-bold text-gray-900 text-sm">{p.name}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{p.rmNumber}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Metode Bayar</label>
                  <select 
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as any})}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800 appearance-none"
                  >
                    <option value="Tunai">Tunai</option>
                    <option value="Transfer">Transfer Bank</option>
                    <option value="QRIS">QRIS / E-Wallet</option>
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Item Layanan & Obat</label>
                  <button type="button" onClick={addItem} className="text-xs font-bold text-blue-600 flex items-center hover:underline">
                    <PlusCircle size={14} className="mr-1" /> Tambah Item
                  </button>
                </div>
                <div className="space-y-3">
                  {(formData.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 animate-in slide-in-from-left-2">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="Nama Layanan/Obat" 
                          value={item.name}
                          onChange={(e) => updateItem(idx, 'name', e.target.value)}
                          className="w-full bg-transparent border-none outline-none font-bold text-gray-800 text-sm"
                        />
                      </div>
                      <div className="w-20">
                        <input 
                          type="number" 
                          placeholder="Qty" 
                          value={item.qty}
                          onChange={(e) => updateItem(idx, 'qty', parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent border-none outline-none font-bold text-gray-800 text-sm text-center"
                        />
                      </div>
                      <div className="w-32">
                        <input 
                          type="number" 
                          placeholder="Harga" 
                          value={item.price}
                          onChange={(e) => updateItem(idx, 'price', parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent border-none outline-none font-bold text-gray-800 text-sm text-right"
                        />
                      </div>
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1">
                        <MinusCircle size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-900 rounded-3xl p-8 text-white space-y-4">
                <div className="flex justify-between items-center text-sm font-medium opacity-60">
                  <span>Subtotal Tagihan</span>
                  <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between items-center">
                  <span className="font-black text-lg uppercase tracking-widest">Total Bayar</span>
                  <span className="font-black text-3xl">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-sm text-gray-400">Batal</button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center space-x-2 transition-all"
                >
                  <Check size={20} />
                  <span>{formData.id ? 'UPDATE INVOICE' : 'SIMPAN & SELESAIKAN'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cetak Nota */}
      {isPrintModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95">
            {/* Sidebar Opsi Cetak */}
            <div className="md:w-72 bg-gray-50 p-8 flex flex-col border-r border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Opsi Cetak</h3>
              <div className="space-y-3 flex-1">
                {[
                  { id: 'thermal', label: 'Printer Thermal', desc: 'Struk 80mm / 58mm', icon: Smartphone },
                  { id: 'standard', label: 'Printer Standard', desc: 'A4 / Letter Office', icon: Printer },
                  { id: 'pdf', label: 'Simpan PDF', desc: 'Kirim via WhatsApp/Email', icon: Download },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPrintType(opt.id as any)}
                    className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${
                      printType === opt.id ? 'bg-white border-blue-500 shadow-sm' : 'border-transparent hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-1">
                      <opt.icon size={18} className={printType === opt.id ? 'text-blue-600' : 'text-gray-400'} />
                      <span className={`font-black text-sm ${printType === opt.id ? 'text-blue-600' : 'text-gray-600'}`}>{opt.label}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">{opt.desc}</p>
                  </button>
                ))}
              </div>
              <div className="pt-8">
                <button 
                  onClick={executePrint}
                  className="w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center space-x-2"
                >
                  <Printer size={16} />
                  <span>Cetak Sekarang</span>
                </button>
                <button onClick={() => setIsPrintModalOpen(false)} className="w-full mt-3 text-xs font-bold text-gray-400 hover:text-gray-600">
                  Tutup Pratinjau
                </button>
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-gray-200/50 p-10 flex items-center justify-center overflow-y-auto max-h-[90vh]">
              <div id="print-area" className={`bg-white shadow-2xl transition-all duration-500 ${
                printType === 'thermal' ? 'w-[300px] p-8' : 'w-[595px] min-h-[842px] p-16'
              }`}>
                {/* Header Nota */}
                <div className={`text-center mb-8 ${printType === 'thermal' ? 'border-b border-dashed pb-6 border-gray-300' : 'mb-12'}`}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mr-3">
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Klinik Sehat</h4>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[.25em] mt-2">Jl. Raya Kemerdekaan No. 45, Jakarta</p>
                  <p className="text-[10px] text-gray-400 font-medium">Telepon: (021) 1234-5678 • WhatsApp: 0812-3456-7890</p>
                </div>

                <div className={`flex justify-between items-end mb-10 ${printType === 'thermal' ? 'text-xs flex-col items-start space-y-4' : ''}`}>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Diberikan Kepada</p>
                    <p className="text-lg font-black text-gray-900 uppercase tracking-tight leading-tight">{selectedInvoice.patientName}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Status: {selectedInvoice.status}</p>
                  </div>
                  <div className={printType === 'thermal' ? 'text-left w-full border-t border-dashed pt-4 border-gray-100' : 'text-right'}>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Invoice ID</p>
                    <p className="font-mono font-black text-gray-900 text-lg">#{selectedInvoice.id}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{selectedInvoice.date}</p>
                  </div>
                </div>

                {/* Table Items */}
                <div className={`border-y border-gray-100 py-8 mb-8 ${printType === 'thermal' ? 'text-xs border-dashed' : ''}`}>
                  <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-2">
                    <span>Layanan / Obat</span>
                    <div className="flex space-x-12">
                      <span className="w-8 text-center">Qty</span>
                      <span className="w-24 text-right">Subtotal</span>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {selectedInvoice.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-start font-bold text-gray-800 px-2">
                        <span className="flex-1 pr-6 leading-tight">{item.name}</span>
                        <div className="flex space-x-12">
                          <span className="w-8 text-center text-gray-400">{item.qty}</span>
                          <span className="w-24 text-right">Rp {item.price.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Nota - NO TAX */}
                <div className={`flex flex-col items-end pt-4 ${printType === 'thermal' ? 'text-xs' : ''}`}>
                  <div className="flex justify-between w-full max-w-[280px] font-black text-gray-900 py-4 px-2 bg-gray-50 rounded-2xl">
                    <span className="uppercase tracking-widest text-[10px]">Total Pembayaran</span>
                    <span className="text-xl">Rp {selectedInvoice.total.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="w-full max-w-[280px] mt-2 px-2">
                    <p className="text-[10px] text-gray-400 text-right font-bold uppercase">Dibayar via: {selectedInvoice.paymentMethod}</p>
                  </div>
                </div>

                {/* Footer Nota */}
                <div className={`mt-16 text-center ${printType === 'thermal' ? 'border-t border-dashed pt-8 border-gray-300' : 'pt-16 border-t border-gray-50'}`}>
                  <div className="w-24 h-24 bg-gray-50 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-gray-100 opacity-30">
                     <p className="text-[8px] font-black uppercase text-gray-400">QR Code</p>
                  </div>
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-[.3em] mb-2 italic">Lekas Sembuh</p>
                  <p className="text-[10px] text-gray-400 font-medium">Terima kasih telah mempercayai layanan kesehatan kami.</p>
                  <p className="text-[8px] text-gray-300 mt-10 font-mono">Invoice generated by Klinik Sehat EMR • System v2.5.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Transaksi */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-sm p-10 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertCircle size={40} /></div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Hapus Transaksi?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">Data ini akan dihapus permanen dari laporan keuangan klinik.</p>
            <div className="flex space-x-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Tutup</button>
              <button 
                onClick={() => { if(invToDelete) onDelete(invToDelete); setIsDeleteModalOpen(false); }}
                className="flex-[1.5] py-4 bg-red-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-red-100 uppercase tracking-widest"
              >
                Konfirmasi Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
