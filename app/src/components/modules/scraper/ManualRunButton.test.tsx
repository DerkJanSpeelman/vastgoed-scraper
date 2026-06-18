import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ManualRunButton } from './ManualRunButton';

jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }));

global.fetch = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('ManualRunButton', () => {
  it('renders the run button', () => {
    render(<ManualRunButton agencyId={1} scraperConfigId={10} type="overview" />);
    expect(screen.getByRole('button', { name: /handmatig starten/i })).toBeInTheDocument();
  });

  it('shows success message after successful run', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({ id: 5 }) });
    render(<ManualRunButton agencyId={1} scraperConfigId={10} type="overview" />);
    fireEvent.click(screen.getByRole('button', { name: /handmatig starten/i }));
    await waitFor(() => expect(screen.getByText(/in wachtrij/i)).toBeInTheDocument());
  });

  it('shows error message on fetch failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: jest.fn().mockResolvedValue({ error: 'Fout' }) });
    render(<ManualRunButton agencyId={1} scraperConfigId={10} type="overview" />);
    fireEvent.click(screen.getByRole('button', { name: /handmatig starten/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });
});
