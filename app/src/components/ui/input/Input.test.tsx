import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders with label and associates it with input', () => {
    render(<Input label="Naam" />);
    expect(screen.getByLabelText('Naam')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input label="Naam" error="Naam is verplicht" />);
    expect(screen.getByText('Naam is verplicht')).toBeInTheDocument();
  });

  it('shows hint when no error', () => {
    render(<Input label="Website" hint="Inclusief https://" />);
    expect(screen.getByText('Inclusief https://')).toBeInTheDocument();
  });

  it('hides hint when error is shown', () => {
    render(<Input label="Website" hint="Inclusief https://" error="Ongeldig" />);
    expect(screen.queryByText('Inclusief https://')).not.toBeInTheDocument();
    expect(screen.getByText('Ongeldig')).toBeInTheDocument();
  });

  it('renders before addon', () => {
    render(<Input label="URI" before="https://example.com" />);
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });
});
