import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { liveTranslationPhrases } from '../utils/liveTranslationPhrases';

const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'NOSCRIPT']);
const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'aria-label', 'title', 'alt', 'value'];

const normalize = (value) => value.replace(/\s+/g, ' ').trim();

const withOriginalSpacing = (currentValue, translatedValue) => {
  const leading = currentValue.match(/^\s*/)?.[0] || '';
  const trailing = currentValue.match(/\s*$/)?.[0] || '';
  return `${leading}${translatedValue}${trailing}`;
};

const getElementAttributeStore = (element) => {
  if (!originalAttributes.has(element)) {
    originalAttributes.set(element, {});
  }

  return originalAttributes.get(element);
};

const shouldSkipNode = (node) => {
  const parent = node.parentElement;
  if (!parent) {
    return true;
  }

  if (SKIP_TAGS.has(parent.tagName)) {
    return true;
  }

  return parent.closest('[data-no-live-translate="true"]');
};

const translateTextNode = (node, phrases, language) => {
  if (shouldSkipNode(node)) {
    return;
  }

  const currentValue = node.nodeValue || '';
  const normalizedCurrentValue = normalize(currentValue);
  if (!normalizedCurrentValue) {
    return;
  }

  if (!originalText.has(node) && liveTranslationPhrases.te[normalizedCurrentValue]) {
    originalText.set(node, currentValue);
  }

  if (!originalText.has(node)) {
    return;
  }

  const sourceValue = originalText.get(node);
  if (language === 'en') {
    if (currentValue !== sourceValue) {
      node.nodeValue = sourceValue;
    }
    return;
  }

  const translatedValue = phrases[normalize(sourceValue)];
  if (translatedValue) {
    const nextValue = withOriginalSpacing(sourceValue, translatedValue);
    if (currentValue !== nextValue) {
      node.nodeValue = nextValue;
    }
  }
};

const translateAttributes = (element, phrases, language) => {
  if (SKIP_TAGS.has(element.tagName) || element.closest('[data-no-live-translate="true"]')) {
    return;
  }

  const store = getElementAttributeStore(element);

  TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
    if (!element.hasAttribute(attribute)) {
      return;
    }

    if (attribute === 'value' && !['BUTTON', 'OPTION'].includes(element.tagName)) {
      return;
    }

    const currentValue = element.getAttribute(attribute);
    const normalizedCurrentValue = normalize(currentValue || '');
    if (!currentValue || !normalizedCurrentValue) {
      return;
    }

    if (!store[attribute] && liveTranslationPhrases.te[normalizedCurrentValue]) {
      store[attribute] = currentValue;
    }

    if (!store[attribute]) {
      return;
    }

    const sourceValue = store[attribute];
    if (language === 'en') {
      if (currentValue !== sourceValue) {
        element.setAttribute(attribute, sourceValue);
      }
      return;
    }

    const translatedValue = phrases[normalize(sourceValue)];
    if (translatedValue && currentValue !== translatedValue) {
      element.setAttribute(attribute, translatedValue);
    }
  });
};

const translateRoot = (root, phrases, language) => {
  if (!root) {
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode();

  while (textNode) {
    translateTextNode(textNode, phrases, language);
    textNode = walker.nextNode();
  }

  if (root.nodeType === Node.ELEMENT_NODE) {
    translateAttributes(root, phrases, language);
  }

  root.querySelectorAll?.('*').forEach((element) => translateAttributes(element, phrases, language));
};

const LiveLanguageBridge = () => {
  const { language } = useLanguage();

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const phrases = liveTranslationPhrases[language] || {};
    const translate = () => translateRoot(document.body, phrases, language);

    translate();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') {
          translateTextNode(mutation.target, phrases, language);
          return;
        }

        if (mutation.type === 'attributes') {
          translateAttributes(mutation.target, phrases, language);
          return;
        }

        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node, phrases, language);
            return;
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            translateRoot(node, phrases, language);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES
    });

    return () => observer.disconnect();
  }, [language]);

  return null;
};

export default LiveLanguageBridge;
