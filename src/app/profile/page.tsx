import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import oracledb from 'oracledb';
import { getConnection } from '@/lib/db';
import ProfileForm from './ProfileForm';

const SECRET_KEY = new TextEncoder().encode('rahasia_puskod_kemhan_2026');

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  if (!sessionToken) redirect('/login');

  let userData;

  try {
    const { payload } = await jwtVerify(sessionToken, SECRET_KEY);
    const conn = await getConnection();
    
    // Gunakan outFormat: oracledb.OUT_FORMAT_OBJECT agar hasil query berupa objek
    const result = await conn.execute(
      `SELECT NAMA_LENGKAP_POC, EMAIL, NAMA_PERUSAHAAN, NO_TELP_WA, FOTO_PROFIL, ROLE 
       FROM USERS WHERE ID_USER = :1`,
      [payload.userId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    await conn.close();

    // Sekarang user didefinisikan sebagai 'any' atau tipe objek agar TS tidak protes
    const user = result.rows?.[0] as any; 

    if (!user) redirect('/login');

    // Karena menggunakan OUT_FORMAT_OBJECT, panggil nama kolomnya (case-sensitive)
    userData = {
      namaPoc: user.NAMA_LENGKAP_POC,
      email: user.EMAIL,
      perusahaan: user.NAMA_PERUSAHAAN,
      telp: user.NO_TELP_WA,
      foto: user.FOTO_PROFIL,
      role: user.ROLE
    };

  } catch (err) {
    console.error("Error Profile Page:", err);
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12">
      <ProfileForm user={userData} />
    </div>
  );
}