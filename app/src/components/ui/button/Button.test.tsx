import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders as button with text', () => {
    render(<Button text="Opslaan" />);
    expect(screen.getByRole('button', { name: 'Opslaan' })).toBeInTheDocument();
  });

  it('renders as link when href provided', () => {
    render(<Button text="Nieuw" href="/admin/agencies/new" />);
    expect(screen.getByRole('link', { name: 'Nieuw' })).toHaveAttribute('href', '/admin/agencies/new');
  });

  it('calls onClick when clicked', () => {
    const fn = jest.fn();
    render(<Button text="Klik" onClick={fn} />);
    fireEvent.click(screen.getByRole('button'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop set', () => {
    render(<Button text="Verwijder" disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
