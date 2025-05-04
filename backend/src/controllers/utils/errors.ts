// src/controllers/utils/errors.ts


/**
 * Non-retryable errors class, for identification of errors that should not be retried
 */
export class NonRetryableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NonRetryableError";
    }
}

/**
 * Authentication error class, for identification of errors that should not be retried
 */
export class AuthError extends NonRetryableError {
    constructor(message: string = "Authentication failed") {
        super(message);
        this.name = "AuthError";
    }
}

/**
 * Parsing error class, for identification of errors that should not be retried
 */
export class ParsingError extends NonRetryableError {
    constructor(message: string = "Failed to parse response") {
        super(message);
        this.name = "ParsingError";
    }
}
