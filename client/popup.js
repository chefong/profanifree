const BASE_URL = 'http://2360b618.ngrok.io';

chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
  var url = tabs[0].url;
  const ytUrlIdSeparator = 'v=';
  const ytURL = url.split(ytUrlIdSeparator);
  const ytID = ytURL[1];

  fetch(`${BASE_URL}/numbadwords`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({video_id: ytID})
  })
    .then(response => response.json())
    .then(data => {
      console.log('Got response inside POPUP', data);
      const { num_bad_words: numBadWords } = data;
      document.getElementById('numBadWords').innerHTML = `${numBadWords}`
    })
    .catch(error => console.error ("ERROR INSIDE POPUP", error));
});