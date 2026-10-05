import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import InteractiveFeaturePreview from "../app/components/home/InteractiveFeaturePreview";
import { TrustLevelBadge, ReviewStatusBadge } from "../app/components/trust/TrustBadge";

describe("Trust and Review Badges", () => {
  it("renders Contributor, Verified, and Domain Authority levels", () => {
    const { rerender } = render(<TrustLevelBadge level="contributor" />);
    expect(screen.getByText("Contributor")).toBeInTheDocument();

    rerender(<TrustLevelBadge level="verified" />);
    expect(screen.getByText("Verified Engineer")).toBeInTheDocument();

    rerender(<TrustLevelBadge level="authority" />);
    expect(screen.getByText("Domain Authority")).toBeInTheDocument();
  });

  it("renders ReviewStatusBadge variants", () => {
    const { rerender } = render(<ReviewStatusBadge badge="peer_reviewed" />);
    expect(screen.getByText("Peer Reviewed")).toBeInTheDocument();

    rerender(<ReviewStatusBadge badge="code_verified" />);
    expect(screen.getByText("Syntax Verified")).toBeInTheDocument();

    rerender(<ReviewStatusBadge badge="comprehension_ready" />);
    expect(screen.getByText("Quiz Ready")).toBeInTheDocument();
  });
});

describe("InteractiveFeaturePreview", () => {
  it("renders comprehension tab by default and switches between tabs", () => {
    render(<InteractiveFeaturePreview />);
    expect(screen.getByText(/Check Your Understanding/i)).toBeInTheDocument();
    expect(screen.getByText(/Ask This Article/i)).toBeInTheDocument();

    // Switch to Trust & Review tab
    const trustTab = screen.getByRole("button", { name: /Trust & Review Layer/i });
    fireEvent.click(trustTab);

    expect(screen.getAllByText("Community Contributor").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Verified Engineer").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Domain Authority").length).toBeGreaterThan(0);
  });

  it("handles interactive quiz selection and displays immediate feedback", () => {
    render(<InteractiveFeaturePreview />);

    const correctOption = screen.getByText(/It writes a new tuple and marks the old tuple as dead/i);
    fireEvent.click(correctOption);

    expect(screen.getByText(/Correct! Grounded in the text/i)).toBeInTheDocument();

    // Reset quiz
    const tryAgainBtn = screen.getByRole("button", { name: /Try Again/i });
    fireEvent.click(tryAgainBtn);

    expect(screen.queryByText(/Correct! Grounded in the text/i)).not.toBeInTheDocument();
  });

  it("updates verbatim quote when an 'Ask This Article' query is clicked", () => {
    render(<InteractiveFeaturePreview />);

    const vacuumQuestion = screen.getByRole("button", { name: /"What role does VACUUM play\?"/i });
    fireEvent.click(vacuumQuestion);

    expect(screen.getByText(/"The vacuum process eventually reclaims dead tuples to prevent table bloat\."/i)).toBeInTheDocument();
  });
});
