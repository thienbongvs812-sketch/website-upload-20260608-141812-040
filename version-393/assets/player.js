import { H as Hls } from './hls-vendor-dru42stk.js';

function showMessage(container, text) {
    const message = container.querySelector('.player-message');
    const loading = container.querySelector('.player-loading');
    if (loading) {
        loading.hidden = true;
    }
    if (message) {
        message.textContent = text;
        message.hidden = false;
    }
}

function showLoading(container, visible) {
    const loading = container.querySelector('.player-loading');
    if (loading) {
        loading.hidden = !visible;
    }
}

function setupPlayer(container) {
    const video = container.querySelector('video');
    const startButton = container.querySelector('.player-start');
    const videoUrl = container.getAttribute('data-video-url');
    let hls = null;
    let initialized = false;

    if (!video || !startButton || !videoUrl) {
        showMessage(container, '播放信息不完整，请返回列表重新打开影片。');
        return;
    }

    async function playVideo() {
        try {
            await video.play();
            startButton.classList.add('is-hidden');
        } catch (error) {
            showMessage(container, '浏览器阻止了自动播放，请再次点击播放按钮。');
            startButton.classList.remove('is-hidden');
        }
    }

    function initialize() {
        if (initialized) {
            playVideo();
            return;
        }
        initialized = true;
        showLoading(container, true);

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                showLoading(container, false);
                playVideo();
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showMessage(container, '视频加载失败，请检查网络后刷新页面重试。');
                    if (hls) {
                        hls.destroy();
                        hls = null;
                    }
                }
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
            video.addEventListener('loadedmetadata', function () {
                showLoading(container, false);
                playVideo();
            }, { once: true });
            video.addEventListener('error', function () {
                showMessage(container, '当前浏览器无法加载该播放源。');
            }, { once: true });
            return;
        }

        showMessage(container, '当前浏览器不支持 HLS 播放，请更换新版浏览器访问。');
    }

    startButton.addEventListener('click', initialize);

    video.addEventListener('play', function () {
        startButton.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            startButton.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
