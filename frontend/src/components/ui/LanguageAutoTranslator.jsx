import { useEffect } from "react";
import { useLanguage } from "@context/LanguageContext";

/*
 * Automatic translation fallback for legacy/literal UI text.
 *
 * Important UI copy should still use LanguageContext/i18next. This fallback
 * automatically translates visible English text that has not been migrated yet.
 * It watches React's DOM changes, retries failed requests, caches successful
 * translations, and always leaves the original text visible when translation
 * is unavailable.
 */

const CACHE_KEY = "osta_auto_translation_cache_v2";
const MAX_TEXT_LENGTH = 300;
const MAX_REQUESTS_PER_PASS = 40;
const REQUEST_CONCURRENCY = 4;
const RETRY_COUNT = 2;

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
    // Storage is only an optimization; translation continues without it.
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

function localTranslation(value, language, t) {
  if (language === "en") return value;
  const translated = t(value);
  return translated && translated !== value ? translated : value;
}

function parseGoogleResponse(data) {
  return Array.isArray(data?.[0])
    ? data[0]
        .map((part) => part?.[0])
        .filter(Boolean)
        .join("")
        .trim()
    : "";
}

function parseMyMemoryResponse(data) {
  return data?.responseData?.translatedText
    ? String(data.responseData.translatedText).trim()
    : "";
}

async function requestJson(url, signal) {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) throw new Error(`translation request failed: ${response.status}`);
  return response.json();
}

async function remoteTranslate(text, targetLanguage) {
  if (targetLanguage === "en") return text;

  const key = `${targetLanguage}::${text}`;
  if (cache[key]) return cache[key];

  for (let attempt = 0; attempt <= RETRY_COUNT; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    try {
      const googleUrl = new URL("https://translate.googleapis.com/translate_a/single");
      googleUrl.searchParams.set("client", "gtx");
      googleUrl.searchParams.set("sl", "auto");
      googleUrl.searchParams.set("tl", targetLanguage);
      googleUrl.searchParams.set("dt", "t");
      googleUrl.searchParams.set("q", text);

      try {
        const googleData = await requestJson(googleUrl.toString(), controller.signal);
        const googleTranslation = parseGoogleResponse(googleData);
        if (googleTranslation && googleTranslation !== text) {
          cache[key] = googleTranslation;
          writeCache(cache);
          return googleTranslation;
        }
      } catch {
        // Try the second translation provider below.
      }

      const memoryUrl = new URL("https://api.mymemory.translated.net/get");
      memoryUrl.searchParams.set("q", text);
      memoryUrl.searchParams.set("langpair", `en|${targetLanguage}`);

      const memoryData = await requestJson(memoryUrl.toString(), controller.signal);
      const memoryTranslation = parseMyMemoryResponse(memoryData);
      if (memoryTranslation && memoryTranslation !== text) {
        cache[key] = memoryTranslation;
        writeCache(cache);
        return memoryTranslation;
      }
    } catch (error) {
      if (attempt === RETRY_COUNT) {
        console.warn("OSTA automatic translation unavailable.", error);
      }
    } finally {
      window.clearTimeout(timeout);
    }

    if (attempt < RETRY_COUNT) {
      await new Promise((resolve) => window.setTimeout(resolve, 350 * (attempt + 1)));
    }
  }

  return text;
}

async function translateInBatches(items, language, cancelled) {
  let cursor = 0;

  const worker = async () => {
    while (!cancelled() && cursor < items.length) {
      const index = cursor;
      cursor += 1;
      const item = items[index];

      const translated = await remoteTranslate(item.source, language);
      if (cancelled() || !item.node.isConnected) continue;

      const current = item.node.nodeValue || "";
      const trimmed = current.trim();
      if (trimmed === item.source && translated !== item.source) {
        item.node.nodeValue = current.replace(trimmed, translated);
      }
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(REQUEST_CONCURRENCY, items.length) },
      () => worker()
    )
  );
}

export default function LanguageAutoTranslator() {
  const { language, t } = useLanguage();

  useEffect(() => {
    if (typeof document === "undefined" || !document.body) return undefined;

    let cancelled = false;
    let timer = null;
    let running = false;
    let dirty = false;

    const collectTextNodes = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let node;
      while ((node = walker.nextNode())) nodes.push(node);
      return nodes;
    };

    const translate = async () => {
      if (running || cancelled) {
        dirty = true;
        return;
      }

      running = true;
      dirty = false;

      try {
        const pending = [];

        for (const textNode of collectTextNodes()) {
          const parent = textNode.parentElement;
          if (!parent || parent.closest("script,style,noscript,svg")) continue;

          const current = textNode.nodeValue || "";
          const trimmed = current.trim();
          if (!looksTranslatable(trimmed)) continue;

          if (!originalText.has(textNode)) originalText.set(textNode, trimmed);
          const source = originalText.get(textNode);

          if (language === "en") {
            if (trimmed !== source) textNode.nodeValue = current.replace(trimmed, source);
            continue;
          }

          const local = localTranslation(source, language, t);
          if (local !== source) {
            textNode.nodeValue = current.replace(trimmed, local);
            continue;
          }

          const key = `${language}::${source}`;
          if (cache[key]) {
            textNode.nodeValue = current.replace(trimmed, cache[key]);
            continue;
          }

          if (pending.length < MAX_REQUESTS_PER_PASS) {
            pending.push({ node: textNode, source });
          }
        }

        await translateInBatches(pending, language, () => cancelled);

        const elements = document.querySelectorAll(
          "input[placeholder], textarea[placeholder], [aria-label], [title]"
        );

        for (const element of elements) {
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

            const local = localTranslation(source, language, t);
            const key = `${language}::${source}`;
            const translated = local !== source ? local : cache[key];
            if (translated && translated !== source) {
              element.setAttribute(attr, translated);
              continue;
            }

            const remote = await remoteTranslate(source, language);
            if (remote !== source) element.setAttribute(attr, remote);
          }
        }
      } finally {
        running = false;
        if (dirty && !cancelled) schedule();
      }
    };

    const schedule = () => {
      dirty = true;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        dirty = false;
        void translate();
      }, 75);
    };

    schedule();

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [language, t]);

  return null;
}
