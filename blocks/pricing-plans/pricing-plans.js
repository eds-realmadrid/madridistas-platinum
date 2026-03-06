/**
 * Pricing Plans block with plan toggle and jersey pricing cards.
 * Content structure (rows):
 *   Row 0: Plan Anual label | Plan Mensual label
 *   Row 1: Savings badge text (e.g. "Ahorras un 4.14%")
 *   Row 2: "Camiseta" card — title | annual price | monthly price | image | description
 *   Row 3: "Camiseta Authentic" card — title | annual price | monthly price | image | description
 *   Row 4: Footnote annual | Footnote monthly (optional)
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

  // Build cards
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'pricing-cards';

  cards.forEach((card) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'pricing-card';

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
    cardsContainer.append(cardEl);
  });

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

  block.append(toggle, cardsContainer, footnoteEl);

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
}
