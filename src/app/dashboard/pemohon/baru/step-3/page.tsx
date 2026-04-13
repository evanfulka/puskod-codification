import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Step3Form from './Step3Form';

export default async function Step3Page() {
  const cookieStore = await cookies();
  const draftRaw = cookieStore.get('form_draft')?.value;

  if (!draftRaw) {
    redirect('/dashboard/pemohon/baru');
  }

  let initialData = null;
  try {
    initialData = JSON.parse(draftRaw);
  } catch (e) {
    redirect('/dashboard/pemohon/baru');
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8">
      {/* Mengirim data draft ke form */}
      <Step3Form initialData={initialData} />
    </div>
  );
}