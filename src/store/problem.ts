import { assign, createMachine } from 'xstate';

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

export interface UIProblems extends Question {
  state: 'ready' | 'training' | 'mastered';
}

const defaultQuestion: Question = {
  questionId: '0',
  questionFrontendId: '0',
  title: '',
  titleSlug: '',
  isPaidOnly: false,
  difficulty: 'Easy',
  likes: 0,
  dislikes: 0,
  categoryTitle: 'Algorithms',
  reviews: [],
} as const;

export function getProblemMachineId(questionId: string) {
  return `problem-${questionId}`;
}

/** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7ARgGzAWwDp9kAXATwGJYSBDVEgbQAYBdRFdWASxK-QDt2IAB6IAjEzEEAbGIBMcgCwBmAOxiAnBtUAOOaoA0IMojk7FBcwFYNTaeYlM5ygL4ujaLLkKowNCJQkqDRc-MxsSCDInDx8gpGiCIo6GgRMKbqq0srSVkySRiYIOlYEctIaVspMWbaKTIpibh4YOPgEQSH8oVAUnaHhQtHcvAJCiWLSqpb5GopyVlbz5UzKhYjK2gSqCmIqOqo2CuXNUa3eHcGhPRR4NNRgqIORw7FjCRtTBFY7OvZz9Xk5nWCGUYmmYIO6nmihU1VUp08bUI-W6-F6vlgYEYrCGMVG8VAiWSqXS2lk5nSjUmINhyjK0lWexsix0yjkiPO7VRNwAxgALMC8gDWzw4Izi41M9QImnqFUmhwO4JBAFowQRtBpNgCUlYoa53GcvO07g9fBA+lcwriXvjJR8kik0hkKfUHGIQXIJLKwWYrN7srlDS0TYQzSRHpAKJjsWKovb3kTEIydDJNMp2ao5tpViDqnICMoYasdHpVNU9m4jfx0BA4EMuXg8RKkyJEKrpBZNvZGRpzBpvRpPcYO2JNEWnGC1HY9NVFJyw0Q8KQiuK3oT2whVZMixpe0x+4pB5oxFZ8zUyspzNl5AGGtrF8iCL5-GuE63N4kK-S8nJ0kw+qrJIOgguOqT-jkWhVOokgNE+Fw8uiLYblKCDONIaT6PUchaPYuiVPmu79lMuGqMBIbGs+EZRhAKEEmhyRMDI+q6Ie8gVlk+ZKNsxZ4WY6SLOC1YuEAA */
export const ProblemMachine = createMachine({
  initial: 'empty',
  id: 'problem',
  context: JSON.parse(JSON.stringify(defaultQuestion)),
  states: {
    empty: {
      on: {
        start: {
          target: 'training',
          reenter: true,
          actions: assign(({ event }) => ({
            ...event.question,
            reviews: [Date.now()],
          })),
        },
      },
    },
    ready: {
      on: {
        train: {
          target: 'training',
          actions: assign({
            reviews: () => [Date.now()],
          }),
        },
      },
    },

    training: {
      on: {
        train: {
          target: 'training',
          actions: assign({
            reviews: (ctx) => [...ctx.context.reviews, Date.now()],
          }),
        },
        master: {
          target: 'mastered',
        },
        reset: {
          target: 'ready',
          actions: assign({
            reviews: () => [],
          }),
        },
      },
    },
    mastered: {
      on: {
        train: {
          actions: assign({
            reviews: (ctx) => [...ctx.context.reviews, Date.now()],
          }),
        },
        reset: {
          target: 'ready',
          actions: assign({
            reviews: () => [],
          }),
        },
      },
    },
  },
  types: {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    events: {} as
      | { type: 'reset' }
      | { type: 'start'; question: LeetCodeQuestion }
      | { type: 'train' }
      | { type: 'master' },
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    context: {} as Question,
  },
} as const);

export type ProblemMachineType = typeof ProblemMachine;
