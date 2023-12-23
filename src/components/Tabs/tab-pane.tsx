import type * as React from 'react';

export interface TabPaneProps {
  key: string;
  title: string;
  isActive?: boolean;
  children?: React.ReactNode;
}

export function TabPane(props: TabPaneProps) {
  return props.children;
}

export type TabPaneType = React.ForwardRefExoticComponent<
  React.PropsWithChildren<TabPaneProps>
>;
