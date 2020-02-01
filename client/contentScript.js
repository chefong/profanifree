const BASE_URL = 'http://127.0.0.1:5000'
const ytVideo = document.getElementsByClassName('video-stream')[0];
const ytUrlIdSeparator = 'v=';
const ytURL = window.location.href.split(ytUrlIdSeparator);
const ytID = ytURL[1];

let recList = [];
let recElem = [];





function fastForward(video, timestamps, currentTime) {
  if (timestamps.has(currentTime)) {
    video.currentTime = video.currentTime + timestamps.get(currentTime);
  }
}


function colorRec() {
  var x = document.getElementsByTagName("ytd-compact-video-renderer");
  recList = [];
  recElem = [];
  for (i = 0; i < x.length; i++) {
    recList.push(x[i].querySelector("a").href);
    recElem.push(x[i].querySelector("#video-title"))
  }
  fetch(`${BASE_URL}/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ links: recList })
  })  
    .then(response => response.json())
    .then(data => {
      const { Message: inputMessage, links: offendingRec } = data;
      console.log(offendingRec);
      for (i = 0; i < recList.length; i++) {
        for(j = 0; j < offendingRec.length; j++) {
          if(recList[i].includes(offendingRec[j].video_id) && offendingRec[j].curse_words) {
            recElem[i].style.color = "red";

          }
        }
      }
    })
  .catch(error => console.error('       ##########      ERROR', error));
}


function checkVideo() {

  fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ video_id: ytID })
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      const { curse_words: hasCurseWords, offending_lines: offendingLines } = data;
      if (hasCurseWords) {
        const timestamps = new Map();

        offendingLines.forEach(line => {
          const [phrase, timestamp, durationAmount] = line;
          timestamps.set(Math.round(timestamp), Math.round(durationAmount));
        });

        setInterval(function() {
          const roundedTime = Math.round(ytVideo.currentTime);
          if (timestamps.has(roundedTime)) {
            ytVideo.currentTime = ytVideo.currentTime + timestamps.get(roundedTime);
          }
        }, 100);
      }
    })
    .catch(error => console.error('       ###########      ERROR', error));
}



window.addEventListener("load", checkVideo, false);

setInterval(colorRec, 4000);
