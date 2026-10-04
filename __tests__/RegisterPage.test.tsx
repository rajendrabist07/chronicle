import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '../app/register/page';
import * as auth from '../app/lib/auth';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

vi.mock('../app/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    setUser: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../app/lib/auth', () => ({
  register: vi.fn(),
  resendVerificationEmail: vi.fn(),
  saveTokens: vi.fn(),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form fields', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('displays user-friendly message when registration encounters 500 DB error', async () => {
    const serverErr = Object.assign(
      new Error('The column users.emailVerifiedAt does not exist in the current database.'),
      { status: 500 }
    );
    vi.mocked(auth.register).mockRejectedValueOnce(serverErr);

    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/organization/i), 'Acme Inc');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByText(
        'Something went wrong on our side. Your data was not lost. Please try again shortly.'
      )
    ).toBeInTheDocument();
  });

  it('displays wake-up message when server has network failure / timeout', async () => {
    vi.mocked(auth.register).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.type(screen.getByLabelText(/organization/i), 'Acme Inc');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByText(
        "We can't reach the server right now. It may be waking up — please try again in a minute."
      )
    ).toBeInTheDocument();
  });
});
