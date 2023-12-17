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

/** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7ARgGzAWwDoBLCXAYlgBcBDVSgbQAYBdRFdWIyo9AOzZAAPRAEYALIwIA2AKwAOObJkyATOLFSANCACeiAMwiAnAQDs+mY0bKZso-v1SAvk+1osuQpVTUivP1Bk3r68TKxIIMgcXDz8EcIIKjL6BGIiKqYKUo4qciL62nqJYmIEcqpy+moVUmkubhg4+ATBfgFkeNRUYKhhAlGc3HwCCY4iBCJSU6ZSeUYiInIqhQYlBEYyRlK5sipJS-WRjZ4tPm28gahwYAws-dFDcaAJ4pKyWTZqJVq6iHulGkYGUmtjkpkYUlMh3cTUInW6VwgQTOoTuEQGMWG8UQYiW0kqMlMpgqliBK2KpgIFgy8zE+g0eWs0OOzXhlB6kDIV1gNz66IesRGBmyVLSIlMRkYDmsdPJeSpe0lYnB4MY9jELlcIF46AgcH6LLw90GguxCAAtD8iuaZOsjPaHY6HfpmR5miRcMbMU8hDjlr8ENKCJYZMZtqYMoYoVqYSdWv4Ll7HkLEqHg+DDOl0hlQ1bVrb0jMrBt9B8NTHDQQ2RyIEnTc8caZSkl9kYJYtypNyfTKeGpMXkh9NU4gA */
export const problemMachine = createMachine(
  {
    initial: "idle",
    id: "problem",
    context: JSON.parse(JSON.stringify(defaultQuestion)),
    states: {
      idle: {
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
