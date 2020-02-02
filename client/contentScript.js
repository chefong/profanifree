const BASE_URL = 'http://127.0.0.1:5000';
// const ytVideo = document.getElementsByClassName('video-stream')[0];
// const ytUrlIdSeparator = 'v=';
// const ytURL = window.location.href.split(ytUrlIdSeparator);
// const ytID = ytURL[1];
var count = 0;

let recTagElem = document.getElementsByTagName("ytd-compact-video-renderer");
let recList = [];
let recElem = [];
let prevRecListSize = 0;
let unmuteTimer;
let videoTime;
let translatedTitle = false;
let censorBeep = new Audio(chrome.runtime.getURL('censor-beep-10.wav'));
censorBeep.volume = 0.1;

chrome.runtime.onMessage.addListener(data => {
  if (data.action === "watching") {
    const ytVideo = document.getElementsByClassName('video-stream')[0];
    const ytUrlIdSeparator = 'v=';
    const ytURL = window.location.href.split(ytUrlIdSeparator);
    const ytID = ytURL[1];
    checkVideo(ytVideo, ytID);
  }
});



function translateTitle() {

  if(!translatedTitle) {
    let vidTitle = document.querySelector("h1");
    let initTitle = document.querySelector("h1").innerText;

    fetch(`${BASE_URL}/title`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Title: initTitle })
      })
        .then(response => response.json())
        .then(data => {
          const { Title: title } = data;
          vidTitle.innerText = title;
          if(title.includes("****")) {
            vidTitle.style.color = "red";
          }

        })
      .catch(error => console.error('       ##########      ERROR', error));
  } else {
    clearInterval(titleInterval);
  }
}

let titleInterval = setInterval(translateTitle, 100);

function colorRec() {
  for (i = prevRecListSize; i < recTagElem.length; i++) {
    recList.push(recTagElem[i].querySelector("a").href);
    recElem.push(recTagElem[i].querySelector("#video-title"))
  }
  prevRecListSize = recTagElem.length;
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
      //console.log(offendingRec);
      for(i = 0; i < offendingRec.length; i++) {
        if(offendingRec[i].curse_words) {
          recElem[i].style.color = "red";
        }
      }
    })
  .catch(error => console.error('       ##########      ERROR', error));
}

function updateColorRec() {
  recTagElem = document.getElementsByTagName("ytd-compact-video-renderer");
  if(recTagElem.length > 3) {
    if(prevRecListSize != recTagElem.length) {
      colorRec();
    }
  }
}


function commentParser() {
  var temp = document.getElementsByTagName("ytd-comment-thread-renderer");
  list = []
  console.log(temp.length)
  for (i = 0; i < temp.length; ++i) {
    list.push(temp[i].getElementsByTagName("ytd-expander")[0].querySelector("div").getElementsByTagName("yt-formatted-string")[1].innerText);
  }

  fetch(`${BASE_URL}/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ comments: list })
  })
  .then(response => response.json())
  .then(data => {
    for (i = 0; i < temp.length; ++i) {
      if (data['Data'][i] && data['Data'][i].includes("*") == true){
        temp[i].getElementsByTagName("ytd-expander")[0].querySelector("#content-text").style.color = "red";
      }
      list.push(temp[i].getElementsByTagName("ytd-expander")[0].querySelector("div").getElementsByTagName("yt-formatted-string")[1].innerText = data['Data'][i]);
    }
  })
}

function checkVideo(ytVideo, ytID) {
  ytVideo.pause();

  ytVideo.addEventListener('pause', () => {
    console.log('pause EVENT LISTENER FROM VIDEO')
    clearTimeout(unmuteTimer);
    clearInterval(videoTime);
  });

  fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ video_id: ytID })
  })
    .then(response => response.json())
    .then(data => {
      console.log('Data', data);
      const { curse_words: hasCurseWords, offending_lines: offendingLines } = data;

      if (hasCurseWords) {
        const timestamps = new Map();

        offendingLines.forEach(line => {
          const [phrase, timestamp, durationAmount] = line;
          const roundedTimestamp = Math.round(timestamp) + 2;
          const roundedDurationAmount = Math.round(durationAmount) + 1.25;
          timestamps.set(roundedTimestamp, roundedDurationAmount);
        });

        console.log(timestamps);

        ytVideo.play();
        videoTime = setInterval(function() {
          let roundedTime = Math.round(ytVideo.currentTime);
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


setInterval(updateColorRec, 100);



function checkComment () {
  setTimeout(checkComment, 1000); //wait 50 ms, then try again
  if((document.getElementsByTagName("ytd-comment-thread-renderer").length) > 10){
    let temp = (document.getElementsByTagName("ytd-comment-thread-renderer").length)
    if (temp > count){
      count = temp;
      commentParser();
    }
  }
}

window.addEventListener("load", () => {
  const ytVideo = document.getElementsByClassName('video-stream')[0];
  const ytUrlIdSeparator = 'v=';
  const ytURL = window.location.href.split(ytUrlIdSeparator);
  const ytID = ytURL[1];
  console.log('ytVideo', ytVideo);
  console.log('ytID', ytID);
  checkVideo(ytVideo, ytID);
  checkComment();
  translateTitle();
});

