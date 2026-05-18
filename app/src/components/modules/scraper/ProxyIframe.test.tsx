import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProxyIframe } from './ProxyIframe';

describe('ProxyIframe', () => {
  it('renders a placeholder when url is null', () => {
    render(<ProxyIframe url={null} activeFieldKey={null} onElementSelected={jest.fn()} />);
    expect(screen.getByText(/voer een URL in/i)).toBeInTheDocument();
  });

  it('renders an iframe when url is provided', () => {
    render(
      <ProxyIframe
        url="https://example.com"
        activeFieldKey={null}
        onElementSelected={jest.fn()}
      />,
    );
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe?.src).toContain('/api/admin/proxy');
    expect(iframe?.src).toContain(encodeURIComponent('https://example.com'));
  });
});
