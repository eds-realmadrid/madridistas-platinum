/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion block.
 * Base: accordion. Source: https://platinum.madridistas.com/es-es
 * Instance: section.framer-1bmqxb9 .framer-G1GNj (6 FAQ items)
 *
 * Block library structure (2 columns, multiple rows):
 *   Row 1: block name
 *   Each subsequent row: [question title] | [answer content]
 *
 * Note: In the Framer source, accordion answers are collapsed/hidden.
 * The parser extracts question text from .framer-1g3yhs8 p elements.
 * Answer content may not be in the static HTML - the parser handles this gracefully.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each FAQ item is in a container with class framer-nFv4C
  // The question text is in .framer-1g3yhs8 p
  // The answer content may be in a sibling/child element (often hidden in Framer)
  const faqItems = Array.from(element.querySelectorAll('.framer-nFv4C'));

  // Fallback: if no .framer-nFv4C found, look for direct container children
  const items = faqItems.length > 0
    ? faqItems
    : Array.from(element.querySelectorAll('[class*="-container"] > .framer-nFv4C, [class*="-container"] > div'));

  items.forEach((item) => {
    // Extract question text
    const questionEl = item.querySelector('.framer-1g3yhs8 p, .framer-11rwfhs p');
    if (!questionEl) return;

    const questionText = questionEl.textContent.trim();
    if (!questionText) return;

    // Create question cell
    const questionCell = document.createElement('div');
    const qP = document.createElement('p');
    qP.textContent = questionText;
    questionCell.append(qP);

    // Extract answer content - may be hidden in Framer's collapsed state
    // Look for answer in various possible containers
    const answerContainer = item.querySelector('.framer-1cxqjh5 + div, .accordion-content, [class*="answer"], [class*="body"]');
    const answerCell = document.createElement('div');

    if (answerContainer && answerContainer.textContent.trim()) {
      // Clone answer content preserving HTML structure
      const answerClone = answerContainer.cloneNode(true);
      answerCell.append(answerClone);
    } else {
      // Answers are collapsed/hidden in Framer - use placeholder
      // The actual import will need to expand FAQ items or provide answer content
      const p = document.createElement('p');
      p.textContent = '—';
      answerCell.append(p);
    }

    cells.push([questionCell, answerCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
