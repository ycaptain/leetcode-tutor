import {describe, test, expect } from '@jest/globals';
import { createActor } from 'xstate';
import { problemsMachine } from './problems';
import { LeetCodeQuestion, Question } from './problem';

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

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function removeReviews(question: LeetCodeQuestion) {
  const newQuestion = {...question};
  delete (newQuestion as any)['reviews'];
  return newQuestion;
}

describe('test machines', () => {
  const problemsActor = createActor(problemsMachine);
  problemsActor.start();
  let problemsState = problemsActor.getSnapshot();

  /**
   *
   * @param problemId start
   */
  function create() {
    let newQuestionId = String(getRandomInt(1, 10000));
    problemsState = problemsActor.getSnapshot();

    // create
    const questionIds = problemsState.context.problems.map(p => p.questionId);
    while (questionIds.includes(newQuestionId)) {
      newQuestionId = String(getRandomInt(1, 10000));
    }
    const newQuestion = {
      ...question1,
      questionId: newQuestionId,
      questionFrontendId: newQuestionId
    };

    // records past
    const newPast = problemsState.context.problems.length ? [...problemsState.context.past, [...problemsState.context.problems]] : [];
    const newProblems = [...problemsState.context.problems, newQuestion];

    problemsActor.send({ type: 'problem.create', question: newQuestion });

    problemsState = problemsActor.getSnapshot();
    const problemActor = problemsState.context.problemMachines[problemsState.context.problemMachines.length - 1];
    problemActor.start();
    const problemState = problemActor.getSnapshot();

    const { reviews, ...others} = problemState.context;

    expect(problemsState.context.furture).toEqual([]);
    expect(problemsState.context.past).toEqual(newPast);
    expect(problemsState.context.problems.map(removeReviews)).toEqual(newProblems.map(removeReviews));
    expect(others).toEqual(newQuestion);
  }

  function undo() {
    problemsState = problemsActor.getSnapshot();
    const newPast = problemsState.context.past.slice(0, problemsState.context.past.length - 1);
    const newProblems = problemsState.context.past[problemsState.context.past.length - 1];
    const nextFurture = [problemsState.context.problems, ...problemsState.context.furture];

    problemsActor.send({ type: 'undo' });
    problemsState = problemsActor.getSnapshot();
    expect(problemsState.context.past).toEqual(newPast);
    expect(problemsState.context.problems).toEqual(newProblems);
    expect(problemsState.context.furture).toEqual(nextFurture);
  }

  function redo() {
    problemsState = problemsActor.getSnapshot();
    const newPast = [...problemsState.context.past, problemsState.context.problems];
    const newProblems = problemsState.context.furture[0];
    const nextFurture = problemsState.context.furture.slice(1);

    problemsActor.send({ type: 'redo' });
    problemsState = problemsActor.getSnapshot();
    expect(problemsState.context.past).toEqual(newPast);
    expect(problemsState.context.problems).toEqual(newProblems);
    expect(problemsState.context.furture).toEqual(nextFurture);
  }

  function train() {
    problemsState = problemsActor.getSnapshot();

    const problemIdx = getRandomInt(0, problemsState.context.problems.length - 1);
    const problem = problemsState.context.problems[problemIdx];
    const problemActor = problemsState.context.problemMachines[problemIdx];
    const problemState = problemActor.getSnapshot();
    const newProblem = {
      ...problemState.context,
      reviews: problemState.context.reviews.concat(Date.now())
    };

    const newPast = [...problemsState.context.past, problemsState.context.problems];
    const newProblems = [...problemsState.context.problems.slice(0, problemIdx), newProblem, ...problemsState.context.problems.slice(problemIdx + 1)];
    const nextFurture: Question[] = [];

    problemsActor.send({ type: 'problem.train', questionId: problem.questionId });
    problemsState = problemsActor.getSnapshot();
    expect(problemsState.context.past).toEqual(newPast);
    expect(problemsState.context.problems.map(removeReviews)).toEqual(newProblems.map(removeReviews));
    const newProblemContext = problemsState.context.problems[problemIdx];
    expect(newProblemContext.reviews.slice(0, -1)).toEqual(newProblems[problemIdx].reviews.slice(0, -1));
    expect(newProblemContext.reviews[newProblemContext.reviews.length - 1] >= newProblems[problemIdx].reviews[newProblems[problemIdx].reviews.length - 1]).toEqual(true);
    expect(problemsState.context.furture).toEqual(nextFurture);
  }

  test('create a problem', () => {
    const problemsActor = createActor(problemsMachine);

    problemsActor.start();

    // start a new problem
    for (let i = 0; i < 100; i++) {
      create();
    }

    // undo creations
    for (let i = 0 ; i < 50; i++) {
      undo();
    }

    // redo creations
    for (let i = 0 ; i < 50; i++) {
      redo();
    }

    // train a random problem
    for (let i = 0; i < 1000; i++) {
      train();
    }
  });
});
