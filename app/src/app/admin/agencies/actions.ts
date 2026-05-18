'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { AppError } from '@/lib/errors';
import {
  createAgencyHandler,
  updateAgencyHandler,
  deleteAgencyHandler,
} from '@/lib/modules/agency/agency.container';
import { CreateAgencyCommand } from '@/lib/modules/agency/application/commands/create-agency/create-agency.command';
import { UpdateAgencyCommand } from '@/lib/modules/agency/application/commands/update-agency/update-agency.command';
import { DeleteAgencyCommand } from '@/lib/modules/agency/application/commands/delete-agency/delete-agency.command';
import { DataSource } from '@/lib/modules/agency/domain/agency.entity';

export interface ActionState {
  error?: string;
}

export async function createAgencyAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState | null> {
  const name = formData.get('name') as string;
  const websiteUrl = (formData.get('website_url') as string) || null;
  const dataSource = (formData.get('data_source') as DataSource) ?? 'scraper';

  let id: number;
  try {
    id = await createAgencyHandler.execute(
      new CreateAgencyCommand(name, websiteUrl, dataSource),
    );
  } catch (e) {
    if (e instanceof AppError) return { error: e.message };
    console.error('[createAgencyAction] unexpected error', e);
    return { error: 'Er is iets misgegaan. Probeer het opnieuw.' };
  }

  redirect(`/admin/agencies/${id}`);
}

export async function updateAgencyAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState | null> {
  const id = parseInt(formData.get('id') as string, 10);
  const name = formData.get('name') as string;
  const websiteUrl = (formData.get('website_url') as string) || null;
  const dataSource = (formData.get('data_source') as DataSource) ?? 'scraper';

  try {
    await updateAgencyHandler.execute(
      new UpdateAgencyCommand(id, name, websiteUrl, dataSource),
    );
  } catch (e) {
    if (e instanceof AppError) return { error: e.message };
    console.error('[updateAgencyAction] unexpected error', { id }, e);
    return { error: 'Er is iets misgegaan. Probeer het opnieuw.' };
  }

  revalidatePath('/admin/agencies');
  return null;
}

export async function deleteAgencyAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState | null> {
  const id = parseInt(formData.get('id') as string, 10);

  try {
    await deleteAgencyHandler.execute(new DeleteAgencyCommand(id));
  } catch (e) {
    if (e instanceof AppError) return { error: e.message };
    console.error('[deleteAgencyAction] unexpected error', { id }, e);
    return { error: 'Er is iets misgegaan. Probeer het opnieuw.' };
  }

  redirect('/admin/agencies');
}
