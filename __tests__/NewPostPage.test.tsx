import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewPostPage from "../app/posts/new/page";
import * as posts from "../app/lib/posts";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/posts/new",
}));

vi.mock("../app/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "author@chronicle.com", role: "USER" },
    isLoading: false,
    setUser: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock("../app/lib/auth", () => ({
  getAccessToken: () => "mock-access-token",
}));

vi.mock("../app/lib/posts", () => ({
  createPost: vi.fn(),
}));

const mockSuccessToast = vi.fn();
const mockErrorToast = vi.fn();

vi.mock("../app/components/ui/Toast", () => ({
  useToast: () => ({
    success: mockSuccessToast,
    error: mockErrorToast,
  }),
}));

describe("NewPostPage - Button Action Isolation and Feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders both Save as Draft and Publish Now buttons independently", () => {
    render(<NewPostPage />);
    expect(screen.getByRole("button", { name: /save as draft/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /publish now/i })).toBeInTheDocument();
  });

  it("triggers Publish Now and handles PENDING_REVIEW status with honest review guidance", async () => {
    vi.mocked(posts.createPost).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                id: "post-999",
                title: "Understanding Postgres Indexes",
                content: "Detailed deep-dive into B-Trees and GiST indexes in production.",
                status: "PENDING_REVIEW",
              } as any),
            100
          )
        )
    );

    render(<NewPostPage />);

    const titleInput = screen.getByLabelText(/title/i);
    const contentInput = screen.getByLabelText(/story content/i);
    const publishButton = screen.getByRole("button", { name: /publish now/i });
    const draftButton = screen.getByRole("button", { name: /save as draft/i });

    await userEvent.type(titleInput, "Understanding Postgres Indexes");
    await userEvent.type(
      contentInput,
      "Detailed deep-dive into B-Trees and GiST indexes in production systems."
    );

    await userEvent.click(publishButton);

    // Draft button is disabled but not loading
    expect(draftButton).toBeDisabled();

    await waitFor(() => {
      expect(posts.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Understanding Postgres Indexes",
          status: "PUBLISHED",
        }),
        "mock-access-token"
      );
    });

    await waitFor(() => {
      expect(mockSuccessToast).toHaveBeenCalledWith(
        expect.stringMatching(/submitted for review/i)
      );
      expect(mockPush).toHaveBeenCalledWith("/posts/post-999");
    });
  });

  it("triggers Save as Draft and saves with DRAFT status", async () => {
    vi.mocked(posts.createPost).mockResolvedValueOnce({
      id: "post-888",
      title: "Drafting Microservices Architecture",
      content: "Draft notes about gRPC and service discovery.",
      status: "DRAFT",
    } as any);

    render(<NewPostPage />);

    const titleInput = screen.getByLabelText(/title/i);
    const contentInput = screen.getByLabelText(/story content/i);
    const draftButton = screen.getByRole("button", { name: /save as draft/i });

    await userEvent.type(titleInput, "Drafting Microservices Architecture");
    await userEvent.type(
      contentInput,
      "Draft notes about gRPC and service discovery in modern Go services."
    );

    await userEvent.click(draftButton);

    await waitFor(() => {
      expect(posts.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Drafting Microservices Architecture",
          status: "DRAFT",
        }),
        "mock-access-token"
      );
      expect(mockSuccessToast).toHaveBeenCalledWith(
        expect.stringMatching(/draft saved successfully/i)
      );
      expect(mockPush).toHaveBeenCalledWith("/posts/post-888");
    });
  });
});
