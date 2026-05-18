import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table, ColumnDef } from './Table';

interface Row {
  id: number;
  name: string;
  count: number;
}

const columns: ColumnDef<Row>[] = [
  { key: 'name', header: 'Name', render: (r) => r.name, sortable: true, sortValue: (r) => r.name },
  { key: 'count', header: 'Count', align: 'right', render: (r) => r.count, sortable: true, sortValue: (r) => r.count },
];

const data: Row[] = [
  { id: 1, name: 'Bravo', count: 5 },
  { id: 2, name: 'Alpha', count: 10 },
  { id: 3, name: 'Charlie', count: 1 },
];

describe('Table', () => {
  it('renders all rows and headers', () => {
    render(<Table columns={columns} data={data} rowKey={(r) => r.id} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByText('Bravo')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('sorts ascending on first click', () => {
    render(<Table columns={columns} data={data} rowKey={(r) => r.id} />);
    fireEvent.click(screen.getByText('Name'));
    const cells = screen.getAllByRole('cell').filter((_, i) => i % 2 === 0);
    expect(cells.map(c => c.textContent)).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('sorts descending on second click', () => {
    render(<Table columns={columns} data={data} rowKey={(r) => r.id} />);
    fireEvent.click(screen.getByText('Name'));
    fireEvent.click(screen.getByText('Name'));
    const cells = screen.getAllByRole('cell').filter((_, i) => i % 2 === 0);
    expect(cells.map(c => c.textContent)).toEqual(['Charlie', 'Bravo', 'Alpha']);
  });

  it('calls onRowClick when row is clicked', () => {
    const onClick = jest.fn();
    render(<Table columns={columns} data={data} rowKey={(r) => r.id} onRowClick={onClick} />);
    fireEvent.click(screen.getByText('Bravo'));
    expect(onClick).toHaveBeenCalledWith(data[0]);
  });
});
