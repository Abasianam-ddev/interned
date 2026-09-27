export type ActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Incremented on every response so the client can react to repeated identical results. */
  ts?: number;
  data?: Record<string, unknown>;
};

export const initialState: ActionState = {};

export function fail(error: string, fieldErrors?: Record<string, string>): ActionState {
  return { ok: false, error, fieldErrors, ts: Date.now() };
}

export function success(message?: string, data?: Record<string, unknown>): ActionState {
  return { ok: true, message, data, ts: Date.now() };
}

/** Convert a zod error into a `{ field: message }` map (first message wins). */
export function zodFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
