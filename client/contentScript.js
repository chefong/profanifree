const BASE_URL = 'http://80802807.ngrok.io'
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

fetch(`${BASE_URL}/test`, {
  method: 'GET'
})
.then(response => response.json())
.then(response => console.log('Got response from backend', response))
.catch(error => console.error(error));

function checkVideo() {
  // setInterval(function() {
  //   if (Math.round(ytVideo.currentTime) % 10 === 0){
  //     ytVideo.currentTime = ytVideo.currentTime + 5;
  //   }
  // }, 100);
}

window.addEventListener("load", checkVideo, false);