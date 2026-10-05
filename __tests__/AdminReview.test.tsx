import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminReviewPage from "../app/admin/review/page";
import * as admin from "../app/lib/admin";

vi.mock("../app/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "admin-1", email: "admin@chronicle.com", role: "ADMIN" },
    isLoading: false,
    setUser: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock("../app/lib/auth", () => ({
  getAccessToken: () => "mock-admin-token",
}));

vi.mock("../app/lib/admin", () => ({
  getModerationQueue: vi.fn(),
  approvePost: vi.fn(),
  rejectPost: vi.fn(),
  unpublishPost: vi.fn(),
  updateReportStatus: vi.fn(),
  setUserTrustLevel: vi.fn(),
  suspendUser: vi.fn(),
  restoreUser: vi.fn(),
  getAuditLogs: vi.fn(),
}));

describe("AdminReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders review queue and handles post approval", async () => {
    vi.mocked(admin.getModerationQueue).mockResolvedValueOnce({
      success: true,
      data: {
        posts: [
          {
            id: "post-101",
            title: "Scaling Distributed Caches",
            content: "Detailed technical article about Redis and cache invalidation strategies.",
            status: "PENDING_REVIEW",
            authorId: "author-1",
            authorName: "Jane Doe",
            createdAt: "2026-10-05T12:00:00Z",
            slug: "scaling-distributed-caches",
          } as any,
        ],
        reports: [],
      } as any,
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    vi.mocked(admin.approvePost).mockResolvedValueOnce({
      id: "post-101",
      title: "Scaling Distributed Caches",
      status: "PUBLISHED",
    } as any);

    render(<AdminReviewPage />);

    expect(await screen.findByText("Scaling Distributed Caches")).toBeInTheDocument();
    expect(screen.getByText("PENDING REVIEW")).toBeInTheDocument();

    const approveButton = screen.getByRole("button", { name: /approve & publish/i });
    await userEvent.click(approveButton);

    expect(admin.approvePost).toHaveBeenCalledWith("post-101", "mock-admin-token");
  });

  it("switches to audit log tab and displays audit history", async () => {
    vi.mocked(admin.getModerationQueue).mockResolvedValueOnce({
      success: true,
      data: { posts: [], reports: [] } as any,
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    vi.mocked(admin.getAuditLogs).mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: "audit-1",
          userId: "admin-1",
          action: "POST_APPROVED",
          resource: "post:post-101",
          createdAt: "2026-10-05T13:00:00Z",
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    render(<AdminReviewPage />);

    const auditTab = await screen.findByRole("button", { name: /audit log/i });
    await userEvent.click(auditTab);

    expect(await screen.findByText("POST_APPROVED")).toBeInTheDocument();
    expect(screen.getByText(/resource: post:post-101/i)).toBeInTheDocument();
  });
});
