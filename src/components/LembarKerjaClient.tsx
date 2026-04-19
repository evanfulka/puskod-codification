'use client';

import { useState, useTransition, useEffect } from 'react';
import { 
  Save, CheckCircle, ChevronLeft, Package, LayoutGrid, FileText, 
  Database, Settings, ShieldCheck, Loader2, ArrowRight, Info, Truck,
  XCircle, AlertTriangle // Tambahkan icon baru
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveMateriilAction, selesaikanKodifikasiAction } from '@/app/auth-actions';

export default function LembarKerjaClient({ header, materiil, team, currentUserId }: any) {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [activeFormTab, setActiveFormTab] = useState('admin'); 
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // State untuk Modals
  const [modalConfig, setModalConfig] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    action?: () => void;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  const isKetua = team.find((t: any) => t.ID_USER_PETUGAS === currentUserId && t.POSISI === 'KETUA');

  useEffect(() => {
    if (selectedItem) {
      const initialData = { ...selectedItem };
      
      const defaults: any = {
        NAMA_PERUSAHAAN: header.NAMA_PERUSAHAAN,
        NCAGE: header.NCAGE,
        NOMOR_KONTRAK: header.NO_KONTRAK,
        TANGGAL_KONTRAK: header.TGL_KONTRAK,
        PENGADAAN: header.PENGADAAN,
        TGL_SURAT_PENGAJUAN: header.NO_SURAT_PERMOHONAN,
        NAMA_LENGKAP: header.NAMA_LENGKAP,
        JABATAN: header.JABATAN,
        NOMOR_TELEPON: header.NOMOR_TELEPON,
        KETUA_TIM: team.find((t: any) => t.POSISI === 'KETUA')?.NAMA_LENGKAP || '',
        SEKRETARIS: team.find((t: any) => t.POSISI === 'SEKRETARIS')?.NAMA_LENGKAP || '',
        ANGGOTA_1: team.filter((t: any) => t.POSISI === 'ANGGOTA')[0]?.NAMA_LENGKAP || '',
        ANGGOTA_2: team.filter((t: any) => t.POSISI === 'ANGGOTA')[1]?.NAMA_LENGKAP || '',
        ANGGOTA_3: team.filter((t: any) => t.POSISI === 'ANGGOTA')[2]?.NAMA_LENGKAP || '',
        KATALOGER: team.find((t: any) => t.ID_USER_PETUGAS === currentUserId)?.NAMA_LENGKAP || '',
        JENIS_KEGIATAN: '',
        JUDUL_KEGIATAN: '',
        SUMBER_DATA: '',
        JENIS_PENGADAAN: '',
        KOMODITI: '',
        UO_PENGGUNA: '',
        SATUAN_AKHIR_PENGGUNA: '',
        NOMOR_SPRIN: '',
        TANGGAL_SPRIN: ''
      };

      Object.keys(defaults).forEach(key => {
        if (!initialData[key] || initialData[key] === '') {
          initialData[key] = defaults[key];
        }
      });

      setFormData(initialData);
    }
  }, [selectedItem, header, team, currentUserId]);

  const handleInputChange = (key: string, value: any) => {
    const newForm = { ...formData, [key]: value };
    
    if (key === 'NSC' || key === 'NIIN') {
        const nsc = key === 'NSC' ? value : (formData.NSC || '');
        const niin = key === 'NIIN' ? value : (formData.NIIN || '');
        if (nsc.length === 4 && niin.length === 9) {
            newForm.N_S_N = `${nsc}-${niin.substring(0,2)}-${niin.substring(2,5)}-${niin.substring(5)}`;
            newForm.NSN_FINAL = nsc + niin;
        }
    }
    setFormData(newForm);
  };

  const handleSave = () => {
    if (!selectedItem) return;

    startTransition(async () => {
        const { ID_MATERIIL, ID_PERMOHONAN, ...cleanData } = formData;
        const res = await saveMateriilAction(ID_MATERIIL, cleanData);
        
        if (res.success) {
          setModalConfig({
            show: true,
            type: 'success',
            title: 'Berhasil Disimpan',
            message: 'Data progres pengerjaan materiil telah diperbarui di database.',
          });
          router.refresh();
        } else {
          setModalConfig({
            show: true,
            type: 'error',
            title: 'Gagal Menyimpan',
            message: res.message,
          });
        }
    });
  };

  const handleFinishAll = () => {
    setModalConfig({
      show: true,
      type: 'confirm',
      title: 'Finalisasi Proyek',
      message: 'Apakah Anda yakin seluruh proses kodifikasi untuk proyek ini sudah selesai? Data akan dikirim ke tahap berikutnya.',
      action: executeFinalize
    });
  };

  const executeFinalize = () => {
    startTransition(async () => {
      const res = await selesaikanKodifikasiAction(header.ID_PERMOHONAN);
      if (res.success) {
        setModalConfig({
          show: true,
          type: 'success',
          title: 'Proyek Selesai',
          message: 'Status permohonan telah diperbarui. Mengalihkan ke halaman daftar tugas...',
        });
        setTimeout(() => {
          router.push('/admin/pengerjaan');
        }, 2000);
      } else {
        setModalConfig({
          show: true,
          type: 'error',
          title: 'Gagal Finalisasi',
          message: res.message,
        });
      }
    });
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/pengerjaan" className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronLeft /></Link>
          <div>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">{header.NAMA_PERUSAHAAN}</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{header.PENGADAAN}</p>
          </div>
        </div>
        {isKetua && (
          <button onClick={handleFinishAll} className="bg-[#800000] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-red-900 transition">
            <ShieldCheck size={20} /> Finalisasi Proyek (Ketua)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LIST MATERIIL (LEFT) */}
        <div className="lg:col-span-1 space-y-3 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">Daftar Item</div>
          {materiil.map((item: any) => (
            <div key={item.ID_MATERIIL} onClick={() => setSelectedItem(item)} className={`p-4 rounded-2xl border cursor-pointer transition-all active:scale-95 ${selectedItem?.ID_MATERIIL === item.ID_MATERIIL ? 'bg-[#1A1A1A] text-white border-black shadow-xl' : 'bg-white hover:border-gray-300 shadow-sm'}`}>
              <p className="text-[9px] font-bold opacity-50 uppercase mb-1">P/N: {item.PART_NUMBER || 'N/A'}</p>
              <p className="text-sm font-black truncate">{item.NAMA_MATERIIL}</p>
            </div>
          ))}
        </div>

        {/* WORK AREA (RIGHT) */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {selectedItem ? (
            <>
              {/* TABS NAVIGATION */}
              <div className="flex bg-gray-50 border-b overflow-x-auto scrollbar-hide">
                <TabBtn id="admin" label="Adm & Tim" active={activeFormTab} onClick={setActiveFormTab} icon={<LayoutGrid size={14}/>} />
                <TabBtn id="identitas" label="Referensi" active={activeFormTab} onClick={setActiveFormTab} icon={<Truck size={14}/>} />
                <TabBtn id="nsn" label="NSN Details" active={activeFormTab} onClick={setActiveFormTab} icon={<Database size={14}/>} />
                <TabBtn id="suplai" label="Management" active={activeFormTab} onClick={setActiveFormTab} icon={<Settings size={14}/>} />
                <TabBtn id="mrc" label="Technical" active={activeFormTab} onClick={setActiveFormTab} icon={<FileText size={14}/>} />
              </div>

              {/* FORM FIELDS AREA (Content remains same as your previous code) */}
              <div className="p-8 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {activeFormTab === 'admin' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SectionTitle title="Informasi Proyek & Kontrak" />
                    <InputField label="Kode Projek" value={formData.KODE_PROJEK} onChange={(v: string) => handleInputChange('KODE_PROJEK', v)} />
                    <InputField label="Pengadaan" value={formData.PENGADAAN} onChange={(v: string) => handleInputChange('PENGADAAN', v)} />
                    <InputField label="Jenis Pengadaan" value={formData.JENIS_PENGADAAN} onChange={(v: string) => handleInputChange('JENIS_PENGADAAN', v)} />
                    <InputField label="Komoditi" value={formData.KOMODITI} onChange={(v: string) => handleInputChange('KOMODITI', v)} />
                    <InputField label="Nama Perusahaan" value={formData.NAMA_PERUSAHAAN} onChange={(v: string) => handleInputChange('NAMA_PERUSAHAAN', v)} />
                    <InputField label="NCAGE" value={formData.NCAGE} onChange={(v: string) => handleInputChange('NCAGE', v)} />
                    <InputField label="Nomor Kontrak" value={formData.NOMOR_KONTRAK} onChange={(v: string) => handleInputChange('NOMOR_KONTRAK', v)} />
                    <InputField label="Tanggal Kontrak" value={formData.TANGGAL_KONTRAK} onChange={(v: string) => handleInputChange('TANGGAL_KONTRAK', v)} />
                    <InputField label="Efektif Kontrak" value={formData.EFEKTIF_KONTRAK} onChange={(v: string) => handleInputChange('EFEKTIF_KONTRAK', v)} />
                    <InputField label="Tgl Berakhir Kontrak" value={formData.TGL_BERAKHIR_KONTRAK} onChange={(v: string) => handleInputChange('TGL_BERAKHIR_KONTRAK', v)} />
                    <InputField label="Tgl Surat Pengajuan" value={formData.TGL_SURAT_PENGAJUAN} onChange={(v: string) => handleInputChange('TGL_SURAT_PENGAJUAN', v)} />

                    <SectionTitle title="Kegiatan & Sumber Data" />
                    <InputField label="Jenis Kegiatan" value={formData.JENIS_KEGIATAN} onChange={(v: string) => handleInputChange('JENIS_KEGIATAN', v)} />
                    <InputField label="Judul Kegiatan" value={formData.JUDUL_KEGIATAN} onChange={(v: string) => handleInputChange('JUDUL_KEGIATAN', v)} />
                    <InputField label="Sumber Data" value={formData.SUMBER_DATA} onChange={(v: string) => handleInputChange('SUMBER_DATA', v)} />

                    <SectionTitle title="Unit Kerja & Satuan Pengguna" />
                    <InputField label="Satker" value={formData.SATKER} onChange={(v: string) => handleInputChange('SATKER', v)} />
                    <InputField label="Subsatker" value={formData.SUBSATKER} onChange={(v: string) => handleInputChange('SUBSATKER', v)} />
                    <InputField label="UO Pengguna" value={formData.UO_PENGGUNA} onChange={(v: string) => handleInputChange('UO_PENGGUNA', v)} />
                    <InputField label="Satuan Akhir Pengguna" value={formData.SATUAN_AKHIR_PENGGUNA} onChange={(v: string) => handleInputChange('SATUAN_AKHIR_PENGGUNA', v)} />

                    <SectionTitle title="Personel & Tim SPRIN" />
                    <InputField label="Nama Lengkap (Mitra)" value={formData.NAMA_LENGKAP} onChange={(v: string) => handleInputChange('NAMA_LENGKAP', v)} />
                    <InputField label="Jabatan" value={formData.JABATAN} onChange={(v: string) => handleInputChange('JABATAN', v)} />
                    <InputField label="Nomor Telepon" value={formData.NOMOR_TELEPON} onChange={(v: string) => handleInputChange('NOMOR_TELEPON', v)} />
                    <InputField label="Nomor Sprin" value={formData.NOMOR_SPRIN} onChange={(v: string) => handleInputChange('NOMOR_SPRIN', v)} />
                    <InputField label="Tanggal Sprin" value={formData.TANGGAL_SPRIN} onChange={(v: string) => handleInputChange('TANGGAL_SPRIN', v)} />
                    <InputField label="Ketua Tim" value={formData.KETUA_TIM} onChange={(v: string) => handleInputChange('KETUA_TIM', v)} />
                    <InputField label="Sekretaris" value={formData.SEKRETARIS} onChange={(v: string) => handleInputChange('SEKRETARIS', v)} />
                    <InputField label="Anggota 1" value={formData.ANGGOTA_1} onChange={(v: string) => handleInputChange('ANGGOTA_1', v)} />
                    <InputField label="Anggota 2" value={formData.ANGGOTA_2} onChange={(v: string) => handleInputChange('ANGGOTA_2', v)} />
                    <InputField label="Anggota 3" value={formData.ANGGOTA_3} onChange={(v: string) => handleInputChange('ANGGOTA_3', v)} />
                    <InputField label="Kataloger" value={formData.KATALOGER} onChange={(v: string) => handleInputChange('KATALOGER', v)} />
                  </div>
                )}

                {/* (Keep all other tabs as they are) */}
                {activeFormTab === 'identitas' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SectionTitle title="Identifikasi Materiil" />
                    <InputField label="Nama Materiil" value={formData.NAMA_MATERIIL} onChange={(v: string) => handleInputChange('NAMA_MATERIIL', v)} />
                    <InputField label="Part Number Final" value={formData.PART_NUMBER_FINAL} onChange={(v: string) => handleInputChange('PART_NUMBER_FINAL', v)} />
                    <InputField label="Nama Produsen" value={formData.NAMA_PRODUSEN} onChange={(v: string) => handleInputChange('NAMA_PRODUSEN', v)} />
                    <InputField label="NCAGE Produsen" value={formData.NCAGE_PRODUSEN} onChange={(v: string) => handleInputChange('NCAGE_PRODUSEN', v)} />
                    <InputField label="Negara Produsen" value={formData.NEGARA_PRODUSEN} onChange={(v: string) => handleInputChange('NEGARA_PRODUSEN', v)} />
                    <InputField label="NCAGE Final" value={formData.NCAGE_FINAL} onChange={(v: string) => handleInputChange('NCAGE_FINAL', v)} />
                    <InputField label="Penyedia Final" value={formData.PENYEDIA_FINAL} onChange={(v: string) => handleInputChange('PENYEDIA_FINAL', v)} />
                    <InputField label="Negara" value={formData.NEGARA} onChange={(v: string) => handleInputChange('NEGARA', v)} />
                    <InputField label="IPC/IPB" value={formData.IPCIPB} onChange={(v: string) => handleInputChange('IPCIPB', v)} />
                    <InputField label="Gambar Materiil (Path)" value={formData.GAMBAR_MATERIIL} onChange={(v: string) => handleInputChange('GAMBAR_MATERIIL', v)} />
                    <SectionTitle title="Rujukan Tambahan" />
                    <InputField label="RP NCAGE 1" value={formData.RP_NCAGE_1} onChange={(v: string) => handleInputChange('RP_NCAGE_1', v)} />
                    <InputField label="RP NCAGE 2" value={formData.RP_NCAGE_2} onChange={(v: string) => handleInputChange('RP_NCAGE_2', v)} />
                    <InputField label="RP NCAGE 3" value={formData.RP_NCAGE_3} onChange={(v: string) => handleInputChange('RP_NCAGE_3', v)} />
                  </div>
                )}
                {activeFormTab === 'nsn' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SectionTitle title="Kode Klasifikasi" />
                    <InputField label="NSC (4 Digit)" value={formData.NSC} onChange={(v: string) => handleInputChange('NSC', v)} />
                    <InputField label="NIIN (9 Digit)" value={formData.NIIN} onChange={(v: string) => handleInputChange('NIIN', v)} />
                    <InputField label="N-S-N (Format)" value={formData.N_S_N} onChange={(v: string) => handleInputChange('N_S_N', v)} />
                    <InputField label="NSN Final" value={formData.NSN_FINAL} onChange={(v: string) => handleInputChange('NSN_FINAL', v)} />
                    <InputField label="INC" value={formData.INC} onChange={(v: string) => handleInputChange('INC', v)} />
                    <InputField label="AIN" value={formData.AIN} onChange={(v: string) => handleInputChange('AIN', v)} />
                    <InputField label="FIIG" value={formData.FIIG} onChange={(v: string) => handleInputChange('FIIG', v)} />
                    <InputField label="TIIC" value={formData.TIIC} onChange={(v: string) => handleInputChange('TIIC', v)} />
                    <InputField label="FMSN" value={formData.FMSN} onChange={(v: string) => handleInputChange('FMSN', v)} />
                    <InputField label="NIIN Type" value={formData.NIIN_TYPE} onChange={(v: string) => handleInputChange('NIIN_TYPE', v)} />
                    <InputField label="NIIN SC" value={formData.NIIN_SC} onChange={(v: string) => handleInputChange('NIIN_SC', v)} />
                    <SectionTitle title="Status & Tanggal" />
                    <InputField label="Assignment Date" value={formData.ASSIGNMENT_DATE} onChange={(v: string) => handleInputChange('ASSIGNMENT_DATE', v)} />
                    <InputField label="Last Update Date" value={formData.LAST_UPDATE_DATE} onChange={(v: string) => handleInputChange('LAST_UPDATE_DATE', v)} />
                    <InputField label="No. Rekam Adm" value={formData.NO_REKAM_ADM} onChange={(v: string) => handleInputChange('NO_REKAM_ADM', v)} />
                    <InputField label="Tgl Rekam Data" value={formData.TGL_REKAM_DATA} onChange={(v: string) => handleInputChange('TGL_REKAM_DATA', v)} />
                  </div>
                )}
                {activeFormTab === 'suplai' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SectionTitle title="Supply & Stock Codes" />
                    <InputField label="Unit of Issue" value={formData.UNIT_OF_ISSUE} onChange={(v: string) => handleInputChange('UNIT_OF_ISSUE', v)} />
                    <InputField label="UP Price" value={formData.UP_PRICE} onChange={(v: string) => handleInputChange('UP_PRICE', v)} type="number" />
                    <InputField label="SLC" value={formData.SLC} onChange={(v: string) => handleInputChange('SLC', v)} />
                    <InputField label="HMIC" value={formData.HMIC} onChange={(v: string) => handleInputChange('HMIC', v)} />
                    <InputField label="CIIC" value={formData.CIIC} onChange={(v: string) => handleInputChange('CIIC', v)} />
                    <InputField label="PMI" value={formData.PMI} onChange={(v: string) => handleInputChange('PMI', v)} />
                    <InputField label="QUP" value={formData.QUP} onChange={(v: string) => handleInputChange('QUP', v)} />
                    <InputField label="RC" value={formData.RC} onChange={(v: string) => handleInputChange('RC', v)} />
                    <SectionTitle title="Reference Codes (RN)" />
                    <InputField label="RNFC" value={formData.RNFC} onChange={(v: string) => handleInputChange('RNFC', v)} />
                    <InputField label="RNCC" value={formData.RNCC} onChange={(v: string) => handleInputChange('RNCC', v)} />
                    <InputField label="RNVC" value={formData.RNVC} onChange={(v: string) => handleInputChange('RNVC', v)} />
                    <InputField label="DAC" value={formData.DAC} onChange={(v: string) => handleInputChange('DAC', v)} />
                    <InputField label="RNAAC" value={formData.RNAAC} onChange={(v: string) => handleInputChange('RNAAC', v)} />
                    <InputField label="RNSC" value={formData.RNSC} onChange={(v: string) => handleInputChange('RNSC', v)} />
                    <InputField label="RNJC" value={formData.RNJC} onChange={(v: string) => handleInputChange('RNJC', v)} />
                    <SectionTitle title="Pendaftaran Register" />
                    <InputField label="HasDoc" value={formData.HASDOC} onChange={(v: string) => handleInputChange('HASDOC', v)} />
                    <InputField label="International Reg User" value={formData.INTL_REGISTER_USER} onChange={(v: string) => handleInputChange('INTL_REGISTER_USER', v)} />
                    <InputField label="National Reg User" value={formData.NATL_REGISTER_USER} onChange={(v: string) => handleInputChange('NATL_REGISTER_USER', v)} />
                    <InputField label="Repl NIIN 1" value={formData.REPL_NIIN_1} onChange={(v: string) => handleInputChange('REPL_NIIN_1', v)} />
                    <InputField label="Repl NIIN 2" value={formData.REPL_NIIN_2} onChange={(v: string) => handleInputChange('REPL_NIIN_2', v)} />
                  </div>
                )}
                {activeFormTab === 'mrc' && (
                  <div className="space-y-8">
                    <SectionTitle title="Data Karakteristik Teknis" />
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">MRC Data Karakteristik (CLOB)</label>
                        <textarea className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-mono leading-relaxed focus:ring-2 focus:ring-[#800000]/10 outline-none" rows={15} value={formData.MRC_DATA_KARAKTERISTIK} onChange={(e) => handleInputChange('MRC_DATA_KARAKTERISTIK', e.target.value)} placeholder="Input Master Requirements Directory data here..." />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Spesifikasi Teknis (Spektek)</label>
                        <textarea className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl text-sm leading-relaxed focus:ring-2 focus:ring-[#800000]/10 outline-none" rows={8} value={formData.SPEKTEK} onChange={(e) => handleInputChange('SPEKTEK', e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              {/* SAVE FOOTER */}
              <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-400">
                    <Info size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-tight">Perubahan akan disimpan sebagai draft pengerjaan.</p>
                </div>
                <button onClick={handleSave} disabled={isPending} className="bg-[#1A1A1A] text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#800000] transition shadow-xl disabled:opacity-50">
                  {isPending ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />} Simpan Progres Item
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-20 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Package size={48} className="opacity-10" />
                </div>
                <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest">Pilih Materiil</h3>
                <p className="text-sm font-medium text-gray-400 max-w-xs">Silakan pilih salah satu item di sebelah kiri untuk mulai mengisi data kodifikasi.</p>
            </div>
          )}
        </div>
      </div>

      {/* POPUP MODAL COMPONENT */}
      {modalConfig.show && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-300">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              modalConfig.type === 'success' ? 'bg-green-50 text-green-600' : 
              modalConfig.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
            }`}>
              {modalConfig.type === 'success' && <CheckCircle size={48} />}
              {modalConfig.type === 'error' && <XCircle size={48} />}
              {modalConfig.type === 'confirm' && <AlertTriangle size={48} />}
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{modalConfig.title}</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">{modalConfig.message}</p>
            
            <div className="flex gap-3">
              {modalConfig.type === 'confirm' ? (
                <>
                  <button 
                    onClick={() => setModalConfig({ ...modalConfig, show: false })}
                    className="flex-1 py-4 px-6 rounded-2xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => {
                      setModalConfig({ ...modalConfig, show: false });
                      if (modalConfig.action) modalConfig.action();
                    }}
                    className="flex-1 py-4 px-6 rounded-2xl text-sm font-bold bg-[#800000] text-white hover:bg-red-900 shadow-lg transition"
                  >
                    Ya, Selesaikan
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setModalConfig({ ...modalConfig, show: false })}
                  className={`w-full py-4 px-6 rounded-2xl text-sm font-bold text-white transition shadow-lg ${
                    modalConfig.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Dimengerti
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// HELPER COMPONENTS (Unchanged)
function TabBtn({ id, label, active, onClick, icon }: any) {
  return (
    <button onClick={() => onClick(id)} className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border-b-2 transition-all whitespace-nowrap ${active === id ? 'border-[#800000] text-[#800000] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
      {icon} {label}
    </button>
  );
}

function InputField({ label, value, onChange, type = "text" }: { label: string, value: any, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="group">
      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block group-focus-within:text-[#800000] transition-colors">{label}</label>
      <input type={type} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 outline-none focus:bg-white focus:border-[#800000] focus:ring-4 focus:ring-[#800000]/5 transition-all" value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
    return (
        <div className="col-span-full mt-4 mb-2 flex items-center gap-4">
            <span className="text-[10px] font-black text-[#800000] uppercase tracking-[0.3em] whitespace-nowrap">{title}</span>
            <div className="h-[1px] w-full bg-gray-100"></div>
        </div>
    );
}