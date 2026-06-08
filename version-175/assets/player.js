import { H as Hls } from './hls.js';

document.addEventListener('DOMContentLoaded', function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('[data-play]');
    var source = video ? video.getAttribute('data-video-src') : '';
    var prepared = false;

    var prepare = function () {
      if (prepared || !video || !source) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (Hls && Hls.isSupported && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hlsController = hls;
        return;
      }

      video.src = source;
    };

    var play = function () {
      if (!video) {
        return;
      }

      prepare();
      shell.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var started = video.play();

      if (started && started.catch) {
        started.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    };

    if (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (video) {
      video.addEventListener('click', play);
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === shell) {
        play();
      }
    });
  });
});
