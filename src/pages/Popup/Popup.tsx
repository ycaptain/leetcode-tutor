import React, { useEffect } from 'react';
import './index.css';
import Tabs, { TabPane } from '../../components/Tabs';
import { ProblemList } from '../../components/ProblemList/problem-list';
import { Setting, Earth, Calendar } from '@icon-park/react';
import GithubMark from '../../assets/img/github-mark.svg';

function TestTabs() {
  const [activeTab, setActiveTab] = React.useState('1');
  console.log('ac', activeTab);
  return (
    <Tabs activeTab={activeTab} onChange={setActiveTab}>
      <TabPane key="1" title="Recommend">
        <ProblemList />
      </TabPane>
      <TabPane key="2" title="Today">
        <ProblemList />
      </TabPane>
      <TabPane key="3" title="Reviewing">
        <ProblemList />
      </TabPane>
      <TabPane key="4" title="Mastered">
        <ProblemList />
      </TabPane>
    </Tabs>
  );
}

function Popup() {
  useEffect(() => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('msg receive from popup', request);

      sendResponse({
        asd: 'zxc',
      }); // this is how you send message to popup

      return true; // this make sure sendResponse will work asynchronously
    });
  });

  console.log('GithubMark', GithubMark);

  return (
    <div className="h-screen flex flex-col overflow-auto overscroll-none hide-scrollbar select-none">
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
              <Setting className="cursor-pointer" />
            </span>
          </div>
          <div
            className="bg-white rounded-lg flex items-center justify-between hover:shadow-lg py-6 px-4 my-4"
            style={{ boxShadow: '0px 4px 10px 0px #F6F8FC' }}
          >
            <div className="flex items-center">
              {/* https://flowbite.com/docs/forms/toggle/ */}
              <label className="relative inline-flex items-center cursor-pointer mr-2">
                <input type="checkbox" value="" className="sr-only peer" />
                <div className="w-8 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:white  rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[0px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#34E1CA]"></div>
              </label>
              <span className="text-lg font-medium">My Plan</span>
              <span className="ml-3 text-[#9f9a9a]">Keep 5 days</span>
            </div>
            <Calendar className="cursor-pointer text-lg right-0" />
          </div>
        </div>
      </div>
      <TestTabs />
    </div>
  );
}

export default Popup;
