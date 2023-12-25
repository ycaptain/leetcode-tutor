import React, { useEffect, useState } from 'react';
import Tabs, { TabPane } from '../../components/Tabs';
import { ProblemList } from '../../components/ProblemList/problem-list';
import { Setting, Earth, Calendar } from '@icon-park/react';
import GithubMark from '../../assets/img/github-mark.svg';
import './index.css';
import { SidePanelRuntimeName } from '../../utils/consts';
import { type UIProblems } from '../../store/problem';
import { Messages, type MessageListener } from '../../utils/messages';

function ProblemTabs() {
  const [activeTab, setActiveTab] = React.useState('1');
  const [problems, setProblems] = useState<UIProblems[]>([]);

  useEffect(() => {
    chrome.runtime.connect({ name: SidePanelRuntimeName });

    // sync submitted question
    const listener: MessageListener = (request, _, sendResponse) => {
      if (request.type === 'transmit_problems') {
        sendResponse('ok');
        console.log('pass machine', request);
        setProblems(request.data.problems);
      }
    };
    chrome.runtime.onMessage.addListener(listener);

    // request problems
    Messages.requestProblems();
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  console.log('problems', problems);

  return (
    <Tabs activeTab={activeTab} onChange={setActiveTab}>
      <TabPane key="1" title="Recommend">
        <ProblemList problems={problems} />
      </TabPane>
      <TabPane key="2" title="Today">
        <ProblemList problems={problems} />
      </TabPane>
      <TabPane key="3" title="Reviewing">
        <ProblemList problems={problems} />
      </TabPane>
      <TabPane key="4" title="Mastered">
        <ProblemList problems={problems} />
      </TabPane>
    </Tabs>
  );
}

function Popup() {
  const [planOpen, setPlanOpen] = useState(false);
  return (
    <div
      data-theme="light"
      className="h-screen flex flex-col overflow-auto overscroll-none hide-scrollbar select-none text-[#3D3D3D]"
    >
      <div
        className="flex flex-col"
        style={{
          background:
            'linear-gradient(166deg, #D9FFF0 16%, #DEF5FF 43%, #FFFFFF 59%)',
        }}
      >
        <div className="mx-6 mt-8 mb-2">
          <div className="flex justify-between items-baseline">
            <h1 className="text-2xl font-bold">LeetCode Guru</h1>
            <span className="flex text-lg space-x-2 items-center">
              <img src={GithubMark} className="w-4 h-4 cursor-pointer" />
              <Earth className="cursor-pointer" />
              <Setting className="cursor-pointer hover:animate-spin" />
            </span>
          </div>
          <div
            className="bg-white rounded-lg flex items-center justify-between hover:shadow-lg py-6 px-4 my-4"
            style={{ boxShadow: '0px 4px 10px 0px #F6F8FC' }}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                className="toggle toggle-success toggle-md [--tglbg:gray] checked:[--tglbg:#34E1CA] bg-white"
                checked={planOpen}
                onChange={(e) => setPlanOpen(e.target.checked)}
              />
              <span className="ml-2 text-xl font-medium">My Plan</span>
              <span className="ml-3 text-[#9f9a9a]">Keep 5 days</span>
            </div>
            <Calendar className="cursor-pointer text-lg right-0" />
          </div>
        </div>
      </div>
      <ProblemTabs />
    </div>
  );
}

export default Popup;
