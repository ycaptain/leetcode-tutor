import {
  type ActorRefFrom,
  assign,
  createMachine,
  stopChild,
  type Snapshot,
  createActor,
} from 'xstate';
import {
  type Question,
  type LeetCodeQuestion,
  ProblemMachine,
  type ProblemMachineType,
  getProblemMachineId,
} from './problem';

export type ProblemMachineSnapshot = Snapshot<unknown> & {
  context: Question;
};

export type ProblemMachineActor = ActorRefFrom<ProblemMachineType>;
export type ProblemsMachineActor = ActorRefFrom<ProblemsMachineType>;

/** get persistent snapshot of problem machine for problems machine context type */
export function problemMachineToPersistentSnapshot(
  problemMachine: ProblemMachineActor,
): ProblemMachineSnapshot {
  return problemMachine.getPersistedSnapshot() as ProblemMachineSnapshot;
}

export type ProblemsMachineType = typeof problemsMachine;
export const problemsMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QAUBOB7ARgGzAW1gGIBXAOwnQG0AGAXUVAAd1YBLAF1fVIZAA9EAFgCsAOgCMAdgDMADmkA2aQE5By4cNmyANCACeQ5ZIkAmJYPHDBCwbOomAvg91osuAoVSQqdXszac3LwCCCISMvJKquqakroGodTiorLC4gomihpSgopOLhg4+ESMhe6iAMZeAIbsYDT0SCD+HFw8TSHigqImgiaygoKSVuJm4soK8YjS1AqiwpIKkSazkoLUgvkgrkUepW74ol6w7NWo7A1+LK1BHYijKeJy1AMZUv2WUwgmwnPDT9RJL1ZMoTMMFFsdu4SmVDscwBdfE0WoF2qBOrJREDhGZhICZAtFNIvulkkMFBoRJJlNQFhlIbC9ozRHhqicwKhLsjrqjgvcTCTxMkKeJ7L8TKNBrIGQcmbLROxUNVWKQuUweW0+d9qCl7C8FDTpBY5NI4vpEApkrIfmoFHajdJxtLnNtGTD5RAwLg6mrmhrbuj7t1fuJUoopELRRoSY4tqR0J74E0ocUrgFNXcEIpRBM1r9LUkrDIvsIjKJ1kL+spol1Y04gA */
    context: ({ input }) => {
      return {
        past: [],
        furture: [],
        problems: input
          ? input.problems.map((p) =>
              createActor(ProblemMachine, {
                snapshot: p,
                id: getProblemMachineId(p.context.questionId),
              }),
            )
          : [],
      };
    },
    id: 'Problems',
    on: {
      undo: {
        actions: assign(({ context, spawn }) => {
          const newPast = context.past.slice(0, context.past.length - 1);
          const newProblemMachines: ProblemMachineActor[] = context.past[
            context.past.length - 1
          ].map((p, idx) => {
            const machineProblem =
              context.problems[idx]?.getSnapshot()?.context;
            if (p.context.questionId === machineProblem?.questionId) {
              return context.problems[idx];
            }

            const newProblemMachine = spawn(ProblemMachine, {
              id: getProblemMachineId(p.context.questionId),
            });
            newProblemMachine.start();

            newProblemMachine.send({ type: 'start', question: p.context });
            return newProblemMachine;
          });

          return {
            past: newPast,
            furture: [
              context.problems.map(problemMachineToPersistentSnapshot),
              ...context.furture,
            ],
            problems: newProblemMachines,
          };
        }),
      },
      redo: {
        actions: assign(({ context, spawn }) => {
          const newProblems = context.furture[0];
          const newFuture = context.furture.slice(1);
          const newProblemMachines: ProblemMachineActor[] = newProblems.map(
            (p, idx) => {
              const machineProblem =
                context.problems[idx]?.getSnapshot()?.context;
              if (p.context.questionId === machineProblem?.questionId) {
                return context.problems[idx];
              }

              const newProblemMachine = spawn(ProblemMachine, {
                id: getProblemMachineId(p.context.questionId),
              });
              newProblemMachine.start();

              newProblemMachine.send({ type: 'start', question: p.context });
              return newProblemMachine;
            },
          );
          return {
            past: [
              ...context.past,
              context.problems.map(problemMachineToPersistentSnapshot),
            ],
            furture: newFuture,
            problems: newProblemMachines,
          };
        }),
      },
      'problem.create': {
        actions: assign(({ context, event, spawn }) => {
          const newProblemMachine = spawn(ProblemMachine, {
            id: getProblemMachineId(event.question.questionId),
          });
          newProblemMachine.start();
          newProblemMachine.send({ type: 'start', question: event.question });

          const newPast = context.past;
          newPast.push(
            context.problems.map(problemMachineToPersistentSnapshot),
          );
          const newFuture: ProblemMachineSnapshot[][] = [];
          const newProblemMachines = [...context.problems, newProblemMachine];

          return {
            past: newPast,
            furture: newFuture,
            problems: newProblemMachines,
          };
        }),
      },
      'problem.restart': {
        actions: assign(({ context, event }) => {
          const machineIdx = context.problems.findIndex(
            (p) => p.id === getProblemMachineId(event.questionId),
          );
          const machine = context.problems[machineIdx];
          context.problems[machineIdx].send({ type: 'train' });

          const newPast = [
            ...context.past,
            context.problems.map(problemMachineToPersistentSnapshot),
          ];
          const newProblemMachines = [
            ...context.problems.slice(0, machineIdx),
            machine,
            ...context.problems.slice(machineIdx + 1),
          ];
          const newFuture: ProblemMachineSnapshot[][] = [];

          return {
            past: newPast,
            furture: newFuture,
            problems: newProblemMachines,
          };
        }),
      },
      'problem.reset': {
        actions: assign(({ context, event }) => {
          const machineIdx = context.problems.findIndex(
            (p) => p.id === getProblemMachineId(event.questionId),
          );

          const machine = context.problems[machineIdx];
          machine.send({ type: 'reset' });

          const newPast = [
            ...context.past,
            context.problems.map(problemMachineToPersistentSnapshot),
          ];
          const newProblemMachines = [
            ...context.problems.slice(0, machineIdx),
            machine,
            ...context.problems.slice(machineIdx + 1),
          ];
          const newFuture: ProblemMachineSnapshot[][] = [];

          return {
            past: newPast,
            furture: newFuture,
            problems: newProblemMachines,
          };
        }),
      },
      'problem.train': {
        actions: assign(({ context, event }) => {
          const machineIdx = context.problems.findIndex(
            (p) => p.id === getProblemMachineId(event.questionId),
          );
          context.problems[machineIdx].send({ type: 'train' });

          const newPast = [
            ...context.past,
            context.problems.map(problemMachineToPersistentSnapshot),
          ];
          const newFuture: ProblemMachineSnapshot[][] = [];

          return {
            past: newPast,
            furture: newFuture,
            problems: context.problems,
          };
        }),
      },
      'problem.master': {
        actions: assign(({ context, event }) => {
          const machineIdx = context.problems.findIndex(
            (p) => p.id === getProblemMachineId(event.questionId),
          );
          context.problems[machineIdx].send({ type: 'master' });
          const newPast = [
            ...context.past,
            context.problems.map(problemMachineToPersistentSnapshot),
          ];
          const newFuture: ProblemMachineSnapshot[][] = [];

          return {
            past: newPast,
            furture: newFuture,
            problems: context.problems,
          };
        }),
      },
      'problem.delete': {
        actions: [
          stopChild(({ context, event }) => {
            const machineIdx = context.problems.findIndex(
              (p) => p.id === getProblemMachineId(event.questionId),
            );
            return context.problems[machineIdx].id;
          }),
          assign(({ context, event }) => {
            const machineIdx = context.problems.findIndex(
              (p) => p.id === getProblemMachineId(event.questionId),
            );

            const newPast = [
              ...context.past,
              context.problems.map(problemMachineToPersistentSnapshot),
            ];
            const newProblemMachines = [
              ...context.problems.slice(0, machineIdx),
              ...context.problems.slice(machineIdx + 1),
            ];
            const newFuture: ProblemMachineSnapshot[][] = [];

            return {
              past: newPast,
              furture: newFuture,
              problems: newProblemMachines,
            };
          }),
        ],
      },
    },
    types: {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      events: {} as
        | { type: 'undo' }
        | { type: 'redo' }
        | { type: 'problem.create'; question: LeetCodeQuestion }
        | { type: 'problem.restart'; questionId: string }
        | { type: 'problem.reset'; questionId: string }
        | { type: 'problem.master'; questionId: string }
        | { type: 'problem.train'; questionId: string }
        | { type: 'problem.delete'; questionId: string },
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      context: {} as {
        past: ProblemMachineSnapshot[][];
        furture: ProblemMachineSnapshot[][];
        problems: ProblemMachineActor[];
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      input: {} as {
        problems: ProblemMachineSnapshot[];
      },
    },
  },
  {
    actions: {},
    actors: {},
    guards: {},
    delays: {},
  },
);
