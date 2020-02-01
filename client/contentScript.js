const BASE_URL = 'https://80802807.ngrok.io'
const ytVideo = document.getElementsByClassName('video-stream')[0];
const ytUrlIdSeparator = 'v=';
const ytURL = window.location.href.split(ytUrlIdSeparator);
const ytID = ytURL[1];

function fastForward(video, timestamps, currentTime) {
  if (timestamps.has(currentTime)) {
    video.currentTime = video.currentTime + timestamps.get(currentTime);
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