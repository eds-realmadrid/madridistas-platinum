/**
 * Pricing Plans block with plan toggle, jersey pricing cards, and benefits carousel.
 * Content structure (rows):
 *   Row 0: Plan Anual label | Plan Mensual label
 *   Row 1: Savings badge text (e.g. "Ahorras un 4.14%")
 *   Row 2: "Camiseta" card — title | annual price | monthly price | image | description
 *   Row 3: "Camiseta Authentic" card — title | annual price | monthly price | image | description
 *   Row 4: Footnote annual | Footnote monthly (optional)
 *   Row 5: Column headers — shirts header | benefits header
 *   Rows 6+: Benefit cards — image | text
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  // Row 0: tab labels
  const tabLabels = rows[0]?.querySelectorAll('div > div') || [];
  const annualLabel = tabLabels[0]?.textContent.trim() || 'Plan Anual';
  const monthlyLabel = tabLabels[1]?.textContent.trim() || 'Plan Mensual';

  // Row 1: savings badge
  const savingsText = rows[1]?.textContent.trim() || '';

  // Rows 2-3: pricing cards
  const cards = rows.slice(2, 4).map((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    const title = cols[0]?.textContent.trim() || '';
    const annualPrice = cols[1]?.textContent.trim() || '';
    const monthlyPrice = cols[2]?.textContent.trim() || '';
    const img = cols[3]?.querySelector('img');
    const desc = cols[4]?.textContent.trim() || '';
    return {
      title, annualPrice, monthlyPrice, img, desc,
    };
  });

  // Row 4: footnotes (optional)
  const footnoteRow = rows[4];
  const footnoteCols = footnoteRow ? [...footnoteRow.querySelectorAll(':scope > div')] : [];
  const annualFootnote = footnoteCols[0]?.textContent.trim() || '';
  const monthlyFootnote = footnoteCols[1]?.textContent.trim() || '';

  // Row 5: column headers
  const headerRow = rows[5];
  const headerCols = headerRow ? [...headerRow.querySelectorAll(':scope > div')] : [];
  const shirtsHeader = headerCols[0]?.textContent.trim() || 'Recibe tu camiseta anual';
  const benefitsHeader = headerCols[1]?.textContent.trim() || 'Más beneficios Platinum';

  // Rows 6+: benefit cards
  const benefits = rows.slice(6).map((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    const img = cols[0]?.querySelector('img');
    const text = cols[1]?.textContent.trim() || '';
    return { img, text };
  });

  // Build toggle
  const toggle = document.createElement('div');
  toggle.className = 'pricing-toggle';

  const annualTab = document.createElement('button');
  annualTab.className = 'pricing-tab active';
  annualTab.setAttribute('data-plan', 'annual');
  const labelSpan = document.createElement('span');
  labelSpan.textContent = annualLabel;
  annualTab.append(labelSpan);
  if (savingsText) {
    const badge = document.createElement('span');
    badge.className = 'pricing-badge';
    badge.textContent = savingsText;
    annualTab.append(badge);
  }

  const monthlyTab = document.createElement('button');
  monthlyTab.className = 'pricing-tab';
  monthlyTab.setAttribute('data-plan', 'monthly');
  monthlyTab.textContent = monthlyLabel;

  toggle.append(annualTab, monthlyTab);

  // Build two-column content area
  const contentArea = document.createElement('div');
  contentArea.className = 'pricing-content';

  // Left column: shirts
  const leftCol = document.createElement('div');
  leftCol.className = 'pricing-col-shirts';

  const leftHeader = document.createElement('div');
  leftHeader.className = 'pricing-col-header';
  const leftH3 = document.createElement('h3');
  leftH3.textContent = shirtsHeader;
  leftHeader.append(leftH3);
  leftCol.append(leftHeader);

  const shirtsRow = document.createElement('div');
  shirtsRow.className = 'pricing-cards';

  cards.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = `pricing-card${idx === 1 ? ' pricing-card-dark' : ''}`;

    const cardTitle = document.createElement('h4');
    cardTitle.textContent = card.title;

    const priceAnnual = document.createElement('div');
    priceAnnual.className = 'pricing-price plan-annual';
    priceAnnual.textContent = card.annualPrice;

    const priceMonthly = document.createElement('div');
    priceMonthly.className = 'pricing-price plan-monthly hidden';
    priceMonthly.textContent = card.monthlyPrice;

    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'pricing-card-image';
    if (card.img) {
      imgWrapper.append(card.img.cloneNode(true));
    }

    const descEl = document.createElement('p');
    descEl.className = 'pricing-card-desc';
    descEl.textContent = card.desc;

    cardEl.append(cardTitle, priceAnnual, priceMonthly, imgWrapper, descEl);
    shirtsRow.append(cardEl);
  });

  leftCol.append(shirtsRow);

  // Right column: benefits carousel
  const rightCol = document.createElement('div');
  rightCol.className = 'pricing-col-benefits';

  const rightHeader = document.createElement('div');
  rightHeader.className = 'pricing-col-header';
  const rightH3 = document.createElement('h3');
  rightH3.textContent = benefitsHeader;
  rightHeader.append(rightH3);
  rightCol.append(rightHeader);

  const carouselWrapper = document.createElement('div');
  carouselWrapper.className = 'pricing-carousel-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'pricing-carousel';

  benefits.forEach((benefit) => {
    const item = document.createElement('div');
    item.className = 'pricing-benefit';

    if (benefit.img) {
      const imgEl = document.createElement('div');
      imgEl.className = 'pricing-benefit-img';
      imgEl.append(benefit.img.cloneNode(true));
      item.append(imgEl);
    }

    const textEl = document.createElement('p');
    textEl.className = 'pricing-benefit-text';
    textEl.textContent = benefit.text;
    item.append(textEl);

    carousel.append(item);
  });

  carouselWrapper.append(carousel);

  // Carousel navigation
  const navContainer = document.createElement('div');
  navContainer.className = 'pricing-carousel-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'pricing-carousel-btn prev';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.innerHTML = '&#8593;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'pricing-carousel-btn next';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.innerHTML = '&#8595;';

  navContainer.append(prevBtn, nextBtn);

  rightCol.append(carouselWrapper);
  rightCol.append(navContainer);

  contentArea.append(leftCol, rightCol);

  // Footnote
  const footnoteEl = document.createElement('p');
  footnoteEl.className = 'pricing-footnote';
  const fnAnnual = document.createElement('span');
  fnAnnual.className = 'plan-annual';
  fnAnnual.textContent = annualFootnote;
  const fnMonthly = document.createElement('span');
  fnMonthly.className = 'plan-monthly hidden';
  fnMonthly.textContent = monthlyFootnote;
  footnoteEl.append(fnAnnual, fnMonthly);

  block.append(toggle, contentArea, footnoteEl);

  // Toggle behavior
  const tabs = block.querySelectorAll('.pricing-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const { plan } = tab.dataset;
      block.querySelectorAll('.plan-annual').forEach((el) => {
        el.classList.toggle('hidden', plan !== 'annual');
      });
      block.querySelectorAll('.plan-monthly').forEach((el) => {
        el.classList.toggle('hidden', plan !== 'monthly');
      });
    });
  });

  // Carousel behavior
  let currentIndex = 0;
  const itemsPerView = 3;

  function updateCarousel() {
    const items = carousel.querySelectorAll('.pricing-benefit');
    const maxIndex = Math.max(0, items.length - itemsPerView);
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    const itemHeight = items[0]?.offsetHeight || 0;
    const gap = 12;
    const offset = currentIndex * (itemHeight + gap);
    carousel.style.transform = `translateY(-${offset}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  prevBtn.addEventListener('click', () => {
    currentIndex -= 1;
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex += 1;
    updateCarousel();
  });

  // Initialize carousel after render
  requestAnimationFrame(() => updateCarousel());
}
