(function () {
  const players = Array.from(document.querySelectorAll('[data-player]'));
  let hlsPromise = null;

  function loadRemoteHls() {
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('hls-load-failed'));
      };
      document.head.appendChild(script);
    });
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = import('./hls-vendor-dru42stk.js').then(function (module) {
      return module.H;
    }).catch(function () {
      return loadRemoteHls();
    });
    return hlsPromise;
  }

  function showMessage(player, text) {
    const message = player.querySelector('[data-player-message]');
    if (message) {
      message.textContent = text || '';
    }
  }

  function playVideo(video, player) {
    const playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {
        showMessage(player, '点击播放按钮继续播放');
        player.classList.remove('is-playing');
      });
    }
  }

  function startPlayer(player) {
    const video = player.querySelector('video');
    const source = player.dataset.src;

    if (!video || !source) {
      showMessage(player, '播放源暂时不可用');
      return;
    }

    if (player.dataset.started === 'true') {
      player.classList.add('is-playing');
      playVideo(video, player);
      return;
    }

    player.dataset.started = 'true';
    player.classList.add('is-playing');
    showMessage(player, '');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        playVideo(video, player);
      }, { once: true });
      video.load();
      playVideo(video, player);
      return;
    }

    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        player._hls = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          playVideo(video, player);
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage(player, '播放源连接异常，请稍后重试');
            player.classList.remove('is-playing');
          }
        });
      } else {
        video.src = source;
        video.load();
        playVideo(video, player);
      }
    }).catch(function () {
      video.src = source;
      video.load();
      playVideo(video, player);
    });
  }

  players.forEach(function (player) {
    const overlay = player.querySelector('.player-overlay');
    const video = player.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayer(player);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (player.dataset.started !== 'true') {
          startPlayer(player);
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
        showMessage(player, '');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }
  });
})();
