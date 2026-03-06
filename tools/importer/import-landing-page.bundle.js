var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-landing-page.js
  var import_landing_page_exports = {};
  __export(import_landing_page_exports, {
    default: () => import_landing_page_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const bgImage = element.querySelector(
      ".framer-iqlr7s img, .framer-11iws5p img, .framer-1pzqj7p img, .framer-iqqe56 img, .framer-1wzpk0v img, .framer-e9wnvb-container img"
    );
    const heading = element.querySelector("h1, h2");
    const description = element.querySelector(
      ".framer-iubz5q p, .framer-k3sf6l p, .framer-styles-preset-1v02pti"
    );
    const ctaLinks = Array.from(element.querySelectorAll("a.framer-PPENh, a.framer-11iys7m"));
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentWrapper = document.createElement("div");
    if (heading) contentWrapper.append(heading);
    if (description) contentWrapper.append(description);
    ctaLinks.forEach((cta) => {
      const textEl = cta.querySelector("p.framer-text");
      if (textEl) {
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.href = cta.href || "#";
        link.textContent = textEl.textContent.trim();
        p.append(link);
        contentWrapper.append(p);
      }
    });
    if (contentWrapper.children.length > 0) {
      cells.push([contentWrapper]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document }) {
    const cells = [];
    const isCarousel = element.matches("ul.framer--carousel") || element.querySelector("ul.framer--carousel");
    const isPricingContainer = element.matches(".framer-1WyMe") || element.classList.contains("framer-1WyMe");
    if (isCarousel) {
      const carouselEl = element.matches("ul.framer--carousel") ? element : element.querySelector("ul.framer--carousel");
      const items = carouselEl ? Array.from(carouselEl.querySelectorAll(":scope > li")) : [];
      items.forEach((item) => {
        const images = Array.from(item.querySelectorAll("img"));
        const featureImage = images.find((img) => img.src && !img.src.startsWith("data:"));
        const titleEl = item.querySelector(".framer-styles-preset-krxhtf, p.framer-text");
        const imageCell = featureImage || "";
        const textCell = document.createElement("div");
        if (titleEl) {
          const p = document.createElement("p");
          const strong = document.createElement("strong");
          strong.textContent = titleEl.textContent.trim();
          p.append(strong);
          textCell.append(p);
        }
        cells.push([imageCell, textCell]);
      });
    } else {
      const card1 = element.querySelector(".framer-1wvh8ps");
      const card2 = element.querySelector(".framer-16pihcd");
      const cardElements = [card1, card2].filter(Boolean);
      cardElements.forEach((card) => {
        const image = card.querySelector('img[src*="framerusercontent"]');
        const subtitle = card.querySelector("h3");
        const title = card.querySelector("h4");
        const prices = Array.from(card.querySelectorAll(".framer-styles-preset-7quoi9"));
        const currentPrice = prices.length > 0 ? prices[prices.length - 1] : null;
        const desc = card.querySelector(".framer-styles-preset-1v02pti");
        const imageCell = image || "";
        const textCell = document.createElement("div");
        if (title) {
          const h = document.createElement("p");
          const strong = document.createElement("strong");
          strong.textContent = title.textContent.trim();
          h.append(strong);
          textCell.append(h);
        }
        if (subtitle) {
          const p = document.createElement("p");
          p.textContent = subtitle.textContent.trim();
          textCell.append(p);
        }
        if (currentPrice) {
          const p = document.createElement("p");
          p.textContent = currentPrice.textContent.trim();
          textCell.append(p);
        }
        if (desc) {
          const p = document.createElement("p");
          p.textContent = desc.textContent.trim();
          textCell.append(p);
        }
        cells.push([imageCell, textCell]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document }) {
    const cells = [];
    const parentSection = element.closest("section");
    const sectionId = parentSection ? parentSection.id : "";
    const sectionClass = parentSection ? parentSection.className : "";
    if (sectionId === "aldetalle-2" || element.classList.contains("framer-1d1thws")) {
      const f1Text = element.querySelector(".framer-1p1fmhh");
      const f1Img = element.querySelector('.framer-12u8gys img[src*="framerusercontent"]');
      if (f1Text || f1Img) {
        const textCell = document.createElement("div");
        const num1 = f1Text ? f1Text.querySelector(".framer-l3ingd p, .framer-1j8oqln p") : null;
        const title1 = f1Text ? f1Text.querySelector("h3") : null;
        const desc1 = f1Text ? f1Text.querySelector(".framer-14eb6kd p") : null;
        if (num1) {
          const p = document.createElement("p");
          p.textContent = num1.textContent.trim();
          textCell.append(p);
        }
        if (title1) {
          const h = document.createElement("h3");
          h.textContent = title1.textContent.trim();
          textCell.append(h);
        }
        if (desc1) {
          const p = document.createElement("p");
          p.textContent = desc1.textContent.trim();
          textCell.append(p);
        }
        cells.push([textCell, f1Img || ""]);
      }
      const f2Img = element.querySelector('.framer-c3ck3j img[src*="framerusercontent"]');
      const f2Text = element.querySelector(".framer-csr0fo");
      if (f2Text || f2Img) {
        const textCell = document.createElement("div");
        const num2 = f2Text ? f2Text.querySelector(".framer-1elm9rt p") : null;
        const title2 = f2Text ? f2Text.querySelector("h3") : null;
        const desc2 = f2Text ? f2Text.querySelector(".framer-18zzkq8 p") : null;
        if (num2) {
          const p = document.createElement("p");
          p.textContent = num2.textContent.trim();
          textCell.append(p);
        }
        if (title2) {
          const h = document.createElement("h3");
          h.textContent = title2.textContent.trim();
          textCell.append(h);
        }
        if (desc2) {
          const p = document.createElement("p");
          p.textContent = desc2.textContent.trim();
          textCell.append(p);
        }
        cells.push([f2Img || "", textCell]);
      }
      const f3Text = element.querySelector(".framer-dvkn6v");
      const f3Img = element.querySelector('.framer-1w16giz img[src*="framerusercontent"]');
      if (f3Text || f3Img) {
        const textCell = document.createElement("div");
        const num3 = f3Text ? f3Text.querySelector(".framer-1omhld4 p") : null;
        const title3 = f3Text ? f3Text.querySelector("h3") : null;
        const desc3 = f3Text ? f3Text.querySelector(".framer-2wb6lu p") : null;
        if (num3) {
          const p = document.createElement("p");
          p.textContent = num3.textContent.trim();
          textCell.append(p);
        }
        if (title3) {
          const h = document.createElement("h3");
          h.textContent = title3.textContent.trim();
          textCell.append(h);
        }
        if (desc3) {
          const p = document.createElement("p");
          p.textContent = desc3.textContent.trim();
          textCell.append(p);
        }
        cells.push([textCell, f3Img || ""]);
      }
    } else if (sectionClass.includes("framer-k3mkbh")) {
      const textDiv = document.createElement("div");
      const heading = element.querySelector("h2");
      const descP = element.querySelector(".framer-14953tw p, .framer-styles-preset-1v02pti");
      if (heading) {
        const h = document.createElement("h2");
        h.textContent = heading.textContent.trim();
        textDiv.append(h);
      }
      if (descP) {
        const p = document.createElement("p");
        p.innerHTML = descP.innerHTML;
        textDiv.append(p);
      }
      const img = element.querySelector('.framer-1h74x05 img[src*="framerusercontent"]');
      cells.push([textDiv, img || ""]);
    } else if (sectionClass.includes("framer-1d2aruc")) {
      const textDiv = document.createElement("div");
      const heading = element.querySelector("h3");
      if (heading) {
        const h = document.createElement("h3");
        h.textContent = heading.textContent.trim();
        textDiv.append(h);
      }
      const item1 = element.querySelector(".framer-3oj08a p, .framer-1l27fxg > div:first-child .framer-styles-preset-1v02pti");
      const item2 = element.querySelector(".framer-1xx5pi8 p, .framer-1bpqyxo .framer-styles-preset-1v02pti");
      const ul = document.createElement("ul");
      if (item1) {
        const li = document.createElement("li");
        li.textContent = item1.textContent.trim();
        ul.append(li);
      }
      if (item2) {
        const li = document.createElement("li");
        li.textContent = item2.textContent.trim();
        ul.append(li);
      }
      if (ul.children.length > 0) textDiv.append(ul);
      const img = element.querySelector('.framer-hlr24b img, .framer-1ljl9av img, img[src*="framerusercontent"]');
      cells.push([textDiv, img || ""]);
    } else if (sectionClass.includes("framer-1askbkw")) {
      const img = element.querySelector('.framer-1o64qoj img[src*="framerusercontent"]');
      const textDiv = document.createElement("div");
      const heading = element.querySelector("h2");
      const desc = element.querySelector(".framer-1paap1t p");
      if (heading) {
        const h = document.createElement("h2");
        h.textContent = heading.textContent.trim();
        textDiv.append(h);
      }
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc.textContent.trim();
        textDiv.append(p);
      }
      const itemTexts = [
        element.querySelector(".framer-171pylg p"),
        element.querySelector(".framer-kelice p"),
        element.querySelector(".framer-1g4fsl5 p"),
        element.querySelector(".framer-ozyzox p")
      ].filter(Boolean);
      if (itemTexts.length > 0) {
        const ul = document.createElement("ul");
        itemTexts.forEach((t) => {
          const li = document.createElement("li");
          li.textContent = t.textContent.trim();
          ul.append(li);
        });
        textDiv.append(ul);
      }
      cells.push([img || "", textDiv]);
    } else {
      const allImages = Array.from(element.querySelectorAll('img[src*="framerusercontent"]'));
      const allText = Array.from(element.querySelectorAll("h2, h3, p.framer-styles-preset-1v02pti"));
      const textDiv = document.createElement("div");
      allText.forEach((el) => textDiv.append(el.cloneNode(true)));
      const img = allImages.length > 0 ? allImages[0] : "";
      cells.push([textDiv, img]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  function parse4(element, { document }) {
    const cells = [];
    const faqItems = Array.from(element.querySelectorAll(".framer-nFv4C"));
    const items = faqItems.length > 0 ? faqItems : Array.from(element.querySelectorAll('[class*="-container"] > .framer-nFv4C, [class*="-container"] > div'));
    items.forEach((item) => {
      const questionEl = item.querySelector(".framer-1g3yhs8 p, .framer-11rwfhs p");
      if (!questionEl) return;
      const questionText = questionEl.textContent.trim();
      if (!questionText) return;
      const questionCell = document.createElement("div");
      const qP = document.createElement("p");
      qP.textContent = questionText;
      questionCell.append(qP);
      const answerContainer = item.querySelector('.framer-1cxqjh5 + div, .accordion-content, [class*="answer"], [class*="body"]');
      const answerCell = document.createElement("div");
      if (answerContainer && answerContainer.textContent.trim()) {
        const answerClone = answerContainer.cloneNode(true);
        answerCell.append(answerClone);
      } else {
        const p = document.createElement("p");
        p.textContent = "\u2014";
        answerCell.append(p);
      }
      cells.push([questionCell, answerCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/madridistas-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#CybotCookiebotDialog",
        '[class*="cookie"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        "canvas"
      ]);
      const svgContainers = element.querySelectorAll(".svgContainer");
      svgContainers.forEach((container) => {
        const img = container.querySelector('img[src^="data:image/svg+xml"]');
        if (img) container.remove();
      });
      const nestedSpans = element.querySelectorAll("span.framer-text > span.framer-text:only-child");
      nestedSpans.forEach((span) => {
        const parent = span.parentElement;
        if (parent && parent.children.length === 1) {
          parent.replaceWith(...span.childNodes);
        }
      });
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        ".framer-JOz7s",
        ".framer-kq6m5m-container"
      ]);
      const footerSection = element.querySelector("section.framer-7udm7i .framer-j6wha7");
      if (footerSection) footerSection.remove();
      WebImporter.DOMUtils.remove(element, [
        ".framer-1r801k"
      ]);
      const ssrVariants = element.querySelectorAll(".ssr-variant");
      ssrVariants.forEach((variant) => {
        while (variant.firstChild) {
          variant.parentNode.insertBefore(variant.firstChild, variant);
        }
        variant.remove();
      });
      const emptyDivs = element.querySelectorAll("div:empty");
      emptyDivs.forEach((div) => {
        if (!div.querySelector("img") && !div.textContent.trim()) {
          div.remove();
        }
      });
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-framer-appear-id");
        el.removeAttribute("data-framer-name");
        el.removeAttribute("data-framer-component-type");
      });
      WebImporter.DOMUtils.remove(element, ["iframe", "link", "noscript"]);
    }
  }

  // tools/importer/transformers/madridistas-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { template } = payload;
      if (!template || !template.sections || template.sections.length < 2) return;
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };
      const sections = [...template.sections].reverse();
      sections.forEach((section) => {
        const selectorStr = Array.isArray(section.selector) ? section.selector.join(", ") : section.selector;
        const sectionEl = element.querySelector(selectorStr);
        if (!sectionEl) return;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        const isFirstSection = section.id === template.sections[0].id;
        if (!isFirstSection) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-landing-page.js
  var parsers = {
    "hero": parse,
    "cards": parse2,
    "columns": parse3,
    "accordion": parse4
  };
  var PAGE_TEMPLATE = {
    name: "landing-page",
    description: "Single-page marketing landing page for Real Madrid Platinum membership. Dark theme with 9 content sections: Hero, Pricing, Details, RM Play, Motivation, Wallet, Welcome Pack, FAQ, and Final CTA.",
    urls: [
      "https://platinum.madridistas.com/es-es"
    ],
    blocks: [
      {
        name: "hero",
        instances: [
          "section#hero",
          "section.framer-1u7uig8",
          "section.framer-7udm7i"
        ]
      },
      {
        name: "cards",
        instances: [
          "section#aldetalle .framer-1WyMe",
          "section#aldetalle .framer--carousel"
        ]
      },
      {
        name: "columns",
        instances: [
          "section#aldetalle-2 .framer-1d1thws",
          "section.framer-k3mkbh .framer-34b08d",
          "section.framer-1d2aruc .framer-1rz9e0p",
          "section.framer-1askbkw .framer-1wv5k5o"
        ]
      },
      {
        name: "accordion",
        instances: [
          "section.framer-1bmqxb9 .framer-G1GNj"
        ]
      }
    ],
    sections: [
      {
        id: "hero",
        name: "Hero",
        selector: "section#hero",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "pricing",
        name: "Pricing",
        selector: "section#aldetalle",
        style: null,
        blocks: ["cards"],
        defaultContent: ["section#aldetalle .framer-7qowij h2"]
      },
      {
        id: "details",
        name: "Details",
        selector: "section#aldetalle-2",
        style: null,
        blocks: ["columns"],
        defaultContent: ["section#aldetalle-2 h2"]
      },
      {
        id: "rmplay",
        name: "RM Play",
        selector: "section.framer-k3mkbh",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "motivation",
        name: "Motivation",
        selector: "section.framer-1u7uig8",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "wallet",
        name: "Wallet",
        selector: "section.framer-1d2aruc",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "welcome-pack",
        name: "Welcome Pack",
        selector: "section.framer-1askbkw",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "faq",
        name: "FAQ",
        selector: "section.framer-1bmqxb9",
        style: null,
        blocks: ["accordion"],
        defaultContent: ["section.framer-1bmqxb9 h2", "section.framer-1bmqxb9 .framer-hf713p p"]
      },
      {
        id: "final-cta",
        name: "Final CTA",
        selector: "section.framer-7udm7i",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_landing_page_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_landing_page_exports);
})();
