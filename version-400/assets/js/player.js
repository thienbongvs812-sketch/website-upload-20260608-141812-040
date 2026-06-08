(function () {
    function initPlayer(frame) {
        var video = frame.querySelector('video');
        var cover = frame.querySelector('[data-player-cover]');
        var button = frame.querySelector('[data-player-button]');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-src');
        var hlsInstance = null;

        function attachSource() {
            if (video.dataset.loaded === 'true') {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            video.dataset.loaded = 'true';
        }

        function play() {
            attachSource();
            frame.classList.add('is-ready');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.dataset.loaded !== 'true' || video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
    });
}());
