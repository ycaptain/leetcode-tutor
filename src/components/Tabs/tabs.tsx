import * as React from 'react';
import { TabPane, type TabPaneProps, type TabPaneType } from './tab-pane';
import clsx from 'clsx';
export interface TabsProps {
  children: Array<React.ReactElement<TabPaneProps, TabPaneType>>;
  activeTab: string;
  /**
   * Callback when `activeTab` changed
   */
  onChange?: (key: string) => void;
}

const TabsIdPrefix = 'tabs-';

export function Tabs(props: TabsProps) {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-row overflow-auto overscroll-none hide-scrollbar">
        {props.children.map((child, index) => {
          const isActive = child.key === props.activeTab;
          return (
            <div
              key={index}
              className={clsx(
                'flex items-center h-fit',
                'hover:bg-[#F6F8FC] hover:text-[#323544] hover:font-bold hover:rounded-t-lg',
                {
                  'bg-[#F6F8FC] text-[#323544] font-bold rounded-t-lg':
                    isActive,
                  'text-[#C6CAD5]': !isActive,
                },
              )}
              onClick={() => {
                props.onChange?.(child.key!);
              }}
            >
              <label className="mx-6 my-3">{child.props.title}</label>
            </div>
          );
        })}
      </div>
      <div className="bg-[#F6F8FC] flex-1">
        {props.children.map((child, index) => {
          const isActive = child.key === props.activeTab;
          const tab = `${TabsIdPrefix}-tab-${index}`;
          return (
            <div
              key={child.key}
              className={clsx({ hidden: !isActive })}
              aria-hidden={isActive ? undefined : true}
              tabIndex={isActive ? 0 : -1}
              aria-labelledby={tab}
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TestTabs() {
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
