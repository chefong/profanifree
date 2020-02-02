chrome.webNavigation.onHistoryStateUpdated.addListener(e => {
  // send message to the tab that started watching
  chrome.tabs.sendMessage( e.tabId, {action: "watching"} );
}, {url: [{hostSuffix: "youtube.com", pathPrefix: "/watch"}]});