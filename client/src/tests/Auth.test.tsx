import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('Authentication Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('LoginForm', () => {
    it('renders login form with email, password, and sign in button', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
      expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
    });

    it('shows error if submitted with empty fields', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <LoginForm />
          </AuthProvider>
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /Sign In/i });
      fireEvent.click(submitButton);

      expect(await screen.findByText(/Please fill in both email and password/i)).toBeInTheDocument();
    });
  });

  describe('RegisterForm', () => {
    it('renders registration form with INR selected by default', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <RegisterForm />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Preferred Currency/i)).toBeInTheDocument();

      const currencySelect = screen.getByLabelText(/Preferred Currency/i) as HTMLSelectElement;
      expect(currencySelect.value).toBe('INR');

      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    });

    it('validates password mismatch on registration', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <RegisterForm />
          </AuthProvider>
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Priya' } });
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Patel' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'priya@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: 'passwordDifferent' } });

      fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

      expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });
});
