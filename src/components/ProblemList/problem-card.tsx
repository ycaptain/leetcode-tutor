import * as React from 'react';
import { Like, Delete } from '@icon-park/react';
import { Swap } from '../Swap';
import { type UIProblems } from '../../store/problem';

export interface ProblemCardProps {
  problem: UIProblems;
}

export function ProblemCard(props: ProblemCardProps) {
  const { problem } = props;
  return (
    <div className="bg-white rounded-lg p-4 shadow hover:shadow-lg cursor-pointer">
      <div className="flex flex-col justify-between">
        <div className="flex flex-row justify-between items-baseline">
          <label className="font-bold truncate mr-4">{`${problem.questionId}. ${problem.title}`}</label>
          <p className="text-[#7D8DA6] text-xs whitespace-nowrap">
            {problem.reviews.length} times
          </p>
        </div>
        <div className="flex flex-row justify-between mt-4">
          <div className="flex">
            <p className="text-[#FFCC56]">Medium</p>
          </div>
          <div className="flex items-center text-lg">
            {/* <Like className="mr-2" /> */}
            <Swap
              className="mr-2"
              renderOn={<Like theme="filled" fill="#FF7070" />}
              renderOff={<Like />}
            />
            <Delete />
          </div>
        </div>
      </div>
    </div>
  );
}
