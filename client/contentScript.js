const BASE_URL = 'http://localhost:5000';
const ytVideo = document.getElementsByClassName('video-stream')[0];
const ytUrlIdSeparator = 'v=';
const ytURL = window.location.href.split(ytUrlIdSeparator);
const ytID = ytURL[1];

let recTagElem;
let recList = [];
let recElem = [];
let recListSize = 0;
let unmuteTimer;
let videoTime;
let censorBeep = new Audio(chrome.runtime.getURL('censor-beep-4.mp3'));
censorBeep.volume = 0.25;

function updateColorRec() {
  recTagElem = document.getElementsByTagName("ytd-compact-video-renderer");
  if(recListSize != recTagElem.length) {
    recListSize = recTagElem.length;
    colorRec();
  }
}


function colorRec() {
  var x = recTagElem;
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
  console.log("hewwo owo");
  ytVideo.pause();
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

      chrome.storage.sync.set({numBadWords: offendingLines.length }, function() {
        console.log('Value is set to', offendingLines.length);
      });

      if (hasCurseWords) {
        const timestamps = new Map();

        offendingLines.forEach(line => {
          const [phrase, timestamp, durationAmount] = line;
          const roundedTimestamp = Math.round(timestamp) + 2;
          const roundedDurationAmount = durationAmount;
          timestamps.set(roundedTimestamp, roundedDurationAmount);
        });

        console.log(timestamps);
        ytVideo.play();
        videoTime = setInterval(function() {
          let roundedTime = Math.round(ytVideo.currentTime);
          console.log(roundedTime);
          if (timestamps.has(roundedTime)) {
            ytVideo.muted = true;
            censorBeep.play();
            unmuteTimer = setTimeout(function() {
              ytVideo.muted = false;
              censorBeep.pause();
              censorBeep.currentTime = 0;
            }, timestamps.get(roundedTime) * 1000);
          }
        }, 100);

        ytVideo.addEventListener('play', () => {
          videoTime = setInterval(function() {
            let roundedTime = Math.round(ytVideo.currentTime);
            console.log(roundedTime);
            if (timestamps.has(roundedTime)) {
              ytVideo.muted = true;
              censorBeep.play();
              unmuteTimer = setTimeout(function() {
                ytVideo.muted = false;
                censorBeep.pause();
                censorBeep.currentTime = 0;
              }, timestamps.get(roundedTime) * 1000);
            }
          }, 100);
        })
      }
    })
    .catch(error => { 
      ytVideo.play();
      console.error('###########      ERROR', error)
    });
}


setInterval(updateColorRec, 2000);
window.addEventListener("load", checkVideo, false);


ytVideo.addEventListener('pause', () => {
  console.log('pause EVENT LISTENER FROM VIDEO')
  clearTimeout(unmuteTimer);
  clearInterval(videoTime);
  console.log("hewwo")
});
