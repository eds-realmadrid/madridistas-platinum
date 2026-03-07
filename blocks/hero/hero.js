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

  // Parallax effect for left-aligned hero (in columns-container section)
  const section = block.closest('.columns-container');
  if (section) {
    const content = block.querySelector('.hero-content');
    const bg = block.querySelector('.hero-bg');
    if (content && bg) {
      const onScroll = () => {
        const rect = block.getBoundingClientRect();
        const viewH = window.innerHeight;
        if (rect.bottom > 0 && rect.top < viewH) {
          const progress = -rect.top / viewH;
          content.style.transform = `translateY(${progress * -60}px)`;
          bg.style.transform = `translateY(${progress * -20}px)`;
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }
}
