import { useEffect } from "react";
import { useLanguage } from "@context/LanguageContext";

/*
 * Automatic translation fallback for legacy/literal UI text.
 *
 * i18next/LanguageContext remains the preferred source for important UI copy.
 * This layer covers visible text that has not yet been migrated. It first uses
 * the local dictionary, then falls back to Google Translate's public translation
 * endpoint. Results are cached in localStorage so repeated renders do not keep
 * requesting the same text.
 *
 * We intentionally skip URLs, email addresses, code-like text, scripts/styles,
 * and very long text blocks. When the remote service is unavailable, the original
 * English text stays visible instead of breaking the page.
 */

const CACHE_KEY = "osta_auto_translation_cache_v1";
const MAX_TEXT_LENGTH = 300;
const REQUEST_DELAY_MS = 80;

const originalText = new WeakMap();
const originalAttributes = new WeakMap();

function readCache() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCache(cache) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage quota/private-mode failures. Translation still works.
  }
}

const cache = readCache();

function looksTranslatable(value) {
  if (!value || value.length > MAX_TEXT_LENGTH) return false;
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(value)) return false;
  if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(value)) return false;
  if (/^[\d\s.,:%+$#@()\-_/]+$/.test(value)) return false;
  if (/^[{}()[\]<>\\/;:=+*_`"'|&^~.-]+$/.test(value)) return false;
  return /[A-Za-z]/.test(value);
}

function dictionaryTranslation(value, language, t) {
  const translated = t(value);
  return translated && translated !== value ? translated : value;
}

async function remoteTranslate(text, targetLanguage) {
  if (targetLanguage === "en") return text;

  const key = `${targetLanguage}::${text}`;
  if (cache[key]) return cache[key];

  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "auto");
  url.searchParams.set("tl", targetLanguage);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`translation request failed: ${response.status}`);

    const data = await response.json();
    const translated = Array.isArray(data?.[0])
      ? data[0]
          .map((part) => part?.[0])
          .filter(Boolean)
          .join("")
          .trim()
      : "";

    if (!translated || translated === text) return text;

    cache[key] = translated;
    writeCache(cache);
    return translated;
  } catch (error) {
    console.warn("OSTA automatic translation unavailable for a text node.", error);
    return text;
  }
}

export default function LanguageAutoTranslator() {
  const { language, t } = useLanguage();

  useEffect(() => {
    if (typeof document === "undefined" || !document.body) return undefined;

    let cancelled = false;
    let timer = null;
    let running = false;

    const collectTextNodes = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );
      const nodes = [];
      let node;

      while ((node = walker.nextNode())) nodes.push(node);
      return nodes;
    };

    const translate = async () => {
      if (running || cancelled) return;
      running = true;

      try {
        const nodes = collectTextNodes();
        const pending = [];

        for (const textNode of nodes) {
          const parent = textNode.parentElement;
          if (!parent || parent.closest("script,style,noscript,svg")) continue;

          const current = textNode.nodeValue || "";
          const trimmed = current.trim();
          if (!looksTranslatable(trimmed)) continue;

          if (!originalText.has(textNode)) originalText.set(textNode, trimmed);
          const source = originalText.get(textNode);

          if (language === "en") {
            if (trimmed !== source) {
              textNode.nodeValue = current.replace(trimmed, source);
            }
            continue;
          }

          const local = dictionaryTranslation(source, language, t);
          if (local !== source) {
            textNode.nodeValue = current.replace(trimmed, local);
            continue;
          }

          const key = `${language}::${source}`;
          if (cache[key]) {
            textNode.nodeValue = current.replace(trimmed, cache[key]);
            continue;
          }

          pending.push({ textNode, source });
        }

        for (const item of pending) {
          if (cancelled) break;
          const translated = await remoteTranslate(item.source, language);
          if (cancelled || !item.textNode.isConnected) continue;

          const current = item.textNode.nodeValue || "";
          const trimmed = current.trim();
          if (trimmed === item.source) {
            item.textNode.nodeValue = current.replace(trimmed, translated);
          }

          await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
        }

        document
          .querySelectorAll("input[placeholder], textarea[placeholder], [aria-label], [title]")
          .forEach((element) => {
            if (!originalAttributes.has(element)) originalAttributes.set(element, {});
            const originals = originalAttributes.get(element);

            for (const attr of ["placeholder", "aria-label", "title"]) {
              const current = element.getAttribute(attr);
              if (!current || !looksTranslatable(current)) continue;
              if (!originals[attr]) originals[attr] = current;

              const source = originals[attr];
              if (language === "en") {
                element.setAttribute(attr, source);
                continue;
              }

              const local = dictionaryTranslation(source, language, t);
              if (local !== source) {
                element.setAttribute(attr, local);
                continue;
              }

              const key = `${language}::${source}`;
              if (cache[key]) {
                element.setAttribute(attr, cache[key]);
              }
            }
          });
      } finally {
        running = false;
      }
    };

    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void translate();
      }, 50);
    };

    schedule();

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [language, t]);

  return null;
}
