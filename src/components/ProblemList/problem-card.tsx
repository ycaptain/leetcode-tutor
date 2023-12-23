import * as React from 'react';
import { type ProblemMachineActor } from '../../store/problems';

export interface ProblemCardProps {
  problemActor: ProblemMachineActor;
}

export function ProblemCard(props: ProblemCardProps) {
  console.log('card', props.problemActor);
  const [state] = React.useState(props.problemActor.getSnapshot().context);

  console.log('state', state.questionId, state);
  return (
    <div>
      <label>{`${state.questionId}. ${state.title}`}</label>
    </div>
  );
}
