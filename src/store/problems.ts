import { ActorRefFrom, assign, createMachine } from "xstate";
import { type Question, type LeetCodeQuestion, problemMachine, ProblemMachineType } from './problem';

export const problemsMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QAUBOB7ARgGzAW1gGIBXAOwnQG0AGAXUVAAd1YBLAF1fVIZAA9EAFgCsAOgCMAdgDMADgBMk4QE5Jk8QDZ5wgDQgAnomnCNowdXnTFqjeOXVxAX0d60WXAUKpIVOr2ZsnNy8AggiEjIKSqrqWsKCeoYI8rYSiiqCshYyKs6uGDj4RIwFHqKw7ACGqOw09EggARxcPA2h8tSi1BrS4pnSktQDmZIaiYjy4uKi0hbUSrKCk7KykoJ5IG6FniXu+KLesGC1fg1NQa2goeKyopLa2moaz+bz4wia04KjwiYrmoJxCYNlsPMVSvs8JUKmBUHV-CxmsE2ohxPJ3lNphphOIhpJlJNqMpBAMQRCduTROxUJVWKR4WdERcQhNOlkOrJhDJsRlRu9UgpfjdlBpqPF1LINGS9hSZaIIGBcOwwAymEyWiyPoJRCYbjjBKK1sJemMDKj5M4XCBSOgFfAGqCigjAhqUQhpKYRWtBIIbBoVtJpO8RKYNGpulNfRofSlLY4gA */
    context: {
      past: [],
      furture: [],
      problems: [],
      problemMachines: [],
    },
    id: "Problems",
    on: {
      undo: {
        actions: assign(({context}) => {
          const prev = context.past[context.past.length - 1];
          const newPast = context.past.slice(0, context.past.length - 1);
          return {
            past: newPast,
            problems: prev,
            furture: [context.problems, ...context.furture]
          }
        })
      },
      redo: {
        actions: assign(({context}) => {
          const next = context.furture[0];
          const newFuture = context.furture.slice(1);
          return {
            past: [...context.past, context.problems],
            problems: next,
            furture: newFuture,
          }
        })
      },
      "problem.start": {
        actions: assign(({context, event, spawn}) => {
          const newProblemMachine = spawn(problemMachine, {
            id: `problem-${event.question.questionId}`,
          });
          newProblemMachine.start();

          newProblemMachine.send({type: 'start', question: event.question});

          const snapshot = newProblemMachine.getSnapshot();
          const newProblem = snapshot.context;

          const newPast = [...context.past, context.problems];
          const newProblems = [...context.problems, newProblem];
          const newFuture = [[]];
          const newProblemMachines = [...context.problemMachines, newProblemMachine];


          return {
            past: newPast,
            problems: newProblems,
            furture: newFuture,
            problemMachines: newProblemMachines,
          };
        })
      },
      "problem.reset": {},
      "problem.master": {},
      "problem.train": {},
      "problem.delete": {},
    },
    types: {
      events: {} as
        | { type: "undo" }
        | { type: "redo" }
        | { type: "problem.start", question: LeetCodeQuestion; }
        | { type: "problem.reset", questionId: string; }
        | { type: "problem.master" }
        | { type: "problem.train" }
        | { type: "problem.delete" },
      context: {} as { past: Question[][]; furture: Question[][]; problems: Question[], problemMachines: ActorRefFrom<ProblemMachineType>[] },
    },
  },
  {
    actions: {},
    actors: {},
    guards: {},
    delays: {},
  },
);

