import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';
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
  login: vi.fn(),
  saveTokens: vi.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors when submitting an empty form', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /sign in|log in/i });
    await user.click(submitButton);

    expect(await screen.findByText('Invalid email format')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('calls login when valid credentials are submitted', async () => {
    const mockUser = {
      id: 'u1',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'MEMBER' as const,
    };
    vi.mocked(auth.login).mockResolvedValueOnce({
      user: mockUser,
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
    });

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in|log in/i });
    await user.click(submitButton);

    expect(auth.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('displays user-friendly message when server returns 500 error', async () => {
    const serverErr = Object.assign(
      new Error('The table public.post_likes does not exist'),
      { status: 500 }
    );
    vi.mocked(auth.login).mockRejectedValueOnce(serverErr);

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in|log in/i });
    await user.click(submitButton);

    expect(
      await screen.findByText(
        'Something went wrong on our side. Your data was not lost. Please try again shortly.'
      )
    ).toBeInTheDocument();
  });

  it('displays wake-up message when server has network failure / timeout', async () => {
    vi.mocked(auth.login).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in|log in/i });
    await user.click(submitButton);

    expect(
      await screen.findByText(
        "We can't reach the server right now. It may be waking up — please try again in a minute."
      )
    ).toBeInTheDocument();
  });
});
