const BASE_URL = 'https://80802807.ngrok.io'
const ytVideo = document.getElementsByClassName('video-stream')[0];
const ytUrlIdSeparator = 'v=';
const ytURL = window.location.href.split(ytUrlIdSeparator);
const ytID = ytURL[1];

// chrome.runtime.sendMessage(
//   {
//       contentScriptQuery: "postData"
//       , data: 'hi'
//       , url: BASE_URL
//   }, function (response) {
//       debugger;
//       if (response != undefined && response != "") {
//           callback(response);
//       }
//       else {
//           debugger;
//           callback(null);
//       }
//   });

fetch(`${BASE_URL}/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ video_id: ytID })
})
.then(response => response.json())
.then(data => console.log('data', data))

function checkVideo() {
  // setInterval(function() {
  //   if (Math.round(ytVideo.currentTime) % 10 === 0){
  //     ytVideo.currentTime = ytVideo.currentTime + 5;
  //   }
  // }, 100);
}

window.addEventListener("load", checkVideo, false);