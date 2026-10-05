import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PostStatusTimeline from "../app/components/trust/PostStatusTimeline";

describe("PostStatusTimeline", () => {
  it("renders draft status correctly", () => {
    render(<PostStatusTimeline status="DRAFT" createdAt="2026-10-05T10:00:00Z" />);
    expect(screen.getByText("Publication Status")).toBeInTheDocument();
    expect(screen.getByText("DRAFT")).toBeInTheDocument();
    expect(screen.getByText("Draft Created")).toBeInTheDocument();
  });

  it("renders pending review status correctly", () => {
    render(<PostStatusTimeline status="PENDING_REVIEW" />);
    expect(screen.getByText("PENDING REVIEW")).toBeInTheDocument();
    expect(screen.getByText("In Review")).toBeInTheDocument();
  });

  it("renders published status with live link description", () => {
    render(
      <PostStatusTimeline
        status="PUBLISHED"
        publishedAt="2026-10-05T15:00:00Z"
      />
    );
    expect(screen.getByText("PUBLISHED")).toBeInTheDocument();
    expect(screen.getByText("Published Live")).toBeInTheDocument();
    expect(
      screen.getByText("Visible to public readers with trust badges")
    ).toBeInTheDocument();
  });

  it("renders rejected status with author revision reason", () => {
    render(
      <PostStatusTimeline
        status="REJECTED"
        rejectionReason="Please include technical benchmarks in section 3."
      />
    );
    expect(screen.getByText("REJECTED")).toBeInTheDocument();
    expect(screen.getByText("Revision Requested")).toBeInTheDocument();
    expect(
      screen.getByText("Please include technical benchmarks in section 3.")
    ).toBeInTheDocument();
  });
});
