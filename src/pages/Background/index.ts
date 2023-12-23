console.log('Background start!!!!!!!');
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// TODO: request listener not work
// chrome.webRequest.onAuthRequired.addListener(
//   (details) => {
//     console.log('An authorization request has been detected');
//     if (details.url === 'https://httpbin.org/basic-auth/guest/guest') {
//       // Creating some credentials
//       const username = 'guest1';
//       const password = 'guest2';
//       // Creating an auth handler to use the credentials
//       const authCredentials = {
//         authCredentials: {
//           username: username,
//           password: password
//         }
//       };
//       // callback(authCredentials);
//     }
//   },
//   { urls: ['https://httpbin.org/basic-auth/guest/guest'] },
//   ['asyncBlocking']
// );
