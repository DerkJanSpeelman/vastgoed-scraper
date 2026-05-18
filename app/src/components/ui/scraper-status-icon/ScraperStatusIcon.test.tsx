import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScraperStatusIcon } from './ScraperStatusIcon';

describe('ScraperStatusIcon', () => {
  it('renders ? for null status', () => {
    render(<ScraperStatusIcon status={null} />);
    expect(screen.getByTitle('Geen configuratie')).toBeInTheDocument();
  });

  it('renders unconfigured state', () => {
    render(<ScraperStatusIcon status="unconfigured" />);
    expect(screen.getByTitle('Niet geconfigureerd')).toBeInTheDocument();
  });

  it('renders active state', () => {
    render(<ScraperStatusIcon status="active" />);
    expect(screen.getByTitle('Actief')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<ScraperStatusIcon status="error" />);
    expect(screen.getByTitle('Fout')).toBeInTheDocument();
  });
});
