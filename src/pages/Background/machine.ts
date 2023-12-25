import { createActor } from 'xstate';
import {
  type ProblemsMachineActor,
  problemsMachine,
} from '../../store/problems';
import {
  type LeetCodeQuestion,
  getProblemMachineId,
} from '../../store/problem';
import { ChromeStorage } from '../../store/chrome';

export let problemsActor: ProblemsMachineActor;

export async function startMachine() {
  const snap = await ChromeStorage.getProblems();
  // const snap: any[] = [];
  console.log('snap', snap);
  problemsActor = createActor(
    problemsMachine,
    snap.length
      ? {
          input: {
            problems: snap as any,
          },
        }
      : undefined,
  );

  problemsActor.subscribe((state) => {
    console.log('machine', state);
    ChromeStorage.saveProblems(problemsActor);
  });

  problemsActor.start();
  console.log('start machine');
}

export function submitQuestion(question: LeetCodeQuestion) {
  const { questionId } = question;
  const problems = problemsActor.getSnapshot().context.problems;
  const existProblem = problems.find(
    (p) => p.id === getProblemMachineId(questionId),
  );

  if (existProblem) {
    problemsActor.send({ type: 'problem.train', questionId });
    return;
  }

  problemsActor.send({ type: 'problem.create', question });
}
