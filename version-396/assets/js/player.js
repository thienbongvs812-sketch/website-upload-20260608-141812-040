(function () {
  window.initMoviePlayer = function (sourceUrl, elementId) {
    var shell = document.getElementById(elementId);
    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var cover = shell.querySelector('[data-player-cover]');
    var button = shell.querySelector('[data-player-button]');
    var status = shell.querySelector('[data-player-status]');
    var hls = null;
    var loaded = false;

    function setStatus(value) {
      if (status) {
        status.textContent = value || '';
      }
    }

    function attachSource() {
      if (!video || loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放暂不可用，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else {
        loaded = false;
        setStatus('当前环境暂不支持播放');
      }
    }

    function startPlayback() {
      if (!video) {
        return;
      }
      attachSource();
      video.controls = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function () {
          setStatus('点击视频继续播放');
        });
      }
    }

    function togglePlayback() {
      if (!video) {
        return;
      }
      if (!loaded || video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
      });
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', togglePlayback);
      video.addEventListener('playing', function () {
        setStatus('');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
