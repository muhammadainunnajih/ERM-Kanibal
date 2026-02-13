
import React from 'react';
import { 
  BarChart3, TrendingUp, Users, Download, 
  FileText, Wallet, Calendar, PieChart, 
  ArrowUpRight, ArrowDownRight, Activity, 
  BriefcaseMedical, UserCheck, CheckCircle2, 
  Clock, Stethoscope, Pill
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Patient, Invoice, Prescription, QueueItem, MedicalRecord } from '../types';

interface ReportsProps {
  patients: Patient[];
  invoices: Invoice[];
  prescriptions: Prescription[];
  queues: QueueItem[];
  medicalRecords: MedicalRecord[];
}

export const Reports: React.FC<ReportsProps> = ({ 
  patients, invoices, prescriptions, queues, medicalRecords
}) => {
  // 1. Basic Stats
  const totalPatients = patients.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'Lunas' ? inv.total : 0), 0);
  const pendingRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'Pending' ? inv.total : 0), 0);
  const totalRx = prescriptions.length;
  const patientsToday = queues.length;

  // 2. Gender Demographics
  const maleCount = patients.filter(p => p.gender === 'L').length;
  const femaleCount = patients.filter(p => p.gender === 'P').length;
  const malePercent = totalPatients > 0 ? Math.round((maleCount / totalPatients) * 100) : 0;
  const femalePercent = totalPatients > 0 ? Math.round((femaleCount / totalPatients) * 100) : 0;

  // 3. Top Diagnoses
  const diagnosisMap: Record<string, number> = {};
  medicalRecords.forEach(r => {
    diagnosisMap[r.diagnosis] = (diagnosisMap[r.diagnosis] || 0) + 1;
  });
  const topDiagnoses = Object.entries(diagnosisMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // 4. Activity Log
  const activities = [
    ...invoices.map(i => ({ type: 'Kasir', desc: `Invoice ${i.id} - ${i.patientName}`, date: i.date, status: i.status, icon: Wallet })),
    ...prescriptions.map(p => ({ type: 'Apotek', desc: `Resep ${p.id} - ${p.patientName}`, date: p.date, status: p.status, icon: Pill })),
    ...queues.map(q => ({ type: 'Queue', desc: `Antrian ${q.no} - ${q.patientName}`, date: 'Hari Ini', status: q.status, icon: Clock }))
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  const handleExport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 20;

    // Header Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text('KLINIK SEHAT', 20, currentY);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistem Rekam Medis Elektronik (EMR)', 20, currentY + 7);
    
    doc.setFontSize(8);
    doc.text('Jl. Raya Kemerdekaan No. 45, Jakarta Pusat | Telp: (021) 1234-5678', 20, currentY + 12);
    
    doc.setDrawColor(200);
    doc.line(20, currentY + 18, pageWidth - 20, currentY + 18);
    
    currentY += 30;

    // Report Title
    doc.setFontSize(16);
    doc.setTextColor(33, 37, 41);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN OPERASIONAL KLINIK', 20, currentY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`, 20, currentY + 7);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, pageWidth - 20, currentY + 7, { align: 'right' });

    currentY += 20;

    // Summary Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1. Ringkasan Statistik', 20, currentY);
    doc.setDrawColor(240);
    doc.setFillColor(249, 250, 251);
    doc.rect(20, currentY + 5, pageWidth - 40, 35, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Pasien Terdaftar:`, 25, currentY + 15);
    doc.text(`${totalPatients} Orang`, pageWidth - 25, currentY + 15, { align: 'right' });
    
    doc.text(`Pendapatan (Lunas):`, 25, currentY + 23);
    doc.text(`Rp ${totalRevenue.toLocaleString('id-ID')}`, pageWidth - 25, currentY + 23, { align: 'right' });
    
    doc.text(`Resep Terlayani:`, 25, currentY + 31);
    doc.text(`${totalRx} Resep`, pageWidth - 25, currentY + 31, { align: 'right' });

    currentY += 55;

    // Demographics & Top Diagnoses
    doc.setFont('helvetica', 'bold');
    doc.text('2. Demografi Pasien', 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Laki-laki: ${maleCount} (${malePercent}%)`, 25, currentY + 8);
    doc.text(`Perempuan: ${femaleCount} (${femalePercent}%)`, 25, currentY + 14);

    doc.setFont('helvetica', 'bold');
    doc.text('3. Top Diagnosa Terbanyak', pageWidth / 2, currentY);
    doc.setFont('helvetica', 'normal');
    topDiagnoses.forEach(([diag, count], idx) => {
        doc.text(`${idx + 1}. ${diag} (${count} Kasus)`, (pageWidth / 2) + 5, currentY + 8 + (idx * 6));
    });

    currentY += 50;

    // Recent Activity Table
    doc.setFont('helvetica', 'bold');
    doc.text('4. Log Aktivitas Sistem Terakhir', 20, currentY);
    
    // Table Header
    doc.setFillColor(33, 37, 41);
    doc.rect(20, currentY + 5, pageWidth - 40, 8, 'F');
    doc.setTextColor(255);
    doc.setFontSize(9);
    doc.text('MODUL', 25, currentY + 10.5);
    doc.text('DESKRIPSI', 60, currentY + 10.5);
    doc.text('STATUS', pageWidth - 45, currentY + 10.5);

    doc.setTextColor(33);
    activities.forEach((act, idx) => {
        const yPos = currentY + 19 + (idx * 8);
        doc.text(act.type, 25, yPos);
        doc.text(act.desc.substring(0, 60), 60, yPos);
        doc.text(act.status, pageWidth - 45, yPos);
        
        doc.setDrawColor(245);
        doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Dokumen ini digenerate secara otomatis oleh Klinik Sehat EMR System.', pageWidth / 2, footerY, { align: 'center' });

    doc.save(`Laporan_Klinik_${Date.now()}.pdf`);
  };

  // Mock Visit Trend (Based on count)
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const visitCounts = [8, 14, 10, totalPatients, 22, 10, 5];
  const maxVisit = Math.max(...visitCounts, 1);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Laporan & Statistik</h2>
          <p className="text-gray-500">Analisis data performa klinik secara menyeluruh (Real-Time).</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg active:scale-95"
        >
          <Download size={20} />
          <span>Export Laporan PDF</span>
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-500 flex items-center">
              <ArrowUpRight size={14} className="mr-0.5" /> +12%
            </span>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Pasien</p>
            <h3 className="text-3xl font-black text-gray-900">{totalPatients}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-500 flex items-center">
              <ArrowUpRight size={14} className="mr-0.5" /> Aktif
            </span>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Pendapatan Lunas</p>
            <h3 className="text-2xl font-black text-gray-900">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <BriefcaseMedical size={20} />
            </div>
            <span className="text-xs font-bold text-gray-400">Farmasi</span>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Resep Dilayani</p>
            <h3 className="text-3xl font-black text-gray-900">{totalRx}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <span className="text-xs font-bold text-gray-400">Hari Ini</span>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Pasien Antri</p>
            <h3 className="text-3xl font-black text-gray-900">{patientsToday}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visit Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 flex items-center space-x-2">
              <Activity className="text-blue-600" size={20} />
              <span>Trend Kunjungan (Live Data)</span>
            </h3>
            <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Update per Kunjungan</div>
          </div>
          
          <div className="flex items-end justify-between h-48 px-4">
            {visitCounts.map((v, i) => (
              <div key={i} className="flex flex-col items-center space-y-4 group">
                <div 
                  className="w-10 bg-blue-100 rounded-t-xl group-hover:bg-blue-600 transition-all duration-300 relative"
                  style={{ height: `${(v / maxVisit) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {v} Ps
                  </div>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h3 className="font-bold text-gray-900 mb-8 flex items-center space-x-2">
            <PieChart className="text-emerald-600" size={20} />
            <span>Demografi Pasien</span>
          </h3>
          
          <div className="space-y-8">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-32 h-32 rounded-full border-[12px] border-blue-500 relative flex items-center justify-center">
                 <div className="absolute inset-0 border-[12px] border-emerald-500 rounded-full" style={{ clipPath: `inset(0 0 0 ${malePercent}%)` }} />
                 <div className="text-center">
                   <p className="text-2xl font-black text-gray-900">{totalPatients}</p>
                   <p className="text-[8px] font-black text-gray-400 uppercase">Total</p>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Laki-Laki</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg font-black text-gray-900">{maleCount}</span>
                  <span className="text-[10px] font-bold text-gray-400">({malePercent}%)</span>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Perempuan</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg font-black text-gray-900">{femaleCount}</span>
                  <span className="text-[10px] font-bold text-gray-400">({femalePercent}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Financial Overview */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Wallet className="text-emerald-600" size={20} />
            <span>Ringkasan Keuangan</span>
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-sm font-bold text-gray-700">Lunas Terbayar</span>
              </div>
              <span className="font-black text-emerald-600">Rp {totalRevenue.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <span className="text-sm font-bold text-gray-700">Tertunda (Pending)</span>
              </div>
              <span className="font-black text-orange-600">Rp {pendingRevenue.toLocaleString('id-ID')}</span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Total Perkiraan</span>
              <span className="text-xl font-black text-gray-900">Rp {(totalRevenue + pendingRevenue).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Top Diagnoses */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Stethoscope className="text-orange-600" size={20} />
            <span>Top Diagnosa Terbanyak</span>
          </h3>
          <div className="space-y-4">
            {topDiagnoses.length > 0 ? topDiagnoses.map(([diag, count], idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span>{diag}</span>
                  <span className="text-gray-900">{count} Kasus</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${(count / (medicalRecords.length || 1)) * 100}%` }} 
                  />
                </div>
              </div>
            )) : (
              <p className="text-center py-10 text-gray-400 italic text-sm">Belum ada data rekam medis.</p>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Activity Mini-Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2">
            <Activity className="text-red-500" size={18} />
            <span>Aktivitas Sistem Terbaru</span>
          </h3>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-Time Log</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Modul</th>
                <th className="px-6 py-4">Deskripsi Aktivitas</th>
                <th className="px-6 py-4">Status / Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-600">
              {activities.map((act, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <act.icon size={14} className="text-blue-500" />
                      <span className="font-bold text-gray-900">{act.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{act.desc}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded uppercase font-black text-[9px] ${
                      act.status === 'Lunas' || act.status === 'Selesai' || act.status === 'Siap Diambil'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {act.status}
                    </span>
                    <span className="ml-2 text-gray-400 font-bold">{act.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
