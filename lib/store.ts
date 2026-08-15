import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ClientQuestion {
  index: number;
  section: string;
  question: string;
  code: string | null;
  options: string[];
}

export interface ActiveAttempt {
  attemptId: string;
  questions: ClientQuestion[];
  durationSeconds: number;
  startedAt: number;
  answers: (number | null)[];
}

export interface ReviewItem {
  index: number;
  section: string;
  question: string;
  code: string | null;
  options: string[];
  chosenIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface LastResult {
  attemptId: string;
  score: number;
  total: number;
  review: ReviewItem[];
}

interface AssessmentState {
  activeAttempt: ActiveAttempt | null;
  lastResult: LastResult | null;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setActiveAttempt: (attempt: ActiveAttempt | null) => void;
  answerQuestion: (questionIdx: number, optionIdx: number) => void;
  setLastResult: (result: LastResult | null) => void;
  clearActiveAttempt: () => void;
  clearLastResult: () => void;
  resetAll: () => void;
}

// This store persists to localStorage, mirroring the previous lib/storage.js
// behavior: all in-progress test state (timer, current question, answers)
// lives on the client. MongoDB only stores the question bank and the
// "source of truth" snapshot/grade for each attempt.
export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      activeAttempt: null,
      lastResult: null,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setActiveAttempt: (attempt) => set({ activeAttempt: attempt }),

      answerQuestion: (questionIdx, optionIdx) => {
        const attempt = get().activeAttempt;
        if (!attempt) return;
        const answers = [...attempt.answers];
        answers[questionIdx] = optionIdx;
        set({ activeAttempt: { ...attempt, answers } });
      },

      setLastResult: (result) => set({ lastResult: result }),

      clearActiveAttempt: () => set({ activeAttempt: null }),

      clearLastResult: () => set({ lastResult: null }),

      resetAll: () => set({ activeAttempt: null, lastResult: null }),
    }),
    {
      name: "acn-assessment-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeAttempt: state.activeAttempt,
        lastResult: state.lastResult,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
