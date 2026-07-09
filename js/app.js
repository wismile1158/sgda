// SGDS fixed 4K canvas scaler
(function () {
  const canvas = document.getElementById('canvas');

  function scaleCanvas() {
    const scale = Math.min(window.innerWidth / 3840, window.innerHeight / 2160);
    canvas.style.transform = `scale(${scale})`;
  }

  window.addEventListener('resize', scaleCanvas);
  window.addEventListener('orientationchange', scaleCanvas);
  scaleCanvas();
})();
