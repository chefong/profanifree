const BASE_URL = 'https://80802807.ngrok.io';
const ytVideo = document.getElementsByClassName('video-stream')[0];
const ytUrlIdSeparator = 'v=';
const ytURL = window.location.href.split(ytUrlIdSeparator);
const ytID = ytURL[1];
var censorBeep = new Audio(chrome.runtime.getURL('censor-beep-4.mp3'));
censorBeep.play();

ytVideo.addEventListener("pause", event => {
  console.log('paused audio', censorBeep.volume)
  event.preventDefault();
  if (!censorBeep.paused) {
    censorBeep.pause();
  }
}, false);

function muteVideo(video, timestamps, roundedTime) {
  censorBeep.play();
  censorBeep.volume = 0.2;

  setTimeout(function() {
    video.muted = false;
    censorBeep.volume = 0;
  }, timestamps.get(roundedTime) * 1000);
}

function cleanVideoSegment(video, timestamps) {
  const roundedTime = Math.round(video.currentTime);
  if (timestamps.has(roundedTime)) {
    // video.currentTime = video.currentTime + timestamps.get(roundedTime);
    muteVideo(video, timestamps, roundedTime);
  }
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
          const roundedTimestamp = Math.round(timestamp);
          const roundedDurationAmount = Math.round(durationAmount) + 1;
          timestamps.set(roundedTimestamp, roundedDurationAmount);
        });

        setInterval(cleanVideoSegment, 100, ytVideo, timestamps);
      }
    })
    .catch(error => console.error('###########      ERROR', error));
}

window.addEventListener("load", checkVideo, false);