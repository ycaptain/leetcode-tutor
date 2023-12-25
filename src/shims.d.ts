import { type ProblemsMachineActor } from './store/problems';
import { type MessageListener } from './utils/messages';

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

type qid = string;
type key = `lc-question-${qid}`;
// override chrome.runtime.onMessage.addListener
declare global {
  namespace chrome.runtime {
    interface ExtensionMessageEvent {
      // eslint-disable-next-line @typescript-eslint/method-signature-style
      addListener: (listener: MessageListener) => void;
    }
  }

  interface Window {
    problemsActor: ProblemsMachineActor;
  }
}
