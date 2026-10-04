import { describe, it, expect } from "vitest";
import { describeApiError } from "../app/lib/errors";

describe("describeApiError helper", () => {
  it("maps network connection failure / TypeError to friendly wake-up message", () => {
    const error = new TypeError("Failed to fetch");
    expect(describeApiError(error)).toBe(
      "We can't reach the server right now. It may be waking up — please try again in a minute."
    );
  });

  it("maps abort timeout error to friendly wake-up message", () => {
    const error = { name: "AbortError", message: "The operation was aborted" };
    expect(describeApiError(error)).toBe(
      "We can't reach the server right now. It may be waking up — please try again in a minute."
    );
  });

  it("maps 500 server error to safe data-not-lost message", () => {
    const error = Object.assign(new Error("Database connection pool full"), {
      status: 500,
    });
    expect(describeApiError(error)).toBe(
      "Something went wrong on our side. Your data was not lost. Please try again shortly."
    );
  });

  it("maps proxy HTML parse error to safe data-not-lost message", () => {
    const error = new SyntaxError("Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON");
    expect(describeApiError(error)).toBe(
      "Something went wrong on our side. Your data was not lost. Please try again shortly."
    );
  });

  it("maps raw Prisma leak to safe data-not-lost message", () => {
    const error = new Error(
      "PrismaClientKnownRequestError: The column users.emailVerifiedAt does not exist"
    );
    expect(describeApiError(error)).toBe(
      "Something went wrong on our side. Your data was not lost. Please try again shortly."
    );
  });

  it("preserves 400 validation error message from server", () => {
    const error = Object.assign(new Error("Email already registered"), {
      status: 400,
    });
    expect(describeApiError(error)).toBe("Email already registered");
  });

  it("preserves 401 invalid credentials message from server", () => {
    const error = Object.assign(new Error("Invalid email or password"), {
      status: 401,
    });
    expect(describeApiError(error)).toBe("Invalid email or password");
  });

  it("handles 429 rate limiting with friendly message", () => {
    const error = Object.assign(new Error("Rate limit exceeded"), {
      status: 429,
    });
    expect(describeApiError(error)).toBe("Rate limit exceeded");
  });

  it("returns fallback for empty error", () => {
    expect(describeApiError(null)).toBe(
      "An unexpected error occurred. Please try again."
    );
  });
});
