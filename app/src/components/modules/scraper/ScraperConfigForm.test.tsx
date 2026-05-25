import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScraperConfigForm } from './ScraperConfigForm';
import type { GetScraperConfigsDto } from '@/lib/modules/scraper/application/queries/get-scraper-configs/get-scraper-configs.dto';

jest.mock('@/app/admin/agencies/[id]/scrapers/[type]/actions', () => ({
  upsertScraperConfigAction: jest.fn(),
}));

const baseProps = {
  agencyId: 1,
  agencyDomain: 'https://www.example.nl',
  onTargetRequest: jest.fn(),
};

describe('ScraperConfigForm — overview', () => {
  it('renders URI path input with domain prefix', () => {
    render(
      <ScraperConfigForm
        {...baseProps}
        type="overview"
        existing={null}
        activeTargetField={null}
      />,
    );
    expect(screen.getByLabelText(/URI pad/i)).toBeInTheDocument();
    expect(screen.getByText('www.example.nl')).toBeInTheDocument();
  });

  it('prefills existing uri_path', () => {
    const existing: GetScraperConfigsDto = {
      id: 1, agencyId: 1, type: 'overview', status: 'configured',
      uriPath: '/aanbod', config: {}, lastRunAt: null, createdAt: '', updatedAt: '',
    };
    render(
      <ScraperConfigForm
        {...baseProps}
        type="overview"
        existing={existing}
        activeTargetField={null}
      />,
    );
    expect(screen.getByDisplayValue('/aanbod')).toBeInTheDocument();
  });
});

describe('ScraperConfigForm — detail', () => {
  it('renders example URL and url_pattern inputs', () => {
    render(
      <ScraperConfigForm
        {...baseProps}
        type="detail"
        existing={null}
        activeTargetField={null}
      />,
    );
    expect(screen.getByLabelText(/voorbeeld URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/URL patroon/i)).toBeInTheDocument();
  });

  it('renders field mapping rows for all expected fields', () => {
    render(
      <ScraperConfigForm
        {...baseProps}
        type="detail"
        existing={null}
        activeTargetField={null}
      />,
    );
    expect(screen.getByText(/titel/i)).toBeInTheDocument();
    expect(screen.getByText(/prijs/i)).toBeInTheDocument();
    expect(screen.getByText(/adres/i)).toBeInTheDocument();
  });
});
