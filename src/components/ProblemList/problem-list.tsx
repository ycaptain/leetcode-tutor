import * as React from 'react';
import { type Question } from '../../store/problem';
import { useMachine } from '@xstate/react';
import { problemsMachine } from '../../store/problems';
import { ProblemCard } from './problem-card';

export interface ProblemListProps {
  questions?: Question[];
}

// const question1: LeetCodeQuestion = {
//   questionId: '26',
//   questionFrontendId: '26',
//   title: 'Remove Duplicates from Sorted Array',
//   titleSlug: 'remove-duplicates-from-sorted-array',
//   isPaidOnly: false,
//   difficulty: 'Easy',
//   likes: 13301,
//   dislikes: 17570,
//   categoryTitle: 'Algorithms',
// } as const;

export function ProblemList(_props: ProblemListProps) {
  const item = localStorage.getItem('leetcode-guru-state');
  const [problemSnapshot, , problemsActor] = useMachine(
    problemsMachine,
    item
      ? {
          input: {
            problems: JSON.parse(item),
          },
        }
      : undefined,
  );

  console.log('problemSnapshot', problemSnapshot, problemsActor);

  React.useEffect(() => {
    problemsActor.subscribe((state) => {
      const problems = problemsActor.getSnapshot();
      localStorage.setItem(
        'leetcode-guru-state',
        JSON.stringify(
          problems.context.problems.map((p) => p.getPersistedSnapshot()),
        ),
      );
      console.log('machine', state);
    });
  }, []);

  // const handleCreate = () => {
  //   let newQuestionId = String(getRandomInt(1, 10000));
  //   const questionIds = problemsActor
  //     .getSnapshot()
  //     .context.problems.map((p) => p.getSnapshot().context.questionId);
  //   while (questionIds.includes(newQuestionId)) {
  //     newQuestionId = String(getRandomInt(1, 10000));
  //   }
  //   send({
  //     type: 'problem.create',
  //     question: {
  //       ...question1,
  //       questionId: newQuestionId,
  //       questionFrontendId: newQuestionId,
  //     },
  //   });
  // };

  return (
    <div className="space-y-2 m-[20px] flex flex-col">
      {problemSnapshot.context.problems.map((problemActor, idx) => (
        <ProblemCard key={idx} problemActor={problemActor} />
      ))}
    </div>
  );
}
/* <button onClick={handleCreate}>create</button> */

export function TestProblemList() {
  return <ProblemList />;
}
