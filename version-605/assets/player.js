(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var video = document.querySelector("[data-player]");
    var button = document.querySelector("[data-start-player]");
    var shell = document.querySelector("[data-player-box]");

    if (!video || !button || !shell) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var started = false;
    var hlsInstance = null;

    async function attachStream() {
      if (!stream) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.src) {
          video.src = stream;
        }
        return;
      }

      try {
        var module = await import("./hls-vendor.js");
        var Hls = module.H;

        if (Hls && Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          }
          return;
        }
      } catch (error) {
        video.setAttribute("data-error", "1");
      }

      if (!video.src) {
        video.src = stream;
      }
    }

    async function play() {
      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;
      shell.classList.add("is-playing");
      await attachStream();
      video.play().catch(function () {
        shell.classList.remove("is-playing");
        started = false;
      });
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      play();
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
  });
})();
