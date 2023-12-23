import { describe, test, expect } from '@jest/globals';
import { createActor } from 'xstate';
import { type LeetCodeQuestion, problemMachine } from '../problem';

const question1: LeetCodeQuestion = {
  questionId: '26',
  questionFrontendId: '26',
  title: 'Remove Duplicates from Sorted Array',
  titleSlug: 'remove-duplicates-from-sorted-array',
  isPaidOnly: false,
  difficulty: 'Easy',
  likes: 13301,
  dislikes: 17570,
  categoryTitle: 'Algorithms',
} as const;

describe('test problem machine', () => {
  const problemActor = createActor(problemMachine);
  problemActor.start();
  let past = Date.now();
  let now = Date.now();
  let problemState = problemActor.getSnapshot();
  let { reviews, ...others } = problemState.context;

  function start() {
    past = Date.now();
    problemActor.send({ type: 'start', question: question1 });
    problemState = problemActor.getSnapshot();
    now = Date.now();

    ({ reviews, ...others } = problemState.context);
    expect(others).toEqual(question1);
    expect(reviews.length).toEqual(1);
    expect(reviews[0] >= past).toBe(true);
    expect(reviews[0] <= now).toBe(true);
  }

  function reset() {
    problemActor.send({ type: 'reset' });
    problemState = problemActor.getSnapshot();
    ({ reviews, ...others } = problemState.context);
    expect(reviews.length).toEqual(0);
  }

  function train(times = 100) {
    const pastLength = reviews.length;
    for (let i = pastLength; i < pastLength + times; i++) {
      past = Date.now();
      problemActor.send({ type: 'train' });
      problemState = problemActor.getSnapshot();
      ({ reviews, ...others } = problemState.context);
      now = Date.now();

      expect(reviews.length).toEqual(i + 1);
      expect(reviews[i] >= past).toBe(true);
      expect(reviews[i] <= now).toBe(true);
    }

    let prevReview = reviews[0];
    const incresing = reviews.every((review) => {
      const isIncreasing = review >= prevReview;
      prevReview = review;
      return isIncreasing;
    });
    expect(incresing).toBe(true);
  }

  function master() {
    const prevLength = reviews.length;
    past = Date.now();
    problemActor.send({ type: 'master' });
    problemState = problemActor.getSnapshot();
    ({ reviews, ...others } = problemState.context);
    now = Date.now();

    expect(reviews.length).toEqual(prevLength);
  }

  test('go through a problem', () => {
    // start a problem
    start();
    for (let i = 0; i < 10; i++) {
      // reset a problem from training
      reset();

      // train a problem from idle
      train();

      // train a problem in training
      train();

      // master a problem from training
      master();

      // train a problem from masterd
      train();

      // reset a problem from mastered
      reset();
    }
  });
});
