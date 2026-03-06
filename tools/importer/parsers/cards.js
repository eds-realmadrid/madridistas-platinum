/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block.
 * Base: cards. Source: https://platinum.madridistas.com/es-es
 * Instances:
 *   1. Pricing cards in section#aldetalle .framer-1WyMe (2 jersey pricing cards)
 *   2. Benefits carousel in section#aldetalle .framer--carousel (7 benefit cards)
 *
 * Block library structure (2 columns, multiple rows):
 *   Row 1: block name
 *   Each subsequent row: [image] | [title + description + CTA]
 */
export default function parse(element, { document }) {
  const cells = [];

  // Detect which instance: pricing cards (.framer-1WyMe) or benefits carousel (.framer--carousel)
  const isCarousel = element.matches('ul.framer--carousel') || element.querySelector('ul.framer--carousel');
  const isPricingContainer = element.matches('.framer-1WyMe') || element.classList.contains('framer-1WyMe');

  if (isCarousel) {
    // Benefits carousel: each <li> is a card with icon, title text, and feature image
    const carouselEl = element.matches('ul.framer--carousel') ? element : element.querySelector('ul.framer--carousel');
    const items = carouselEl ? Array.from(carouselEl.querySelectorAll(':scope > li')) : [];

    items.forEach((item) => {
      // Get the feature image (not the SVG icon)
      const images = Array.from(item.querySelectorAll('img'));
      const featureImage = images.find((img) => img.src && !img.src.startsWith('data:'));

      // Get the title text
      const titleEl = item.querySelector('.framer-styles-preset-krxhtf, p.framer-text');

      const imageCell = featureImage || '';
      const textCell = document.createElement('div');
      if (titleEl) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = titleEl.textContent.trim();
        p.append(strong);
        textCell.append(p);
      }

      cells.push([imageCell, textCell]);
    });
  } else {
    // Pricing cards: two cards with image, h3 subtitle, h4 title, prices, description
    // Card 1: .framer-1wvh8ps (Camiseta)
    // Card 2: .framer-16pihcd (Camiseta Authentic)
    const card1 = element.querySelector('.framer-1wvh8ps');
    const card2 = element.querySelector('.framer-16pihcd');
    const cardElements = [card1, card2].filter(Boolean);

    cardElements.forEach((card) => {
      // Get jersey image
      const image = card.querySelector('img[src*="framerusercontent"]');

      // Get subtitle (h3 - "Recibe tu camiseta anual")
      const subtitle = card.querySelector('h3');

      // Get title (h4 - "Camiseta" or "Camiseta Authentic")
      const title = card.querySelector('h4');

      // Get prices
      const prices = Array.from(card.querySelectorAll('.framer-styles-preset-7quoi9'));
      const currentPrice = prices.length > 0 ? prices[prices.length - 1] : null;

      // Get description
      const desc = card.querySelector('.framer-styles-preset-1v02pti');

      const imageCell = image || '';
      const textCell = document.createElement('div');

      if (title) {
        const h = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = title.textContent.trim();
        h.append(strong);
        textCell.append(h);
      }
      if (subtitle) {
        const p = document.createElement('p');
        p.textContent = subtitle.textContent.trim();
        textCell.append(p);
      }
      if (currentPrice) {
        const p = document.createElement('p');
        p.textContent = currentPrice.textContent.trim();
        textCell.append(p);
      }
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        textCell.append(p);
      }

      cells.push([imageCell, textCell]);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
