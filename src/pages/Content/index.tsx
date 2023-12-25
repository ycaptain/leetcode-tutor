import React from 'react';
import { createRoot } from 'react-dom/client';
import { listen } from './listener';
import { Content } from './Content';

console.log('start content');

listen();

const container = document.createElement('div');
container.id = 'leetcode-guru-root';
document.body.appendChild(container);
const root = createRoot(container);
root.render(<Content />);
