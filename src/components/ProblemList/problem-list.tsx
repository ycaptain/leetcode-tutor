import * as React from 'react';
import { type LeetCodeQuestion, type Question } from '../../store/problem';
import { useMachine } from '@xstate/react';
import { problemsMachine } from '../../store/problems';

export interface ProblemListProps {
  questions?: Question[];
}

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

export function ProblemList(_props: ProblemListProps) {
  const item = localStorage.getItem('leetcode-guru-state');
  const [problemSnapshot, send, problemsActor] = useMachine(problemsMachine, {
    snapshot: item ? JSON.parse(item) : undefined,
  });

  console.log('problemSnapshot', problemSnapshot);

  React.useEffect(() => {
    problemsActor.subscribe((state) => {
      const problems = problemsActor.getSnapshot();
      localStorage.setItem('leetcode-guru-state', JSON.stringify(problems));
      console.log('machine', state);
    });
  }, []);

  const handleCreate = () => {
    send({
      type: 'problem.create',
      question: question1,
    });
  };

  return (
    <div>
      <button onClick={handleCreate}>create</button>
    </div>
  );
}

export function TestProblemList() {
  return <ProblemList />;
}
