import { ChromeStorage } from '../../store/chrome';
import { problemsActor, submitQuestion } from './machine';

import { SidePanelRuntimeName } from '../../utils/consts';
import { Messages } from '../../utils/messages';
import { type UIProblems } from '../../store/problem';

/** side panel open status */
export let isSidepanelOpen = false;

export function listen() {
  // listen to side panel open status
  chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === SidePanelRuntimeName) {
      isSidepanelOpen = true;
      console.log('Sidepanel opened.');
      port.onDisconnect.addListener(() => {
        console.log('Sidepanel closed.');
        isSidepanelOpen = false;
      });
    }
  });

  // sync submitted question
  chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request.type === 'sync_submit') {
      sendResponse('ok');

      (async () => {
        const question = await ChromeStorage.getQuestion(
          request.data.questionId,
        );
        submitQuestion(question);
        const problems: UIProblems[] = problemsActor
          .getSnapshot()
          .context.problems.map((p) => {
            const snap = p.getSnapshot();
            return {
              ...snap.context,
              state: snap.value as UIProblems['state'],
            };
          });
        Messages.transmitProblems(problems);
      })();
    } else if (request.type === 'request_problems') {
      sendResponse('ok');

      const problems: UIProblems[] = problemsActor
        .getSnapshot()
        .context.problems.map((p) => {
          const snap = p.getSnapshot();
          return {
            ...snap.context,
            state: snap.value as UIProblems['state'],
          };
        });
      Messages.transmitProblems(problems);
    }
  });
}
