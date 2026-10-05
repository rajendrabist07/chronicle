import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComprehensionQuiz, {
  generateFallbackQuizFromContent,
} from "../app/components/reading/ComprehensionQuiz";
import AskThisArticle, {
  findGroundedQuotes,
} from "../app/components/reading/AskThisArticle";

describe("Grounded AI Experience", () => {
  const sampleArticleContent = `
PostgreSQL Multi-Version Concurrency Control (MVCC) enables high concurrency without blocking reads.
When a row is updated, PostgreSQL writes a new row version (tuple) instead of overwriting the original.
Old row versions are later cleaned up by the autovacuum background daemon.
`;

  it("generates grounded quiz questions directly from article content sentences", () => {
    const generated = generateFallbackQuizFromContent(
      sampleArticleContent,
      "PostgreSQL MVCC Internals"
    );
    expect(generated.length).toBeGreaterThanOrEqual(1);
    expect(generated[0].verbatimCitation).toBeDefined();
  });

  it("interactive quiz allows selecting answer, displaying explanation and verbatim quote", async () => {
    const customQuestions = [
      {
        id: "q1",
        question: "How does PostgreSQL handle row updates under MVCC?",
        options: [
          "It writes a new row version (tuple) instead of overwriting the original.",
          "It acquires an exclusive global table lock.",
        ],
        correctIndex: 0,
        explanation: "MVCC isolates transactions by persisting immutable tuple snapshots.",
        verbatimCitation:
          "When a row is updated, PostgreSQL writes a new row version (tuple) instead of overwriting the original.",
      },
    ];

    render(
      <ComprehensionQuiz
        articleTitle="PostgreSQL MVCC"
        questions={customQuestions}
      />
    );

    expect(
      screen.getByText("How does PostgreSQL handle row updates under MVCC?")
    ).toBeInTheDocument();

    const correctOption = screen.getByText(
      "It writes a new row version (tuple) instead of overwriting the original."
    );
    await userEvent.click(correctOption);

    expect(await screen.findByText(/correct!/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /MVCC isolates transactions by persisting immutable tuple snapshots./i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/verbatim citation:/i)).toBeInTheDocument();
  });

  it("findGroundedQuotes extracts verbatim quotes matching technical queries", () => {
    const quotes = findGroundedQuotes(sampleArticleContent, "autovacuum");
    expect(quotes.length).toBeGreaterThanOrEqual(1);
    expect(quotes[0].matchedSentence).toContain("autovacuum");
  });

  it("AskThisArticle renders grounded verbatim results on user search", async () => {
    render(<AskThisArticle content={sampleArticleContent} />);

    const searchInput = screen.getByLabelText(/ask a question about this article/i);
    const submitBtn = screen.getByRole("button", { name: /find quote/i });

    await userEvent.type(searchInput, "autovacuum");
    await userEvent.click(submitBtn);

    expect(
      await screen.findByText(/verbatim grounded citation:/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Old row versions are later cleaned up by the autovacuum/i)
    ).toBeInTheDocument();
  });
});
