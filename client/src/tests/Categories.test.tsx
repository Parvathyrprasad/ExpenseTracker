import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryManager } from '../components/categories/CategoryManager';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('CategoryManager Component', () => {
  const mockCategories = [
    { id: 'cat-1', name: 'Food & Dining', type: 'EXPENSE', icon: 'Utensils', color: '#EF4444', isDefault: true },
    { id: 'cat-2', name: 'Freelancing', type: 'INCOME', icon: 'Laptop', color: '#059669', isDefault: false, userId: 'user-1' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({
      data: {
        success: true,
        data: { categories: mockCategories },
      },
    });
  });

  it('renders category list and displays Default badge for built-in category', async () => {
    render(<CategoryManager />);

    expect(screen.getByText('Categories Management')).toBeInTheDocument();
    expect(await screen.findByText('Food & Dining')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('Freelancing')).toBeInTheDocument();
  });

  it('opens category creation modal when clicking Add Custom Category', async () => {
    render(<CategoryManager />);

    const addBtn = screen.getByRole('button', { name: /Add Custom Category/i });
    fireEvent.click(addBtn);

    expect(await screen.findByText('Create Custom Category')).toBeInTheDocument();
    expect(screen.getByLabelText(/Category Name/i)).toBeInTheDocument();
  });
});
