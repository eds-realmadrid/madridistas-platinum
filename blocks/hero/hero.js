/**
 * Decorates the hero block
 * @param {Element} block The hero block element
 */
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

  // Parallax effect for left-aligned hero
  if (block.classList.contains('left')) {
    const content = block.querySelector('.hero-content');
    const bg = block.querySelector('.hero-bg');
    if (content && bg) {
      let ticking = false;
      let isInView = false;

      // Use Intersection Observer to detect when hero is in viewport
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isInView = entry.isIntersecting;
            if (isInView) {
              // Apply will-change when in view for smooth animation
              content.style.willChange = 'transform';
              bg.style.willChange = 'transform';
            } else {
              // Reset transforms and remove will-change when out of view
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
