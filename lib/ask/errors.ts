import Anthropic from "@anthropic-ai/sdk";

export const FRIENDLY_ERRORS = {
  notConfigured: "Ask Nare isn't configured on this deployment yet. Email Nare instead.",
  rateLimited: "Too many questions too quickly — please wait a moment and try again.",
  upstreamBusy: "The model is busy right now. Please try again in a few seconds.",
  generic: "Something went wrong answering that. Please try again, or email Nare directly.",
  invalid: "That request couldn't be understood. Please refresh and try again.",
} as const;

/** Map an upstream error to a user-safe message; details are logged server-side only. */
export function friendlyErrorMessage(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) return FRIENDLY_ERRORS.notConfigured;
  if (error instanceof Anthropic.BadRequestError && /credit balance|billing/i.test(error.message)) {
    return FRIENDLY_ERRORS.notConfigured;
  }
  if (error instanceof Anthropic.RateLimitError) return FRIENDLY_ERRORS.upstreamBusy;
  if (error instanceof Anthropic.APIConnectionError) return FRIENDLY_ERRORS.upstreamBusy;
  if (error instanceof Anthropic.APIError && error.status !== undefined && error.status >= 500) {
    return FRIENDLY_ERRORS.upstreamBusy;
  }
  return FRIENDLY_ERRORS.generic;
}
