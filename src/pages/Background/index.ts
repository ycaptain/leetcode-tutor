import { listen } from './listener';
import { startMachine } from './machine';
// open panel by clicking action
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

listen();
startMachine();
console.log('Background start!!!!!!!');
