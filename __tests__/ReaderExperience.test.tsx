import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TableOfContents, { extractHeadings } from "../app/components/reading/TableOfContents";
import ComprehensionQuiz from "../app/components/reading/ComprehensionQuiz";
import AskThisArticle, { findGroundedQuotes } from "../app/components/reading/AskThisArticle";
import ReadingPreferences from "../app/components/reading/ReadingPreferences";

describe("Table of Contents Heading Extraction", () => {
  it("correctly extracts markdown h2 and h3 headings", () => {
    const md = `
# Main Title (h1 ignored)
Intro text here.

## Architectural Overview
Some text under architecture.

### Database Layer
Details on PostgreSQL and connection pooling.

## Benchmarks & Performance
Throughput stats.
`;

    const headings = extractHeadings(md);
    expect(headings).toHaveLength(3);
    expect(headings[0]).toEqual({
      id: "architectural-overview",
      text: "Architectural Overview",
      level: 2,
    });
    expect(headings[1]).toEqual({
      id: "database-layer",
      text: "Database Layer",
      level: 3,
    });
    expect(headings[2]).toEqual({
      id: "benchmarks-performance",
      text: "Benchmarks & Performance",
      level: 2,
    });
  });

  it("renders table of contents list elements", () => {
    const headings = [
      { id: "intro", text: "Introduction", level: 2 },
      { id: "details", text: "Deep Dive Details", level: 3 },
    ];

    render(<TableOfContents headings={headings} />);
    expect(screen.getByText("Table of Contents")).toBeInTheDocument();
    expect(screen.getByText("Introduction")).toBeInTheDocument();
    expect(screen.getByText("Deep Dive Details")).toBeInTheDocument();
  });
});

describe("Comprehension Quiz Component", () => {
  const sampleQuestions = [
    {
      id: "q1",
      question: "What is the primary benefit of MVCC?",
      options: ["Non-blocking reads during writes", "Zero memory consumption", "Automatic SQL translation"],
      correctIndex: 0,
      explanation: "MVCC allows readers not to block writers.",
      verbatimCitation: "MVCC isolates concurrent transactions.",
    },
    {
      id: "q2",
      question: "How are dead tuples removed in PostgreSQL?",
      options: ["Manually dropping the table", "The VACUUM daemon cleans them", "They are never removed"],
      correctIndex: 1,
      explanation: "VACUUM processes expired tuples.",
      verbatimCitation: "The vacuum process reclaims dead tuples.",
    },
  ];

  it("renders first question, allows option selection, and advances to finish", () => {
    render(
      <ComprehensionQuiz
        articleTitle="PostgreSQL MVCC"
        questions={sampleQuestions}
      />
    );

    expect(screen.getByText("What is the primary benefit of MVCC?")).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();

    // Select correct option
    const opt0 = screen.getByText("Non-blocking reads during writes");
    fireEvent.click(opt0);

    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
    expect(screen.getByText("MVCC allows readers not to block writers.")).toBeInTheDocument();

    // Click Next
    const nextBtn = screen.getByRole("button", { name: /Next Question/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText("How are dead tuples removed in PostgreSQL?")).toBeInTheDocument();

    // Select correct option for question 2
    const opt1 = screen.getByText("The VACUUM daemon cleans them");
    fireEvent.click(opt1);

    // Finish Quiz
    const finishBtn = screen.getByRole("button", { name: /Finish Quiz/i });
    fireEvent.click(finishBtn);

    expect(screen.getByText("Comprehension Check Complete!")).toBeInTheDocument();
    expect(screen.getByText(/You scored/i)).toBeInTheDocument();
  });
});

describe("Ask This Article Quote Search", () => {
  const content = `
PostgreSQL implements Multi-Version Concurrency Control to guarantee ACID compliance without locking full tables.

The query planner evaluates sequential scans versus index scans depending on table statistics gathered by ANALYZE.

Connection pooling with PgBouncer minimizes fork overhead for high concurrency applications.
`;

  it("extracts grounded sentences for matching query", () => {
    const results = findGroundedQuotes(content, "PgBouncer");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].matchedSentence).toContain("Connection pooling with PgBouncer");
  });

  it("renders search input and finds quotes upon submission", () => {
    render(<AskThisArticle content={content} />);

    const input = screen.getByPlaceholderText(/e.g. Postgres MVCC/i);
    fireEvent.change(input, { target: { value: "planner" } });

    const submitBtn = screen.getByRole("button", { name: /Find Quote/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Verbatim Grounded Citation:/i)).toBeInTheDocument();
  });
});

describe("Reading Preferences Component", () => {
  it("triggers font size change and zen mode toggle callbacks", () => {
    const onFontChange = vi.fn();
    const onZenToggle = vi.fn();

    render(
      <ReadingPreferences
        onFontSizeChange={onFontChange}
        onZenModeToggle={onZenToggle}
        currentFontSize="normal"
        isZenMode={false}
      />
    );

    const largeBtn = screen.getByTitle("Large Text Size");
    fireEvent.click(largeBtn);
    expect(onFontChange).toHaveBeenCalledWith("large");

    const zenBtn = screen.getByRole("button", { name: /Zen Mode/i });
    fireEvent.click(zenBtn);
    expect(onZenToggle).toHaveBeenCalledWith(true);
  });
});
