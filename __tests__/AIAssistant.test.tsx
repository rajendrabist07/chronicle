import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AIAssistantPanel from "../app/components/ai/AIAssistantPanel";
import { ToastProvider } from "../app/components/ui/Toast";

describe("AIAssistantPanel Component", () => {
  const sampleContent = `
PostgreSQL implements Multi-Version Concurrency Control (MVCC).
Under MVCC, writes do not block reads and reads do not block writes.
The vacuum daemon reclaims storage from dead tuples.
`;

  it("renders all four tabs and allows tab switching", () => {
    render(
      <ToastProvider>
        <AIAssistantPanel
          content={sampleContent}
          onApplyTitle={vi.fn()}
          onApplyTags={vi.fn()}
          onApplyContent={vi.fn()}
          onAppendContent={vi.fn()}
        />
      </ToastProvider>
    );

    expect(screen.getByRole("button", { name: /^Suggest$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Tone$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Outline$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Quiz$/i })).toBeInTheDocument();
  });

  it("generates comprehension quiz questions and appends them to content", () => {
    const onAppend = vi.fn();

    render(
      <ToastProvider>
        <AIAssistantPanel
          content={sampleContent}
          onApplyTitle={vi.fn()}
          onApplyTags={vi.fn()}
          onApplyContent={vi.fn()}
          onAppendContent={onAppend}
        />
      </ToastProvider>
    );

    // Switch to Quiz Tab
    const quizTab = screen.getByRole("button", { name: /Quiz/i });
    fireEvent.click(quizTab);

    // Generate Quiz
    const generateBtn = screen.getByRole("button", { name: /Generate Comprehension Quiz/i });
    fireEvent.click(generateBtn);

    expect(screen.getByText(/Questions Generated/i)).toBeInTheDocument();

    // Append to story
    const appendBtn = screen.getByRole("button", { name: /Append to Story/i });
    fireEvent.click(appendBtn);

    expect(onAppend).toHaveBeenCalledWith(expect.stringContaining("## Check Your Understanding"));
  });
});
