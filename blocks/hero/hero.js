import { appendTrackedParams } from '../../scripts/scripts.js';

/**
 * Decorates the hero block
 * @param {Element} block The hero block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  // Row 0: background image → add class
  if (rows[0]) {
    rows[0].classList.add('hero-bg');

    // Optional art direction: authors can provide TWO images in the background
    // row (each in its own inner div). When present, the FIRST is the mobile
    // image and the SECOND is the desktop one. We merge them into a single
    // <picture> with a max-width source so the mobile crop only loads on small
    // screens. With a single image, behaviour is unchanged.
    const pictures = rows[0].querySelectorAll('picture');
    if (pictures.length >= 2) {
      const [mobilePic, desktopPic] = pictures;
      const mobileImg = mobilePic.querySelector('img');
      if (mobileImg) {
        const source = document.createElement('source');
        source.media = '(max-width: 899px)';
        source.srcset = mobileImg.getAttribute('src');
        desktopPic.prepend(source);
      }
      // keep only the (now merged) desktop picture; drop the extra wrapper
      const mobileCell = mobilePic.closest('div');
      if (mobileCell && mobileCell !== desktopPic.closest('div')) mobileCell.remove();
      else mobilePic.remove();
    }

    /* fix(perf): LCP image was not prioritised — browser discovered it too late.
       fetchpriority=high tells the browser to fetch this above other resources */
    const lcpImg = rows[0].querySelector('img');
    if (lcpImg) {
      lcpImg.fetchPriority = 'high';
      lcpImg.loading = 'eager';
    }
  }

  // Row 1: content (h1, desc, buttons) → add class
  if (rows[1]) rows[1].classList.add('hero-content');

  // Force the hero title onto two lines (last two words on the second line),
  // so mobile matches the design: line 1 white, line 2 in the silver gradient
  // (the gradient runs top→bottom over the whole h1, so line 2 renders silver).
  // The break only applies on mobile; the desktop breakpoint hides it.
  const heroTitle = rows[1]?.querySelector('h1');
  if (heroTitle && !heroTitle.querySelector('.hero-title-break')) {
    const words = heroTitle.textContent.trim().split(/\s+/);
    if (words.length > 2) {
      const head = words.slice(0, -2).join(' ');
      const tail = words.slice(-2).join(' ');
      heroTitle.textContent = `${head} `;
      const br = document.createElement('br');
      br.className = 'hero-title-break';
      heroTitle.append(br, document.createTextNode(tail));
    }
  }

  // Style hero links as buttons and wrap buttons in a container
  const links = block.querySelectorAll('.hero-content a[href]');
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'hero-buttons';

  let channelSuffix = 'wplatinum-hero';
  if (block.closest('.hero-bottom')) channelSuffix = 'wplatinum-footer';
  links.forEach((link, index) => {
    const p = link.closest('p');
    if (p && !p.querySelector('picture')) {
      p.className = 'button-wrapper';
      link.className = index === 0 ? 'button primary' : 'button secondary';
      link.href = appendTrackedParams(link.href, channelSuffix);
      buttonContainer.append(p);
    }
  });

  if (buttonContainer.children.length > 0) {
    rows[1].querySelector('div').append(buttonContainer);
  }

  // Rows 2+: product images (jerseys + card).
  // Contract: every product row after the content row is a jersey, EXCEPT the
  // last one, which is the membership card. Identifying pieces by semantic
  // class (not :nth-child) lets the composition scale to any number of
  // jerseys without the CSS breaking when rows are added/removed.
  const productRows = rows.slice(2);
  const cardRow = productRows[productRows.length - 1];
  const jerseyRows = productRows.slice(0, -1);

  productRows.forEach((row) => {
    row.classList.add('hero-product');
    const isCard = row === cardRow;
    row.classList.add(isCard ? 'hero-card' : 'hero-jersey');
    const img = row.querySelector('img');
    if (img) {
      // Set intrinsic dimensions to reserve space and avoid layout shift.
      img.width = isCard ? 380 : 280;
      img.height = isCard ? 240 : 350;
    }
  });

  // Contract for the layered multi-jersey composition:
  //   jersey 0        → the protagonist (white), largest, in front, offset aside
  //   jersey 1, 2, …  → secondary jerseys (green, pink), grouped behind, tilted
  jerseyRows.forEach((row, i) => {
    row.classList.add(i === 0 ? 'hero-jersey-front' : 'hero-jersey-back');
    row.style.setProperty('--jersey-index', String(i));
  });

  // When more than one jersey is present, group them into a single stage so
  // they can overlap into one cluster and float together as a group. The
  // single-jersey layout is left untouched (jerseys stay direct children).
  if (jerseyRows.length > 1) {
    const stage = document.createElement('div');
    stage.className = 'hero-jerseys';
    jerseyRows[0].before(stage);
    jerseyRows.forEach((row) => stage.append(row));
  }

  // Expose the jersey count so the CSS can pick the right composition
  // (single jersey today, three layered jerseys once the content adds them).
  block.dataset.jerseys = String(jerseyRows.length);

  // CTA hero (bg + content only, no product images). The left-aligned variant
  // also has just two rows but is NOT a CTA hero, so exclude it.
  if (rows.length === 2 && !block.classList.contains('left')) {
    block.classList.add('cta');
  }

  // 3D tilt effect for the membership card
  const card = cardRow;
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

  // Parallax effect for left-aligned and CTA heroes
  if (block.classList.contains('left') || block.classList.contains('cta')) {
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
          content.style.transform = `translateY(${progress * -100}px)`;
          bg.style.transform = `translateY(${progress * -50}px)`;
          ticking = false;
        });
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }
}
