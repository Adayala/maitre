export type ArcaErrorKind =
  | "CONFIGURATION"
  | "AUTHENTICATION"
  | "TRANSPORT"
  | "SOAP_FAULT"
  | "INVALID_RESPONSE"
  | "ARCA_REJECTION";

export class ArcaError extends Error {
  readonly kind: ArcaErrorKind;
  readonly code?: string;
  readonly retryable: boolean;
  readonly outcomeAmbiguous: boolean;
  readonly httpStatus?: number;

  constructor(
    message: string,
    options: {
      kind: ArcaErrorKind;
      code?: string;
      retryable?: boolean;
      outcomeAmbiguous?: boolean;
      httpStatus?: number;
      cause?: unknown;
    },
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "ArcaError";
    this.kind = options.kind;
    this.retryable = options.retryable ?? false;
    this.outcomeAmbiguous = options.outcomeAmbiguous ?? false;
    if (options.code !== undefined) this.code = options.code;
    if (options.httpStatus !== undefined) this.httpStatus = options.httpStatus;
  }
}
