import { type UIProblems } from '../store/problem';

export type MessagesBody = SubmitSolutionBody | TransmitProblemsBody;

export type MessageResponse = SubmitSolutionResp;

export type MessageListener = (
  request: MessagesBody,
  sender: chrome.runtime.MessageSender,
  sendResponse: (v: MessageResponse) => void,
) => void;

interface SubmitSolutionBody {
  from: MessageTarget;
  to: MessageTarget;
  type: 'sync_submit';
  data: {
    questionId: string;
  };
}

export interface TransmitProblemsBody {
  from: MessageTarget;
  to: MessageTarget;
  type: 'pass_machine';
  data: {
    problems: UIProblems[];
  };
}

export type SubmitSolutionResp = 'ok';

/** content_script, popup page, background service */
type MessageTarget = 'content' | 'popup' | 'background';

export const Messages = {
  /** content script listen to sumbit action and send question to background */
  submitSolution(
    data: SubmitSolutionBody['data'],
    cb?: (r: SubmitSolutionResp) => void,
  ) {
    chrome.runtime.sendMessage<SubmitSolutionBody, SubmitSolutionResp>(
      {
        from: 'content',
        to: 'background',
        type: 'sync_submit',
        data,
      },
      (resp) => {
        console.log('resp', resp);
        cb?.(resp);
      },
    );
  },
};
