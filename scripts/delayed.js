function loadScript(src, attrs = {}) {
  const script = document.createElement('script');
  script.src = src;
  Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
  document.head.appendChild(script);
}

function loadLaunch() {
  loadScript(
    'https://assets.adobedtm.com/ab05854e772b/386400a5741e/launch-938e6c931256-development.min.js',
    { async: '' },
  );
}

// Wait for OneTrust consent signal before loading Launch
if (window.RMOneTrustLoaded) {
  loadLaunch();
} else {
  window.addEventListener('RMOneTrustLoaded', loadLaunch, { once: true });
}
