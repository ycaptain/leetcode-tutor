import * as React from 'react';
import { type ProblemMachineActor } from '../../store/problems';
import { Like, Delete } from '@icon-park/react';

export interface ProblemCardProps {
  problemActor: ProblemMachineActor;
}

export function ProblemCard(props: ProblemCardProps) {
  console.log('card', props.problemActor);
  const [state] = React.useState(props.problemActor.getSnapshot().context);

  console.log('state', state.questionId, state);
  return (
    <div className="bg-white rounded-lg p-4 shadow hover:shadow-lg cursor-pointer">
      <div className="flex flex-col justify-between">
        <div className="flex flex-row justify-between items-baseline">
          <label className="font-bold truncate mr-4">{`${state.questionId}. ${state.title}`}</label>
          <p className="text-[#7D8DA6] text-xs whitespace-nowrap">5 times</p>
        </div>
        <div className="flex flex-row justify-between mt-4">
          <div className="flex">
            <p className="text-[#FFCC56]">Medium</p>
          </div>
          <div className="flex items-center text-lg">
            <Like className="mr-2" />
            <Delete />
          </div>
        </div>
      </div>
    </div>
  );
}
