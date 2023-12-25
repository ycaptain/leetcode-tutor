import React, { useEffect, useState } from 'react';
import './index.css';
import Tabs, { TabPane } from '../../components/Tabs';
import { ProblemList } from '../../components/ProblemList/problem-list';
import { Setting, Earth, Calendar } from '@icon-park/react';
import GithubMark from '../../assets/img/github-mark.svg';
import { Swap } from '../../components/Swap';

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
  const [planOpen, setPlanOpen] = useState(false);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('msg receive from popup', request);

      sendResponse({
        asd: 'zxc',
      }); // this is how you send message to popup

      return true; // this make sure sendResponse will work asynchronously
    });
  });

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
                className="toggle toggle-success toggle-sm checked:[--tglbg:#34E1CA] bg-white"
                checked={planOpen}
                onChange={(e) => setPlanOpen(e.target.checked)}
              />
              <span className="ml-2 text-lg font-medium">My Plan</span>
              <span className="ml-3 text-[#9f9a9a]">Keep 5 days</span>
            </div>
            <Calendar className="cursor-pointer text-lg right-0" />
            <Swap
              renderOn={
                <svg
                  // className="swap-on fill-current w-10 h-10"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                </svg>
              }
              renderOff={
                <svg
                  // className="swap-off fill-current w-10 h-10"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
      <TestTabs />
    </div>
  );
}

export default Popup;
