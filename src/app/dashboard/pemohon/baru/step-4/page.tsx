import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Step4Form from './Step4Form';

export default async function Step4Page() {
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
      <Step4Form initialData={initialData} />
    </div>
  );
}