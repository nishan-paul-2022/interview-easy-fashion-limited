import { render, screen } from '@testing-library/react';
import React from 'react';
import { DataTable } from '@/components/organisms/DataTable';

interface TestData {
  id: number;
  name: string;
}

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
];

const mockData: TestData[] = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
];

describe('DataTable Component', () => {
  it('renders rows with data', () => {
    render(<DataTable columns={columns} data={mockData} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders skeleton/loading state when isLoading is true', () => {
    const { container } = render(<DataTable columns={columns} data={mockData} isLoading />);
    // When loading, it renders TableLoading which usually has animate-pulse
    // We check for animate-pulse or skeleton class
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    // Ensure actual data is not rendered
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('renders EmptyState when data is empty', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
    expect(screen.getByText('There are no records to display.')).toBeInTheDocument();
  });

  it('renders EmptyState when isEmpty prop is true despite data', () => {
    render(<DataTable columns={columns} data={mockData} isEmpty />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });
});
