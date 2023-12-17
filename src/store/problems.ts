import { ActorRefFrom, assign, createMachine, stopChild } from "xstate";
import { type Question, type LeetCodeQuestion, problemMachine, ProblemMachineType } from './problem';

export const problemsMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QAUBOB7ARgGzAW1gGIBXAOwnQG0AGAXUVAAd1YBLAF1fVIZAA9EAFgCsAOgCMAdgDMADmkA2aQE5By4cNmyANCACeQ5ZIkAmJYPHDBCwbOomAvg91osuAoVSQqdXszac3LwCCCISMvJKquqakroGodTiorLC4gomihpSgopOLhg4+ESMhe6iAMZeAIbsYDT0SCD+HFw8TSHigqImgiaygoKSVuJm4soK8YjS1AqiwpIKkSazkoLUgvkgrkUepW74ol6w7NWo7A1+LK1BHYijKeJy1AMZUv2WUwgmwnPDT9RJL1ZMoTMMFFsdu4SmVDscwBdfE0WoF2qBOrJREDhGZhICZAtFNIvulkkMFBoRJJlNQFhlIbC9ozRHhqicwKhLsjrqjgvcTCTxMkKeJ7L8TKNBrIGQcmbLROxUNVWKQuUweW0+d9qCl7C8FDTpBY5NI4vpEApkrIfmoFHajdJxtLnNtGTD5RAwLg6mrmhrbuj7t1fuJUoopELRRoSY4tqR0J74E0ocUrgFNXcEIpRBM1r9LUkrDIvsIjKJ1kL+spol1Y04gA */
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
      "problem.create": {
        actions: assign(({context, event, spawn}) => {
          const newProblemMachine = spawn(problemMachine, {
            id: `problem-${event.question.questionId}`,
          });
          newProblemMachine.start();

          newProblemMachine.send({type: 'start', question: event.question});

          const snapshot = newProblemMachine.getSnapshot();
          const newProblem = snapshot.context;

          let newPast = [...context.past];
          if (context.problems.length) {
            newPast.push(context.problems);
          }
          const newProblems = [...context.problems, newProblem];
          const newFuture: Question[][] = [];
          const newProblemMachines = [...context.problemMachines, newProblemMachine];


          return {
            past: newPast,
            problems: newProblems,
            furture: newFuture,
            problemMachines: newProblemMachines,
          };
        })
      },
      "problem.restart": {

      },
      "problem.reset": {
        actions: assign(({context, event}) => {
          const machineIdx = context.problemMachines.findIndex(p => p.id === `problem-${event.questionId}`);

          const machine = context.problemMachines[machineIdx];
          context.problemMachines[machineIdx].send({type: 'reset'});

          const snapshot = machine.getSnapshot();
          const newProblem = snapshot.context;

          const newPast = [...context.past, context.problems];
          const newProblems = [...context.problems.slice(0, machineIdx), newProblem, ...context.problems.slice(machineIdx + 1)];
          const newFuture: Question[][] = [];

          return {
            past: newPast,
            problems: newProblems,
            furture: newFuture,
            problemMachines: context.problemMachines
          }
        }),
      },
      "problem.train": {
        actions: assign(({context, event}) => {
          const machineIdx = context.problemMachines.findIndex(p => p.id === `problem-${event.questionId}`);
          const machine = context.problemMachines[machineIdx];
          context.problemMachines[machineIdx].send({type: 'train'});

          const snapshot = machine.getSnapshot();
          const newProblem = snapshot.context;

          const newPast = [...context.past, context.problems];
          const newProblems = [...context.problems.slice(0, machineIdx), newProblem, ...context.problems.slice(machineIdx + 1)];
          const newFuture: Question[][] = [];

          return {
            past: newPast,
            problems: newProblems,
            furture: newFuture,
            problemMachines: context.problemMachines
          }
        }),
      },
      "problem.master": {
        actions: assign(({context, event}) => {
          const machineIdx = context.problemMachines.findIndex(p => p.id === `problem-${event.questionId}`);
          const machine = context.problemMachines[machineIdx];
          context.problemMachines[machineIdx].send({type: 'master'});

          const snapshot = machine.getSnapshot();
          const newProblem = snapshot.context;

          const newPast = [...context.past, context.problems];
          const newProblems = [...context.problems.slice(0, machineIdx), newProblem, ...context.problems.slice(machineIdx + 1)];
          const newFuture: Question[][] = [];

          return {
            past: newPast,
            problems: newProblems,
            furture: newFuture,
            problemMachines: context.problemMachines
          }
        }),
      },
      "problem.delete": {
        actions: [stopChild(({context, event}) => {
          const machineIdx = context.problemMachines.findIndex(p => p.id === `problem-${event.questionId}`);
          return context.problemMachines[machineIdx].id;
        }), assign(({context, event}) => {
          const machineIdx = context.problemMachines.findIndex(p => p.id === `problem-${event.questionId}`);

          const newPast = [...context.past, context.problems];
          const newProblems = [...context.problems.slice(0, machineIdx), ...context.problems.slice(machineIdx + 1)];
          context.problemMachines = [...context.problemMachines.slice(0, machineIdx), ...context.problemMachines.slice(machineIdx + 1)];
          const newFuture: Question[][] = [];

          return {
            past: newPast,
            problems: newProblems,
            furture: newFuture,
            problemMachines: context.problemMachines
          }
        })],
      },
    },
    types: {
      events: {} as
        | { type: "undo" }
        | { type: "redo" }
        | { type: "problem.create", question: LeetCodeQuestion; }
        | { type: "problem.restart", questionId: string; }
        | { type: "problem.reset", questionId: string; }
        | { type: "problem.master", questionId: string; }
        | { type: "problem.train", questionId: string; }
        | { type: "problem.delete", questionId: string; },
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

