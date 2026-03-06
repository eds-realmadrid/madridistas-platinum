/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/madridistas-cleanup.js';
import sectionsTransformer from './transformers/madridistas-sections.js';

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero': heroParser,
  'cards': cardsParser,
  'columns': columnsParser,
  'accordion': accordionParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'landing-page',
  description: 'Single-page marketing landing page for Real Madrid Platinum membership. Dark theme with 9 content sections: Hero, Pricing, Details, RM Play, Motivation, Wallet, Welcome Pack, FAQ, and Final CTA.',
  urls: [
    'https://platinum.madridistas.com/es-es',
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        'section#hero',
        'section.framer-1u7uig8',
        'section.framer-7udm7i',
      ],
    },
    {
      name: 'cards',
      instances: [
        'section#aldetalle .framer-1WyMe',
        'section#aldetalle .framer--carousel',
      ],
    },
    {
      name: 'columns',
      instances: [
        'section#aldetalle-2 .framer-1d1thws',
        'section.framer-k3mkbh .framer-34b08d',
        'section.framer-1d2aruc .framer-1rz9e0p',
        'section.framer-1askbkw .framer-1wv5k5o',
      ],
    },
    {
      name: 'accordion',
      instances: [
        'section.framer-1bmqxb9 .framer-G1GNj',
      ],
    },
  ],
  sections: [
    {
      id: 'hero',
      name: 'Hero',
      selector: 'section#hero',
      style: null,
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'pricing',
      name: 'Pricing',
      selector: 'section#aldetalle',
      style: null,
      blocks: ['cards'],
      defaultContent: ['section#aldetalle .framer-7qowij h2'],
    },
    {
      id: 'details',
      name: 'Details',
      selector: 'section#aldetalle-2',
      style: null,
      blocks: ['columns'],
      defaultContent: ['section#aldetalle-2 h2'],
    },
    {
      id: 'rmplay',
      name: 'RM Play',
      selector: 'section.framer-k3mkbh',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'motivation',
      name: 'Motivation',
      selector: 'section.framer-1u7uig8',
      style: null,
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'wallet',
      name: 'Wallet',
      selector: 'section.framer-1d2aruc',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'welcome-pack',
      name: 'Welcome Pack',
      selector: 'section.framer-1askbkw',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'faq',
      name: 'FAQ',
      selector: 'section.framer-1bmqxb9',
      style: null,
      blocks: ['accordion'],
      defaultContent: ['section.framer-1bmqxb9 h2', 'section.framer-1bmqxb9 .framer-hf713p p'],
    },
    {
      id: 'final-cta',
      name: 'Final CTA',
      selector: 'section.framer-7udm7i',
      style: null,
      blocks: ['hero'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
