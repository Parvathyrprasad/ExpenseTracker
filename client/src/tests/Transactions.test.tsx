import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionList } from '../components/transactions/TransactionList';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('TransactionList Component', () => {
  const mockCategories = [
    { id: 'cat-1', name: 'Food & Dining', type: 'EXPENSE', icon: 'Utensils', color: '#EF4444', isDefault: true },
    { id: 'cat-2', name: 'Salary', type: 'INCOME', icon: 'Briefcase', color: '#10B981', isDefault: true },
  ];

  const mockTransactions = [
    {
      id: 'tx-1',
      title: 'Swiggy Dinner',
      amount: '850.50',
      type: 'EXPENSE',
      categoryId: 'cat-1',
      category: mockCategories[0],
      transactionDate: '2026-11-19T10:00:00.000Z',
      paymentMethod: 'UPI',
      note: 'Dinner with team',
      createdAt: '2026-11-19T10:00:00.000Z',
      updatedAt: '2026-11-19T10:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/categories') {
        return Promise.resolve({ data: { success: true, data: { categories: mockCategories } } });
      }
      if (url === '/transactions') {
        return Promise.resolve({ data: { success: true, data: { transactions: mockTransactions } } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('renders transactions header and summary cards', async () => {
    render(<TransactionList />);

    expect(screen.getByRole('heading', { name: 'Transactions' })).toBeInTheDocument();
    expect(await screen.findByText('Swiggy Dinner')).toBeInTheDocument();
    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    expect(screen.getAllByText(/850\.50/).length).toBeGreaterThanOrEqual(1);
  });

  it('opens transaction modal when clicking Record Transaction', async () => {
    render(<TransactionList />);

    const recordBtn = screen.getByRole('button', { name: /Record Transaction/i });
    fireEvent.click(recordBtn);

    expect(await screen.findByText('Record Transaction', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Title \/ Payee/i)).toBeInTheDocument();
  });
});
