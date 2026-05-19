'use server';

import { redirect } from 'next/navigation';
import { scraperContainer } from '@/lib/modules/scraper/scraper.container';

export async function deleteScraperRun(runId: number): Promise<void> {
  const deleted = await scraperContainer.scraperRunWriteRepository.deleteIfPending(runId);
  if (!deleted) {
    // Run was no longer pending — just redirect without error
  }
  redirect('/admin/scrapers');
}
