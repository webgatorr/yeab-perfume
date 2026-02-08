import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import LandingPage from '@/components/LandingPage';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);
  const { view } = await searchParams;

  if (session && view !== 'public') {
    redirect('/dashboard');
  }

  return <LandingPage />;
}
