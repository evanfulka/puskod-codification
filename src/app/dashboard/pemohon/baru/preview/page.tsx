import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PreviewClient from './PreviewClient';

export default async function PreviewPage() {
  const cookieStore = await cookies();
  const draftRaw = cookieStore.get('form_draft')?.value;

  // Jika tidak ada draft, arahkan kembali ke Step 1
  if (!draftRaw) {
    redirect('/dashboard/pemohon/baru');
  }

  let draftData = null;
  try {
    draftData = JSON.parse(draftRaw);
  } catch (e) {
    redirect('/dashboard/pemohon/baru');
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8">
      <PreviewClient draft={draftData} />
    </div>
  );
}