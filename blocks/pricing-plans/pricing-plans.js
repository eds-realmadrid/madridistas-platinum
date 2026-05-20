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
  const annualFootnote = footnoteCols[0]?.innerHTML.trim() || '';
  const monthlyFootnote = footnoteCols[1]?.innerHTML.trim() || '';

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

  // Build toggle with proper ARIA roles
  const toggle = document.createElement('div');
  toggle.className = 'pricing-toggle';
  toggle.setAttribute('role', 'tablist');
  toggle.setAttribute('aria-label', 'Plan selection');

  const annualTab = document.createElement('button');
  annualTab.className = 'pricing-tab active';
  annualTab.setAttribute('data-plan', 'annual');
  annualTab.setAttribute('role', 'tab');
  annualTab.setAttribute('aria-selected', 'true');
  annualTab.setAttribute('aria-controls', 'pricing-content-annual');
  annualTab.id = 'tab-annual';
  const labelSpan = document.createElement('span');
  labelSpan.textContent = annualLabel;
  annualTab.append(labelSpan);
  if (savingsText) {
    const badge = document.createElement('span');
    badge.className = 'pricing-badge';
    badge.textContent = savingsText;
    badge.setAttribute('aria-label', `Badge: ${savingsText}`);
    annualTab.append(badge);
  }

  const monthlyTab = document.createElement('button');
  monthlyTab.className = 'pricing-tab';
  monthlyTab.setAttribute('data-plan', 'monthly');
  monthlyTab.setAttribute('role', 'tab');
  monthlyTab.setAttribute('aria-selected', 'false');
  monthlyTab.setAttribute('aria-controls', 'pricing-content-monthly');
  monthlyTab.id = 'tab-monthly';
  monthlyTab.textContent = monthlyLabel;

  toggle.append(annualTab, monthlyTab);

  // Build two-column content area with ARIA roles
  const contentArea = document.createElement('div');
  contentArea.className = 'pricing-content';
  contentArea.setAttribute('role', 'tabpanel');
  contentArea.setAttribute('aria-labelledby', 'tab-annual');
  contentArea.id = 'pricing-content-annual';

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

    // Annual price with crossed-out monthly equivalent
    const priceAnnual = document.createElement('div');
    priceAnnual.className = 'pricing-price plan-annual';
    const monthlyMatch = card.monthlyPrice.match(/([\d,.]+)/);
    if (monthlyMatch) {
      const monthlyNum = parseFloat(monthlyMatch[1].replace(',', '.'));
      const crossedPrice = (monthlyNum * 12).toFixed(2).replace('.', ',');
      const crossed = document.createElement('span');
      crossed.className = 'pricing-original';
      crossed.textContent = `${crossedPrice}€`;
      priceAnnual.append(crossed);
    }
    priceAnnual.append(` ${card.annualPrice}`);

    const priceMonthly = document.createElement('div');
    priceMonthly.className = 'pricing-price plan-monthly hidden';
    priceMonthly.textContent = card.monthlyPrice;

    const monthlyImgSrcs = [
      '/media/media_10eb90bcf942ccddcd6d567cd6fa21216112e5fd7.png',
      '/media/media_16e5dcca225cfd968fa4ca790d76b0cb322c94783.png',
    ];

    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'pricing-card-image';
    if (card.img) {
      const imgEl = card.img.cloneNode(true);
      imgEl.dataset.annualSrc = imgEl.src;
      imgEl.dataset.monthlySrc = monthlyImgSrcs[idx];
      imgWrapper.append(imgEl);
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
  carouselWrapper.setAttribute('role', 'region');
  carouselWrapper.setAttribute('aria-label', benefitsHeader);

  const carousel = document.createElement('div');
  carousel.className = 'pricing-carousel';
  carousel.setAttribute('aria-live', 'polite');
  carousel.setAttribute('aria-atomic', 'false');

  benefits.forEach((benefit) => {
    const item = document.createElement('div');
    item.className = 'pricing-benefit';

    const check = document.createElement('span');
    check.className = 'pricing-benefit-check';
    check.setAttribute('aria-hidden', 'true');
    item.append(check);

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
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pricing-carousel-btn prev hidden';
  prevBtn.setAttribute('aria-label', 'Previous benefits');
  prevBtn.setAttribute('type', 'button');

  const nextBtn = document.createElement('button');
  nextBtn.className = 'pricing-carousel-btn next';
  nextBtn.setAttribute('aria-label', 'Next benefits');
  nextBtn.setAttribute('type', 'button');

  carouselWrapper.append(prevBtn, nextBtn);

  rightCol.append(carouselWrapper);

  contentArea.append(leftCol, rightCol);

  // Footnote
  const footnoteEl = document.createElement('p');
  footnoteEl.className = 'pricing-footnote';
  const fnAnnual = document.createElement('span');
  fnAnnual.className = 'plan-annual';
  fnAnnual.innerHTML = annualFootnote;
  const fnMonthly = document.createElement('span');
  fnMonthly.className = 'plan-monthly hidden';
  fnMonthly.innerHTML = monthlyFootnote;
  footnoteEl.append(fnAnnual, fnMonthly);

  block.append(toggle, contentArea, footnoteEl);

  // Toggle behavior with proper ARIA updates
  const tabs = block.querySelectorAll('.pricing-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const { plan } = tab.dataset;
      contentArea.setAttribute('aria-labelledby', `tab-${plan}`);

      block.querySelectorAll('.plan-annual').forEach((el) => {
        el.classList.toggle('hidden', plan !== 'annual');
      });
      block.querySelectorAll('.plan-monthly').forEach((el) => {
        el.classList.toggle('hidden', plan !== 'monthly');
      });

      block.querySelectorAll('.pricing-card-image img[data-monthly-src]').forEach((img) => {
        img.src = plan === 'monthly' ? img.dataset.monthlySrc : img.dataset.annualSrc;
      });
    });
  });

  // Carousel behavior
  let currentIndex = 0;
  const itemsPerView = window.matchMedia('(width >= 900px)').matches ? 3 : 4;

  function updateCarousel() {
    const items = [...carousel.querySelectorAll('.pricing-benefit')];
    if (!items.length) return;

    // Build actual top positions — items may have different heights
    let top = 0;
    const tops = items.map((item) => {
      const t = top;
      top += item.offsetHeight + 12;
      return t;
    });

    // maxIndex: last scroll position where the content fills the wrapper with no
    // empty space at the bottom, regardless of non-uniform item heights
    const lastBottom = tops[items.length - 1] + items[items.length - 1].offsetHeight;
    const visibleH = carouselWrapper.offsetHeight - 24; // subtract top+bottom padding
    const maxOffset = Math.max(0, lastBottom - visibleH);
    let maxIndex = 0;
    for (let i = tops.length - 1; i >= 0; i -= 1) {
      if (tops[i] <= maxOffset) { maxIndex = i; break; }
    }

    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    carousel.style.transform = `translateY(-${tops[currentIndex]}px)`;

    prevBtn.classList.toggle('hidden', currentIndex === 0);
    nextBtn.classList.toggle('hidden', currentIndex >= maxIndex);
    carouselWrapper.classList.toggle('has-prev', currentIndex > 0);
    carouselWrapper.classList.toggle('has-next', currentIndex < maxIndex);
  }

  prevBtn.addEventListener('click', () => {
    currentIndex -= itemsPerView;
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex += itemsPerView;
    updateCarousel();
  });

  let wheelLocked = false;
  carouselWrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (wheelLocked) return;
    wheelLocked = true;
    currentIndex += e.deltaY > 0 ? 1 : -1;
    updateCarousel();
    setTimeout(() => { wheelLocked = false; }, 250);
  }, { passive: false });

  requestAnimationFrame(() => updateCarousel());
}
