let ytVideo = document.getElementsByClassName('video-stream')[0];
let ytURL = window.location.href.split('=v')[1];

console.log(ytURL);

setInterval(function() {
  if (Math.round(ytVideo.currentTime) % 10 === 0){
    ytVideo.currentTime = ytVideo.currentTime + 5;
  }
}, 100);

// var timeout = setTimeout(function(){
//   var interval = setInterval(function(){
//     console.log('interval')
//     if(Math.round(ytVideo.getCurrentTime()) % 10 === 0){
//         clearInterval(interval);
//         ytVideo.currentTime = ytVideo.getCurrentTime() + 5;
//     }
//   },100);
// },100);