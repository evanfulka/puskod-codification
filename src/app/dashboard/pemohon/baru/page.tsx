import { cookies } from 'next/headers';
import Step1Form from './Step1Form';

export default async function EntryStep1() {
  const cookieStore = await cookies();
  const draftRaw = (await cookieStore).get('form_draft')?.value;
  
  let initialData = null;
  if (draftRaw) {
    try {
      initialData = JSON.parse(draftRaw);
    } catch (e) {
      initialData = null;
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8">
      {/* Kirim data draft ke form agar tidak kosong */}
      <Step1Form initialData={initialData} />
    </div>
  );
}