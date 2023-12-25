import { type UIProblems } from '../store/problem';

export type MessagesBody =
  | SubmitSolutionBody
  | TransmitProblemsBody
  | RequestProblemsBody;

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
  type: 'transmit_problems';
  data: {
    problems: UIProblems[];
  };
}

export interface RequestProblemsBody {
  from: MessageTarget;
  to: MessageTarget;
  type: 'request_problems';
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
  transmitProblems(problems: UIProblems[]) {
    chrome.runtime.sendMessage<TransmitProblemsBody, SubmitSolutionResp>(
      {
        from: 'background',
        to: 'popup',
        type: 'transmit_problems',
        data: {
          problems,
        },
      },
      (resp) => {
        console.log('resp', resp);
      },
    );
  },
  requestProblems() {
    chrome.runtime.sendMessage<RequestProblemsBody, SubmitSolutionResp>(
      {
        from: 'popup',
        to: 'background',
        type: 'request_problems',
      },
      (resp) => {
        console.log('resp', resp);
      },
    );
  },
};
