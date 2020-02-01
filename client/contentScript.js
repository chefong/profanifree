const BASE_URL = 'https://2360b618.ngrok.io';
const ytVideo = document.getElementsByClassName('video-stream')[0];
const ytUrlIdSeparator = 'v=';
const ytURL = window.location.href.split(ytUrlIdSeparator);
const ytID = ytURL[1];
let unmuteTimer;
let videoTime;
let censorBeep = new Audio(chrome.runtime.getURL('censor-beep-4.mp3'));
censorBeep.volume = 0.25;

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
          const roundedTimestamp = Math.round(timestamp) + 2;
          const roundedDurationAmount = Math.round(durationAmount) + 1;
          timestamps.set(roundedTimestamp, roundedDurationAmount);
        });

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
            }, 2000);
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
              }, 2000);
            }
          }, 100);
        })
      }
    })
    .catch(error => console.error('###########      ERROR', error));
}

window.addEventListener("load", checkVideo, false);

ytVideo.addEventListener('pause', () => {
  console.log('pause EVENT LISTENER FROM VIDEO')
  clearTimeout(unmuteTimer);
  clearInterval(videoTime);
  console.log("hewwo")
});