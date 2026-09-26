/* ============================================================
   script.js — Jumpscare (Vanilla JS, tanpa library)
   ============================================================ */
(function () {
  'use strict';

  // ----- Referensi elemen -----
  var intro     = document.getElementById('intro');
  var startBtn  = document.getElementById('startBtn');
  var player    = document.getElementById('player');
  var video     = document.getElementById('scareVideo');
  var source    = video.querySelector('source');
  var endScreen = document.getElementById('endScreen');
  var replayBtn = document.getElementById('replayBtn');
  var errorBox  = document.getElementById('errorBox');
  var errorMsg  = document.getElementById('errorMsg');
  var retryBtn  = document.getElementById('retryBtn');

  // ----- Pengaturan video -----
  // Audio asli tetap menyala, volume normal (maksimum).
  video.muted = false;
  video.volume = 1;

  // playsinline sudah dipasang sebagai atribut di HTML;
  // properti ini memastikannya juga dari sisi JavaScript.
  if ('playsInline' in video) video.playsInline = true;

  // ----- Util -----
  function showEndScreen() {
    errorBox.classList.add('hidden');
    endScreen.classList.remove('hidden');
  }

  function hideOverlays() {
    endScreen.classList.add('hidden');
    errorBox.classList.add('hidden');
  }

  // ----- Penanganan kesalahan -----
  function describeError() {
    var err = video.error;
    if (err) {
      switch (err.code) {
        case MediaError.MEDIA_ERR_NETWORK:
          return 'Terjadi kesalahan jaringan saat memuat video. Periksa koneksi internet Anda.';
        case MediaError.MEDIA_ERR_DECODE:
          return 'Video tidak dapat didekode. File mungkin rusak atau codec-nya tidak didukung browser.';
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          return 'Format video tidak didukung, atau file "scare.mp4" tidak ditemukan di folder yang sama dengan index.html.';
      }
    }
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      return 'File "scare.mp4" tidak ditemukan atau formatnya tidak didukung. ' +
             'Pastikan file tersebut berada di folder yang sama dengan index.html.';
    }
    return 'Terjadi kesalahan yang tidak diketahui saat memuat video.';
  }

  function showError(introText) {
    endScreen.classList.add('hidden');
    errorMsg.textContent = (introText ? introText + ' ' : '') + describeError();
    errorBox.classList.remove('hidden');
  }

  // Event "error" pada <source> tidak selalu naik ke elemen <video>,
  // jadi keduanya didengarkan agar file yang hilang tetap terdeteksi.
  video.addEventListener('error', function () { showError('Video tidak dapat dimuat.'); });
  source.addEventListener('error', function () { showError('Video tidak dapat dimuat.'); });

  // ----- Pemutaran -----
  // Selalu dipanggil dari dalam penangan klik (gesture pengguna),
  // sehingga tidak ada autoplay dan browser mengizinkan suara.
  function playVideo() {
    hideOverlays();

    var attempt = video.play();

    if (attempt !== undefined) {
      attempt.then(hideOverlays).catch(function (err) {
        if (err && err.name === 'NotAllowedError') {
          showError('Browser memblokir pemutaran. Tekan "COBA LAGI" untuk memutar.');
        } else {
          showError('Gagal memulai video.');
        }
      });
    }
  }

  function startExperience() {
    // Transisi: layar pembuka memudar ke hitam, lalu disembunyikan.
    intro.classList.add('is-leaving');

    function hideIntro() { intro.classList.add('hidden'); }
    intro.addEventListener('animationend', hideIntro, { once: true });
    setTimeout(hideIntro, 500); // jaring pengaman bila event animasi terlewat

    // Tampilkan layar video (fade-in dari hitam), lalu putar.
    player.classList.remove('hidden');
    playVideo();
  }

  startBtn.addEventListener('click', startExperience);

  // ----- Selesai & putar ulang -----
  video.addEventListener('ended', showEndScreen);
  video.addEventListener('play', hideOverlays);

  replayBtn.addEventListener('click', function () {
    video.currentTime = 0; // kembali ke detik pertama
    playVideo();
  });

  // ----- Coba lagi setelah kegagalan -----
  retryBtn.addEventListener('click', function () {
    video.load(); // muat ulang sumber dari awal
    playVideo();
  });
})();