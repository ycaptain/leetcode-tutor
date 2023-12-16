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

/** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7ARgGzAWwDoBLCXAYlgBcBDVSgbQAYBdRFdWIyo9AOzZAAPRAEYALIwIA2AKwAOOWIDsKpYwBMATjEAaEAE9EAZhGaCSozMYyjmmWPUyRjMQF9XetFlyFKqakS8gVBkfgG8TKxIIMgcXDz80cIIjkYEYiLqSjLqUnLW6kZyeoYpYmIEcjmaplLqjEYOcurunhg4+ARhgcFkeNRUYKiRArGc3HwCyUZSIgQiUosy2YqMInLiJcblBHaashJWlmJyUq0x7T5d-j28IahwYAwso3ETiaDJ4pKyCsqqGm0WxS6gqYikGlOMlmRhmMnOXg6hH6gweEFCNwiL2iY3ikySiBO6mkcksmkYpyUizElmBoKUBEsWlq9Ua6iqCMunRRlCGkDID1gTxGOLeCSmxikaUaImcNTURSqwI2jPUzLqTk0+yM7g8IF46AgcFGXLwr3G4oJCAAtFJgdaZLstc6XS6dXrEVcSLhzXiPkJCepgbDJFYcrMxJp2Q5spzvJ1ukE7r73hKUk4CMsGuJNKcFowlMUDNtHZkqaD7IwXBk40iCDy+RAU5bPoSlBVHI4qUYlHZTJpg8ppFk6mJK9WRLrXEA */
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
