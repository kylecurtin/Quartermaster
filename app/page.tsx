import { AppShell } from '@/components/AppShell';
import { fetchConditions } from '@/lib/api';
import { LIDO_BEACH } from '@/lib/types';
import type { Conditions } from '@/lib/types';

export const revalidate = 600;

export default async function Page() {
  let initialData: Conditions | null = null;
  try {
    initialData = await fetchConditions(LIDO_BEACH.latitude, LIDO_BEACH.longitude);
  } catch {
    // SSR fetch failed — the client will retry on mount.
  }
  return <AppShell initialLocation={LIDO_BEACH} initialData={initialData} />;
}
