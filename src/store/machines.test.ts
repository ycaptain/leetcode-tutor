import {describe, test, expect } from '@jest/globals';
import { createActor } from 'xstate';
import { problemsMachine } from './problems';
import { LeetCodeQuestion } from './problem';

const question1: LeetCodeQuestion = {
  questionId: "26",
  questionFrontendId: "26",
  title: "Remove Duplicates from Sorted Array",
  titleSlug: "remove-duplicates-from-sorted-array",
  isPaidOnly: false,
  difficulty: "Easy",
  likes: 13301,
  dislikes: 17570,
  categoryTitle: "Algorithms"
} as const;

describe('test machines', () => {
  test('create a problem', () => {
    const problemsActor = createActor(problemsMachine);

    problemsActor.start();

    problemsActor.send({ type: 'problem.start', question: question1 });
    let problemsState = problemsActor.getSnapshot();
    let machine = problemsState.context.problemMachines[0];
    machine.start();
    const problemState = machine.getSnapshot();

    const { reviews, ...others} = problemState.context;

    expect(problemsState.context.furture).toEqual([[]]);
    expect(problemsState.context.past).toEqual([[]]);
    expect(problemsState.context.problems[0]).toEqual(problemState.context);
    expect(others).toEqual(question1);
  });
});
