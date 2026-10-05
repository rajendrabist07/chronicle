import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import VerifyEmailPage from "../app/verify-email/page";
import * as auth from "../app/lib/auth";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (param: string) => (param === "token" ? "valid-token-123" : null),
  }),
}));

vi.mock("../app/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    setUser: vi.fn(),
    refreshUser: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
  }),
}));

vi.mock("../app/lib/auth", () => ({
  verifyEmail: vi.fn(),
  resendVerificationEmail: vi.fn(),
}));

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("auto-submits token and shows success message on successful verification", async () => {
    vi.mocked(auth.verifyEmail).mockResolvedValueOnce({
      message: "Email verified successfully",
    });

    render(<VerifyEmailPage />);

    expect(auth.verifyEmail).toHaveBeenCalledWith("valid-token-123");
    expect(await screen.findByText(/email verified!/i)).toBeInTheDocument();
  });

  it("shows error state when verification token fails", async () => {
    vi.mocked(auth.verifyEmail).mockRejectedValueOnce(
      new Error("Invalid or expired verification token"),
    );

    render(<VerifyEmailPage />);

    expect(await screen.findByText(/verification failed/i)).toBeInTheDocument();
    expect(
      screen.getByText(/invalid or expired verification token/i),
    ).toBeInTheDocument();
  });
});
