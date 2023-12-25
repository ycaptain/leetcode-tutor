import { type LeetCodeQuestion } from './problem';
import {
  type ProblemsMachineActor,
  type ProblemMachineSnapshot,
} from './problems';

function leetcodeQuestionKey(questionId: string) {
  return `lc-question-${questionId}`;
}

export const ChromeStorage = {
  async syncQuestion(question: LeetCodeQuestion) {
    await chrome.storage.local.set({
      [leetcodeQuestionKey(question.questionId)]: question,
    });
  },
  async getQuestion(questionId: string) {
    const key = leetcodeQuestionKey(questionId);
    const resp = await chrome.storage.local.get(key);
    return resp[key] as LeetCodeQuestion;
  },
  async saveProblems(problemsActor: ProblemsMachineActor) {
    const problems = problemsActor.getSnapshot();
    const data = problems.context.problems.map((p) => p.getPersistedSnapshot());
    await chrome.storage.local.set({
      'leetcode-guru-problems': data,
    });
  },
  async getProblems() {
    try {
      const resp = await chrome.storage.local.get('leetcode-guru-problems');
      const problems = resp[
        'leetcode-guru-problems'
      ] as ProblemMachineSnapshot[];
      return problems;
    } catch (e) {
      return [];
    }
  },
};
