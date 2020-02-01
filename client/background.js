chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.contentScriptQuery == "postData") {
    console.log(request.data);
      // fetch(request.url, {
      //     method: 'POST',
      //     headers: {
      //         'Accept': 'application/json',
      //         'Content-Type': 'application/json'
      //     },
      //     body: 'result=' + request.data
      // })
      //     .then(response => response.json())
      //     .then(response => sendResponse(response))
      //     .catch(error => console.log('Error:', error));
      return true;
  }
});