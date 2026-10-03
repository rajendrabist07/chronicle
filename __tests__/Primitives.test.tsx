import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Select from "../app/components/ui/Select";
import Badge from "../app/components/ui/Badge";
import Avatar from "../app/components/ui/Avatar";
import Modal from "../app/components/ui/Modal";
import Tabs from "../app/components/ui/Tabs";
import EmptyState from "../app/components/ui/EmptyState";
import Pagination from "../app/components/ui/Pagination";

describe("Design System Primitives", () => {
  describe("Select component", () => {
    it("renders options and label", () => {
      render(
        <Select
          id="role"
          label="Select Role"
          options={[
            { value: "admin", label: "Admin" },
            { value: "member", label: "Member" },
          ]}
        />,
      );
      expect(screen.getByLabelText(/select role/i)).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Admin" })).toBeInTheDocument();
    });

    it("renders error message when provided", () => {
      render(
        <Select
          id="category"
          label="Category"
          error="Category is required"
          options={[{ value: "tech", label: "Tech" }]}
        />,
      );
      expect(screen.getByText("Category is required")).toBeInTheDocument();
    });
  });

  describe("Badge component", () => {
    it("renders with different variants", () => {
      render(<Badge variant="success">Active</Badge>);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });

  describe("Avatar component", () => {
    it("renders initials correctly", () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("renders single word name initials", () => {
      render(<Avatar name="Admin" />);
      expect(screen.getByText("AD")).toBeInTheDocument();
    });
  });

  describe("Modal component", () => {
    it("renders title and content when open", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Delete Confirmation">
          <p>Are you sure?</p>
        </Modal>,
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Delete Confirmation")).toBeInTheDocument();
      expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Hidden Dialog">
          <p>Hidden Content</p>
        </Modal>,
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("calls onClose when close button is clicked", async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Dialog">
          <p>Content</p>
        </Modal>,
      );

      const closeButton = screen.getByRole("button", { name: /close modal/i });
      await user.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Tabs component", () => {
    it("renders tabs and switches panels on click", async () => {
      const user = userEvent.setup();
      render(
        <Tabs
          tabs={[
            { id: "tab1", label: "Overview", content: <p>Overview Content</p> },
            { id: "tab2", label: "Settings", content: <p>Settings Content</p> },
          ]}
        />,
      );

      expect(screen.getByText("Overview Content")).toBeInTheDocument();
      expect(screen.queryByText("Settings Content")).not.toBeInTheDocument();

      const settingsTab = screen.getByRole("tab", { name: /settings/i });
      await user.click(settingsTab);

      expect(screen.getByText("Settings Content")).toBeInTheDocument();
    });
  });

  describe("EmptyState component", () => {
    it("renders title, description and action", () => {
      render(
        <EmptyState
          title="No Results"
          description="Try adjusting your query"
          action={<button>Reset</button>}
        />,
      );
      expect(screen.getByText("No Results")).toBeInTheDocument();
      expect(screen.getByText("Try adjusting your query")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    });
  });

  describe("Pagination component", () => {
    it("renders current page and total pages", () => {
      render(<Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />);
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("calls onPageChange on Next click", async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<Pagination currentPage={2} totalPages={5} onPageChange={handleChange} />);

      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);
      expect(handleChange).toHaveBeenCalledWith(3);
    });
  });
});
