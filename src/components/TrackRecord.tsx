'use client';

import { CheckCircle2, Clock, AlertCircle, User, Calendar, Flag } from 'lucide-react';

const WORKFLOW_STEPS = [
  "Permohonan Baru",
  "Verifikasi Berkas",
  "Terbitkan SPRIN",
  "Proses Pengerjaan Kodifikasi",
  "Berita Acara dan Hasil Kodifikasi",
  "Verifikasi Data Materiil dengan Mitra",
  "Validasi Data Kodifikasi",
  "Sertifikat Kodifikasi",
  "Selesai"
];

export default function TrackRecord({ logs, currentStatus }: { logs: any[], currentStatus: string }) {
  
  const normalizedStatus = currentStatus === 'Perbaikan Berkas' ? 'Verifikasi Berkas' : currentStatus;
  const currentIndex = WORKFLOW_STEPS.indexOf(normalizedStatus);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 bg-[#800000] text-white rounded-lg">
            <Clock size={20} />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tighter italic">Track Record Proses Kodifikasi</h2>
      </div>

      <div className="relative space-y-2">
        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-100"></div>

        {WORKFLOW_STEPS.map((step, index) => {
          // Log untuk deskripsi tahap ini
          const currentLog = logs.find(l => l.STATUS === step);
          
          // Petugas yang menyelesaikan tahap INI ada di log tahap BERIKUTNYA
          const completionLog = logs.find(l => l.STATUS === WORKFLOW_STEPS[index + 1]);

          const stepIndex = index;
          const isRevisi = currentStatus === 'Perbaikan Berkas' && step === 'Verifikasi Berkas';
          const isCurrent = currentStatus === step || (currentStatus === 'Perbaikan Berkas' && step === 'Verifikasi Berkas');
          const isDone = !!currentLog || (stepIndex < currentIndex && currentIndex !== -1);

          // Warna & Icon
          let colorClass = "bg-gray-100 text-gray-400 border-gray-200"; 
          let icon = <div className="w-3 h-3 bg-gray-300 rounded-full" />;

          if (isRevisi) {
            colorClass = "bg-red-600 text-white border-red-200 shadow-lg shadow-red-100";
            icon = <AlertCircle size={18} />;
          } else if (isCurrent) {
            colorClass = "bg-orange-500 text-white border-orange-200 animate-pulse shadow-lg shadow-orange-100";
            icon = <Clock size={18} />;
          } else if (isDone) {
            colorClass = "bg-green-600 text-white border-green-200 shadow-lg shadow-green-100";
            icon = <CheckCircle2 size={18} />;
          }

          return (
            <div key={index} className="relative flex gap-8 pb-10 group">
              <div className={`relative z-10 w-14 h-14 rounded-2xl border-4 flex items-center justify-center transition-all duration-500 ${colorClass}`}>
                {step === 'Selesai' && !isDone ? <Flag size={18} /> : icon}
              </div>

              <div className={`flex-1 p-6 rounded-3xl border transition-all duration-300 ${
                isDone && !isCurrent ? 'bg-green-50/30 border-green-100' : 
                isCurrent ? 'bg-orange-50/30 border-orange-100 border-l-4 border-l-orange-500' : 
                isRevisi ? 'bg-red-50/30 border-red-100 border-l-4 border-l-red-500' : 'bg-gray-50/30 border-gray-100 opacity-60'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-black uppercase tracking-tight ${isDone && !isCurrent ? 'text-green-900' : isCurrent ? 'text-orange-900' : 'text-gray-500'}`}>
                    {step}
                  </h4>
                  
                  {/* Tanggal ditampilkan jika tahap ini SUDAH selesai (diambil dari log penyelesaian/tahap berikutnya) */}
                  {completionLog && (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-gray-400 bg-white px-2 py-1 rounded-md border">
                       <Calendar size={10} /> {new Date(completionLog.TANGGAL_LOG).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {isRevisi ? "Dokumen memerlukan perbaikan dari mitra." : 
                     currentLog ? currentLog.KETERANGAN : 
                     isCurrent ? "Sedang dalam proses pengerjaan..." : "Menunggu tahapan sebelumnya selesai."}
                </p>

                {/* INFO PETUGAS: Hanya tampil jika tahap ini sudah SELESAI (diambil dari completionLog) */}
                {completionLog && completionLog.NAMA_LENGKAP && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-500">
                        <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-gray-400 shadow-sm">
                            <User size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-700 leading-none mb-1">
                                {completionLog.NAMA_LENGKAP}
                            </p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                {completionLog.JABATAN || 'Petugas'} {completionLog.NOMOR_IDENTITAS ? ` - ${completionLog.NOMOR_IDENTITAS}` : ''}
                            </p>
                        </div>
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}