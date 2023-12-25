import { describe, test, expect } from '@jest/globals';
import { createActor } from 'xstate';
import {
  type ProblemMachineSnapshot,
  problemsMachine,
  problemMachineToPersistentSnapshot,
} from '../problems';
import {
  ProblemMachine,
  type LeetCodeQuestion,
  type Question,
} from '../problem';
import { getRandomInt } from '../../utils/random';

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

function removeReviews(question: Question) {
  const newQuestion = { ...question };
  delete (newQuestion as any).reviews;
  return newQuestion;
}

describe('test machines', () => {
  const problemsActor = createActor(problemsMachine);
  problemsActor.start();
  let problemsSnapshot = problemsActor.getSnapshot();

  // problemsActor.subscribe(snapshot => {
  //   console.log('sub', snapshot.context.problems.length);
  // })

  /**
   *
   * @param problemId start
   */
  function create() {
    let newQuestionId = String(getRandomInt(1, 10000));
    problemsSnapshot = problemsActor.getSnapshot();

    // create
    const questionIds = problemsSnapshot.context.problems.map(
      (p) => p.getSnapshot().context.questionId,
    );
    while (questionIds.includes(newQuestionId)) {
      newQuestionId = String(getRandomInt(1, 10000));
    }
    const newQuestion = {
      ...question1,
      questionId: newQuestionId,
      questionFrontendId: newQuestionId,
    };

    // records past
    const newPast = problemsSnapshot.context.problems.length
      ? [
          ...problemsSnapshot.context.past,
          [
            ...problemsSnapshot.context.problems.map((p) =>
              p.getPersistedSnapshot(),
            ),
          ],
        ]
      : [[]];
    const oldProblemMachines = [...problemsSnapshot.context.problems];

    problemsActor.send({ type: 'problem.create', question: newQuestion });

    problemsSnapshot = problemsActor.getSnapshot();

    const newProblemMachines = [
      ...oldProblemMachines,
      problemsSnapshot.context.problems[
        problemsSnapshot.context.problems.length - 1
      ],
    ];
    const problemActor =
      problemsSnapshot.context.problems[
        problemsSnapshot.context.problems.length - 1
      ];
    problemActor.start();
    const problemState = problemActor.getSnapshot();

    const { reviews, ...others } = problemState.context;

    expect(problemsSnapshot.context.furture).toEqual([]);
    expect(problemsSnapshot.context.past).toEqual(newPast);
    expect(
      problemsActor
        .getSnapshot()
        .context.problems.map((p) => removeReviews(p.getSnapshot().context)),
    ).toEqual(
      newProblemMachines.map((p) => removeReviews(p.getSnapshot().context)),
    );
    expect(others).toEqual(newQuestion);
  }

  function undo() {
    problemsSnapshot = problemsActor.getSnapshot();
    const newPast = problemsSnapshot.context.past.slice(
      0,
      problemsSnapshot.context.past.length - 1,
    );
    const newProblemMachines = problemsSnapshot.context.past[
      problemsSnapshot.context.past.length - 1
    ].map((p) => createActor(ProblemMachine, { snapshot: p }).start());
    const nextFurture = [
      problemsSnapshot.context.problems.map(problemMachineToPersistentSnapshot),
      ...problemsSnapshot.context.furture,
    ];

    problemsActor.send({ type: 'undo' });
    problemsSnapshot = problemsActor.getSnapshot();
    expect(problemsSnapshot.context.past).toEqual(newPast);
    expect(
      problemsActor
        .getSnapshot()
        .context.problems.map((p) => removeReviews(p.getSnapshot().context)),
    ).toEqual(
      newProblemMachines.map((p) => removeReviews(p.getSnapshot().context)),
    );
    expect(problemsSnapshot.context.furture).toEqual(nextFurture);
  }

  function redo() {
    problemsSnapshot = problemsActor.getSnapshot();
    const newPast = [
      ...problemsSnapshot.context.past,
      problemsSnapshot.context.problems.map(problemMachineToPersistentSnapshot),
    ];
    const newProblemMachines = problemsSnapshot.context.furture[0].map((p) =>
      createActor(ProblemMachine, { snapshot: p }),
    );
    const nextFurture = problemsSnapshot.context.furture.slice(1);

    problemsActor.send({ type: 'redo' });
    problemsSnapshot = problemsActor.getSnapshot();
    expect(problemsSnapshot.context.past).toEqual(newPast);
    expect(
      problemsActor
        .getSnapshot()
        .context.problems.map((p) => removeReviews(p.getSnapshot().context)),
    ).toEqual(
      newProblemMachines.map((p) => removeReviews(p.getSnapshot().context)),
    );
    expect(problemsSnapshot.context.furture).toEqual(nextFurture);
  }

  function train(problemIdx = getRandomQuestionIdx()) {
    problemsSnapshot = problemsActor.getSnapshot();

    const problemActor = problemsSnapshot.context.problems[problemIdx];
    const problemSnapshot = problemActor.getSnapshot();
    const oldProblemSnapcontext = problemSnapshot.context;

    const newPast = [
      ...problemsSnapshot.context.past,
      problemsSnapshot.context.problems.map(problemMachineToPersistentSnapshot),
    ];
    const nextFurture: ProblemMachineSnapshot[][] = [];

    problemsActor.send({
      type: 'problem.train',
      questionId: problemSnapshot.context.questionId,
    });
    problemsSnapshot = problemsActor.getSnapshot();
    expect(
      problemsSnapshot.context.past.map((p) =>
        p.map((pp) => removeReviews(pp.context)),
      ),
    ).toEqual(newPast.map((p) => p.map((pp) => removeReviews(pp.context))));

    const newProblemContext =
      problemsSnapshot.context.problems[problemIdx].getSnapshot().context;
    expect(newProblemContext.reviews.slice(0, -1)).toEqual(
      oldProblemSnapcontext.reviews,
    );
    expect(problemsSnapshot.context.furture).toEqual(nextFurture);
  }

  function master(problemIdx = getRandomQuestionIdx()) {
    problemsSnapshot = problemsActor.getSnapshot();

    const problemContext =
      problemsSnapshot.context.problems[problemIdx].getSnapshot().context;

    const newPast = [
      ...problemsSnapshot.context.past,
      problemsSnapshot.context.problems.map((p) => p.getSnapshot()),
    ];
    const oldProblemsContext = problemsSnapshot.context.problems.map(
      (p) => p.getSnapshot().context,
    );
    const nextFurture: ProblemMachineSnapshot[][] = [];

    problemsActor.send({
      type: 'problem.master',
      questionId: problemContext.questionId,
    });
    const newProblemsContext = problemsSnapshot.context.problems.map(
      (p) => p.getSnapshot().context,
    );
    problemsSnapshot = problemsActor.getSnapshot();

    expect(
      problemsSnapshot.context.past.map((p) => p.map((pp) => pp.context)),
    ).toEqual(newPast.map((p) => p.map((pp) => pp.context)));
    expect(problemsSnapshot.context.furture).toEqual(nextFurture);
    expect(oldProblemsContext.map(removeReviews)).toEqual(
      newProblemsContext.map(removeReviews),
    );
  }

  function deleteProblem(problemIdx = getRandomQuestionIdx()) {
    problemsSnapshot = problemsActor.getSnapshot();

    const problemActor = problemsSnapshot.context.problems[problemIdx];
    const problemContext = problemActor.getSnapshot().context;

    const newPast = [
      ...problemsSnapshot.context.past,
      problemsSnapshot.context.problems.map(problemMachineToPersistentSnapshot),
    ];
    const newProblemMachines = [
      ...problemsSnapshot.context.problems.slice(0, problemIdx),
      ...problemsSnapshot.context.problems.slice(problemIdx + 1),
    ];
    const nextFurture: ProblemMachineSnapshot[][] = [];

    problemsActor.send({
      type: 'problem.delete',
      questionId: problemContext.questionId,
    });
    problemsSnapshot = problemsActor.getSnapshot();
    expect(problemsSnapshot.context.past).toEqual(newPast);
    expect(problemsSnapshot.context.problems).toEqual(newProblemMachines);
    expect(problemsSnapshot.context.furture).toEqual(nextFurture);
    expect(problemActor.getSnapshot().status === 'stopped').toBe(true);
  }

  function getRandomQuestionIdx(size?: number) {
    if (!size) {
      problemsSnapshot = problemsActor.getSnapshot();
      size = problemsSnapshot.context.problems.length;
    }

    const problemIdx = getRandomInt(0, size - 1);
    return problemIdx;
  }

  function reset(problemIdx = getRandomQuestionIdx()) {
    const problemMachine = problemsSnapshot.context.problems[problemIdx];

    const newPast = [
      ...problemsSnapshot.context.past,
      problemsSnapshot.context.problems.map(problemMachineToPersistentSnapshot),
    ];
    const newProblems = [
      ...problemsSnapshot.context.problems.slice(0, problemIdx),
      problemMachine,
      ...problemsSnapshot.context.problems.slice(problemIdx + 1),
    ];
    const nextFurture: ProblemMachineSnapshot[][] = [];

    problemsActor.send({
      type: 'problem.reset',
      questionId: problemMachine.getSnapshot().context.questionId,
    });
    problemsSnapshot = problemsActor.getSnapshot();
    expect(
      problemsSnapshot.context.past.map((p) =>
        p.map((pp) => removeReviews(pp.context)),
      ),
    ).toEqual(newPast.map((p) => p.map((pp) => removeReviews(pp.context))));
    expect(problemsSnapshot.context.problems).toEqual(newProblems);
    expect(problemsSnapshot.context.furture).toEqual(nextFurture);
  }

  test('create a problem', () => {
    // start a new problem
    for (let i = 0; i < 50; i++) {
      create();
    }

    // undo creations
    for (let i = 0; i < 50; i++) {
      undo();
    }

    // redo creations
    for (let i = 0; i < 50; i++) {
      redo();
    }

    // train a random problem
    for (let i = 0; i < 100; i++) {
      train();
    }

    // train same
    const problemIdx = getRandomQuestionIdx();
    const reviews = problemsActor
      .getSnapshot()
      .context.problems[problemIdx].getSnapshot().context.reviews;
    train(problemIdx);
    train(problemIdx);
    train(problemIdx);
    train(problemIdx);
    train(problemIdx);
    expect(
      problemsActor.getSnapshot().context.problems[problemIdx].getSnapshot()
        .context.reviews.length,
    ).toEqual(reviews.length + 5);

    // master a random problem
    for (let i = 0; i < 20; i++) {
      master();
    }

    // delete a random problem
    for (let i = 0; i < 20; i++) {
      deleteProblem();
    }

    // undo creations
    for (let i = 0; i < 100; i++) {
      undo();
    }

    // redo creations
    for (let i = 0; i < 100; i++) {
      redo();
    }

    // complex
    problemsSnapshot = problemsActor.getSnapshot();
    const size = problemsSnapshot.context.problems.length;
    const randomIdxs = Array.from(
      new Set(
        Array(50)
          .fill(0)
          .map(() => getRandomQuestionIdx(size)),
      ),
    );

    randomIdxs.forEach((idx) => {
      problemsSnapshot = problemsActor.getSnapshot();
      const prev = { ...problemsSnapshot.context };
      reset(idx);
      // restart
      train(idx);
      master(idx);
      deleteProblem(idx);

      // undo four operations
      undo();
      undo();
      undo();
      undo();
      problemsSnapshot = problemsActor.getSnapshot();
      const next = { ...problemsSnapshot.context };
      expect(prev.past).toEqual(next.past);
      expect(prev.problems.map((v) => v.toJSON?.())).toEqual(
        next.problems.map((v) => v.toJSON?.()),
      );
      expect(next.furture.length).toEqual(4);
      // recover furture
      redo();
      redo();
      redo();
    });
  });
});
