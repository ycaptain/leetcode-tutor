import * as React from 'react';
import { type UIProblems } from '../../store/problem';
import { ProblemCard } from './problem-card';

export interface ProblemListProps {
  problems: UIProblems[];
}

export function ProblemList({ problems }: ProblemListProps) {
  return (
    <div className="space-y-2 m-[20px] flex flex-col">
      {problems.map((problem, idx) => (
        <ProblemCard key={idx} problem={problem} />
      ))}
    </div>
  );
}
