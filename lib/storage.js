// All in-progress test state (timer, current question, answers) lives in
// localStorage on the client, as requested. MongoDB only stores the question
// bank and the "source of truth" snapshot/grade for each attempt.

const ATTEMPT_KEY = "acn_active_attempt";
const RESULT_KEY = "acn_last_result";

export function saveActiveAttempt(attempt) {
  localStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempt));
}

export function loadActiveAttempt() {
  const raw = localStorage.getItem(ATTEMPT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearActiveAttempt() {
  localStorage.removeItem(ATTEMPT_KEY);
}

export function saveLastResult(result) {
  localStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function loadLastResult() {
  const raw = localStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearLastResult() {
  localStorage.removeItem(RESULT_KEY);
}

export function clearAll() {
  clearActiveAttempt();
  clearLastResult();
}
