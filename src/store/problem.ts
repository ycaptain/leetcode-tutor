import { assign, createMachine } from "xstate";

export interface LeetCodeQuestion {
  questionId: string;
  questionFrontendId: string;
  title: string;
  /** Question url: https://leetcode.com/problems/${titleSlug}/ */
  titleSlug: string;
  isPaidOnly: boolean;
  difficulty: string;
  likes: number;
  dislikes: number;
  categoryTitle: string;
}

/** LeetCode Question */
export interface Question extends LeetCodeQuestion {
  /** reviews' timestamps */
  reviews: number[];
}

const defaultQuestion: Question = {
  questionId: "0",
  questionFrontendId: "0",
  title: "",
  titleSlug: "",
  isPaidOnly: false,
  difficulty: "Easy",
  likes: 0,
  dislikes: 0,
  categoryTitle: "Algorithms",
  reviews: [],
} as const;

/** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7ARgGzAWwDp9kAXATwGJYSBDVEgbQAYBdRFdWASxK-QDt2IAB6IAjEzEEAbGIBMcgCwBmAOxiAnBtUAOOaoA0IMojk7FBcwFYNTaeYlM5ygL4ujaLLkJcIuCiSoNFz8zGxIIMicPHyCEaIIijoaBEzJuqrSytJWTJJGJgg6VgRy0hpWykyZtopMimJuHhg4+ASBwfwhUAFBIWFCUdy8AkIJYtKqlnkainJWVnNlTMoFiMraBKoKYio6qjYKZU2RLd7tfV38PXg01GCoAxFDMaPx65MEVts69rN18nMawQyjEU1B+3Uc0UKiqqhOnlahA6IW6FFQcDAjFYg2iIzioASSRSaW0snMaQaE2BMOUpWkK12NgWOmUcgRZzat3uGIgvU6Tw4w1iY0QxNS6XJdQcYmBcgkBDEoLMVnlWRyrncpy8XLuJAekHRmOx4SFrwJIkQDJ0Mk0yjZqlm2hWwKqcgIymhKx0elUVV2bi1-HQEDgg05eFxwrehMQAFppBYNvYGRpzBp5RpZcZ4+6mJU1Dpqmy6p7vhydYRiOQo+bRQg4xMPRoU0w04oM5oxFZXdVSspzFl5Kr6hpNc1KwRfLha-j6366bk5Gl80X-TpgWJNKUVuUKmoJBJFBWkRdOt1ZyL3ghnNJUvo6nItPZdBVXU205Mn6oVisT+duX1XlLxjS1EiLGQrH2Iss30NRpFdJQtk9Z8zDSBYwUDFwgA */
export const problemMachine = createMachine(
  {
    initial: "empty",
    id: "problem",
    context: JSON.parse(JSON.stringify(defaultQuestion)),
    states: {
      empty: {
        on: {
          start: {
            target: "training",
            reenter: true,
            actions: assign(({ event }) => {
              const now = Date.now();
              return  {
                ...event.question,
                reviews: [now],
              } satisfies Question
            }),
          },
        },
      },
      idle: {
        on: {
          train: {
            target: "training",
            actions: assign({
              reviews: (ctx) => [...ctx.context.reviews, Date.now()]
            }),
          },
        },
      },
      training: {
        on: {
          train: {
            target: "training",
            actions: assign({
              reviews: (ctx) => [...ctx.context.reviews, Date.now()]
            }),
          },
          master: {
            target: "mastered",
          },
          reset: {
            target: "idle",
            actions: assign({
              reviews: () => []
            }),
          },
        },
      },
      mastered: {
        on: {
          train: {
            actions: assign({
              reviews: (ctx) => [...ctx.context.reviews, Date.now()]
            }),
          },
          reset: {
            target: "idle",
            actions: assign({
              reviews: () => []
            }),
          },
        },
      },
    },
    types: {
      events: {} as { type: "reset" } | { type: "start", question: LeetCodeQuestion } | { type: "train" } | { type: "master" },
      context: {} as Question,
    },
  }
);

export type ProblemMachineType = typeof problemMachine;
