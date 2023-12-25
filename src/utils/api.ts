import { type LeetCodeQuestion } from '../store/problem';
import { LCRequest } from './request';

export interface GetQuestionTitleResp {
  data: {
    question: LeetCodeQuestion;
  };
}

const getQuestionTitleDoc = `
  query questionTitle($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      questionFrontendId
      title
      titleSlug
      isPaidOnly
      difficulty
      likes
      dislikes
    }
  }
`;

export const LCAPIs = {
  async getQuestionTitle(variables: { titleSlug: string }) {
    return await LCRequest.post<GetQuestionTitleResp>('', {
      query: getQuestionTitleDoc,
      variables,
    });
  },
};
