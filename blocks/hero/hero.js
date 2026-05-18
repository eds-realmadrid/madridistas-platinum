/**
 * Decorates the hero block
 * @param {Element} block The hero block element
 */

function initAnimatedBackground(bgEl) {
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-bg-canvas';

  // Dimensions must be set before getContext — setting them after resets all GL state.
  canvas.width = Math.max(320, Math.floor(window.innerWidth / 2));
  canvas.height = Math.max(240, Math.floor(window.innerHeight / 2));

  bgEl.prepend(canvas);

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;


  const vsSource = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const fsSource = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_res;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      mat2 rot = mat2(0.8775, 0.4794, -0.4794, 0.8775);
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = rot * p * 2.1 + vec2(100.0);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_time * 0.06;

      vec2 q = vec2(
        fbm(uv * 2.0 + t),
        fbm(uv * 2.0 + vec2(5.2, 1.3) + t * 0.8)
      );
      vec2 r = vec2(
        fbm(uv * 1.5 + q + vec2(1.7, 9.2) + 0.12 * t),
        fbm(uv * 1.5 + q + vec2(8.3, 2.8) + 0.10 * t)
      );
      float f = fbm(uv * 2.0 + r);

      vec3 col = mix(vec3(0.03, 0.03, 0.06), vec3(0.35, 0.37, 0.44), clamp(f * 3.0, 0.0, 1.0));
      col = mix(col, vec3(0.55, 0.58, 0.66), clamp(length(q) * 0.9, 0.0, 1.0));
      col = mix(col, vec3(0.80, 0.84, 0.90), clamp(r.x * r.x * 2.0, 0.0, 1.0));

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compileShader(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vsSource));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_res');

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(uRes, canvas.width, canvas.height);

  let raf = null;
  let inView = true;
  let startTime = null;

  function render(ts) {
    if (!startTime) startTime = ts;
    gl.uniform1f(uTime, (ts - startTime) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (inView) raf = requestAnimationFrame(render);
  }

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      inView = entry.isIntersecting;
      if (inView && !raf) raf = requestAnimationFrame(render);
      if (!inView && raf) { cancelAnimationFrame(raf); raf = null; }
    });
  }).observe(bgEl);

  raf = requestAnimationFrame(render);
}

export default async function decorate(block) {
  const rows = [...block.children];

  // Row 0: background image → add class
  if (rows[0]) rows[0].classList.add('hero-bg');

  // Row 1: content (h1, desc, buttons) → add class
  if (rows[1]) rows[1].classList.add('hero-content');

  // Style hero links as buttons and wrap buttons in a container
  const links = block.querySelectorAll('.hero-content a[href]');
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'hero-buttons';

  links.forEach((link, index) => {
    const p = link.closest('p');
    if (p && !p.querySelector('picture')) {
      p.className = 'button-wrapper';
      link.className = index === 0 ? 'button primary' : 'button secondary';
      buttonContainer.append(p);
    }
  });

  if (buttonContainer.children.length > 0) {
    rows[1].querySelector('div').append(buttonContainer);
  }

  // Rows 2+: product images → add class
  rows.slice(2).forEach((row) => {
    row.classList.add('hero-product');
  });

  // CTA hero (bg + content only, no product images)
  if (rows.length === 2) {
    block.classList.add('cta');
  }

  // Animated WebGL background for top hero (has product images, not left-aligned)
  if (rows.length > 2 && !block.classList.contains('left')) {
    const bg = block.querySelector('.hero-bg');
    if (bg) initAnimatedBackground(bg);
  }

  // 3D tilt effect for card (4th child)
  const card = rows[3];
  if (card) {
    const cardInner = card.querySelector('div');
    if (cardInner) {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        cardInner.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;
      });

      card.addEventListener('mouseleave', () => {
        cardInner.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    }
  }

  // Mobile background image for left-aligned hero (below 900px desktop breakpoint)
  if (block.classList.contains('left')) {
    const picture = block.querySelector('.hero-bg picture');
    if (picture) {
      const source = document.createElement('source');
      source.media = '(max-width: 899px)';
      source.srcset = '/media/media_158357b35da2e095c8400fd8c0a72365950512ad4.png';
      picture.prepend(source);
    }
  }

  // Parallax effect for left-aligned hero
  if (block.classList.contains('left')) {
    const content = block.querySelector('.hero-content');
    const bg = block.querySelector('.hero-bg');
    if (content && bg) {
      let ticking = false;
      let isInView = false;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isInView = entry.isIntersecting;
            if (isInView) {
              content.style.willChange = 'transform';
              bg.style.willChange = 'transform';
            } else {
              content.style.transform = '';
              bg.style.transform = '';
              content.style.willChange = 'auto';
              bg.style.willChange = 'auto';
            }
          });
        },
        { rootMargin: '50px' },
      );
      observer.observe(block);

      const onScroll = () => {
        if (!isInView || ticking) return;

        ticking = true;
        requestAnimationFrame(() => {
          const rect = block.getBoundingClientRect();
          const viewH = window.innerHeight;
          const progress = -rect.top / viewH;
          content.style.transform = `translateY(${progress * -60}px)`;
          bg.style.transform = `translateY(${progress * -30}px)`;
          ticking = false;
        });
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }
}
