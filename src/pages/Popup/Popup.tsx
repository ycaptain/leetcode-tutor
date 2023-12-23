import React, { useEffect } from 'react';
import './index.css';
import Tabs, { TabPane } from '../../components/Tabs';
import { TestProblemList } from '../../components/ProblemList/problem-list';

function TestTabs() {
  const [activeTab, setActiveTab] = React.useState('1');
  console.log('ac', activeTab);
  return (
    <Tabs activeTab={activeTab} onChange={setActiveTab}>
      <TabPane key="1" title="Recommend">
        <p>12</p>
      </TabPane>
      <TabPane key="2" title="Today">
        <p>2</p>
      </TabPane>
      <TabPane key="3" title="Reviewing">
        <p>3</p>
      </TabPane>
      <TabPane key="4" title="Mastered">
        <p>4</p>
      </TabPane>
      <TabPane key="5" title="Tab4">
        <p>5</p>
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

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <TestTabs />
      <TestProblemList />
    </div>
  );
}

export default Popup;
