import { ChromeStorage } from '../../store/chrome';
import { LCAPIs } from '../../utils/api';
import { Messages } from '../../utils/messages';
import { throttle } from '../../utils/request';

console.log('Content start!!!!!!!');

const refs = {
  submitButton: undefined as undefined | HTMLElement,
  _value: false,
  metaLeft: false,
  metaRight: false,
  enter: false,
};

async function sleep(time: number) {
  return await new Promise((resolve) => setTimeout(resolve, time));
}

async function queryLoop(selectors: string) {
  let query: Element | null = null;

  while (!query) {
    query = document.querySelector(selectors);
    if (!query) {
      await sleep(500);
    }
  }
  return query;
}
export async function listen() {
  return await Promise.allSettled([addClickListener(), addKeyboardListener()]);
}

function handleKeydown(e: KeyboardEvent) {
  const isSubmit = isSubmitByCmdEnter(e, 'keydown');
  console.log('check', isSubmit);
  if (isSubmit) {
    refs.metaLeft = false;
    refs.metaRight = false;
    refs.enter = false;
    handleSubmit();
  }
}

function handleKeyup(e: KeyboardEvent) {
  isSubmitByCmdEnter(e, 'keyup');
}

async function addKeyboardListener() {
  const keyarea = (await queryLoop(
    '[data-keybinding-context="1"]',
  )) as HTMLTextAreaElement;
  keyarea.addEventListener('keydown', handleKeydown);
  document.body.addEventListener('keydown', handleKeydown);

  keyarea.addEventListener('keyup', handleKeyup);
  document.body.addEventListener('keyup', handleKeyup);
}

async function addClickListener() {
  /** the button small than submit hit area, get its parent area */
  const submitSmallButton = (await queryLoop(
    '[data-e2e-locator=console-submit-button]',
  )) as HTMLButtonElement;

  refs.submitButton = submitSmallButton.parentElement!.parentElement!;

  refs.submitButton.addEventListener('click', () => {
    handleSubmit();
  });
}

function isSubmitByCmdEnter(e: KeyboardEvent, type: 'keydown' | 'keyup') {
  const syncStatus = type === 'keydown';
  switch (e.code) {
    case 'MetaLeft': {
      refs.metaLeft = syncStatus;
      break;
    }
    case 'MetaRight': {
      refs.metaRight = syncStatus;
      break;
    }
    case 'Enter':
      refs.enter = syncStatus;
      break;
  }

  const isMetaDown = refs.metaLeft || refs.metaRight;
  return isMetaDown && refs.enter;
}

async function _handleSubmit() {
  console.log('submit');
  // https://leetcode.com/problems/{title_slug}/*
  const pathname = location.pathname.split('/');
  if (pathname.length < 3 || pathname[1] !== 'problems') {
    console.log('Failed to get pathname:', pathname);
    return;
  }

  const titleSlug = pathname[2];
  const resp = await LCAPIs.getQuestionTitle({ titleSlug });
  await ChromeStorage.syncQuestion(resp.data.data.question);

  Messages.submitSolution({
    questionId: resp.data.data.question.questionId,
  });
}

const handleSubmit = throttle(_handleSubmit, 500);
