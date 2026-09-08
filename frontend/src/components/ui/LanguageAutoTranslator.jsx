import { useEffect } from "react";
import { useLanguage } from "@context/LanguageContext";

/*
 * OSTA uses one language source of truth: LanguageContext.t().
 * This helper covers legacy literal UI strings that have not yet been migrated
 * to t(). It deliberately does NOT use an AI service at runtime: asynchronous
 * AI translation would cause flicker, mixed languages, and race conditions when
 * React re-renders. AI can be used to prepare/expand this dictionary, while the
 * running application remains deterministic and consistent.
 */
const EXTRA = {
  am: {
    Books: "መጻሕፍት",
    "Upload Books": "መጻሕፍት ስቀል",
    "Upload Book": "መጽሐፍ ስቀል",
    "Book title": "የመጽሐፍ ርዕስ",
    Author: "ደራሲ",
    Description: "መግለጫ",
    "Choose PDF book": "የPDF መጽሐፍ ምረጥ",
    "Read online": "በመስመር ላይ አንብብ",
    Download: "አውርድ",
    "Register to download": "ለማውረድ ይመዝገቡ",
    "Certificate of Completion": "የማጠናቀቂያ ምስክር ወረቀት",
    Assignments: "የቤት ስራዎች",
    Students: "ተማሪዎች",
    "My Courses": "ኮርሶቼ",
    "My Students": "ተማሪዎቼ",
    Dashboard: "ዳሽቦርድ",
    Profile: "መገለጫ",
    Lessons: "ትምህርቶች",
    Courses: "ኮርሶች",
    Competitions: "ውድድሮች",
    Community: "ማህበረሰብ",
    Research: "ምርምር",
    Publications: "ህትመቶች",
    Researchers: "ተመራማሪዎች",
    "Innovation Hub": "የፈጠራ ማዕከል",
    Startups: "ጀማሪ ድርጅቶች",
    Ideas: "ሀሳቦች",
    Innovation: "ፈጠራ",
    Submit: "አስገባ",
    Save: "አስቀምጥ",
    Cancel: "ሰርዝ",
    Delete: "ሰርዝ",
    Edit: "አርም",
    Create: "ፍጠር",
    Back: "ተመለስ",
    Next: "ቀጣይ",
    Previous: "ቀዳሚ",
    Close: "ዝጋ",
    Open: "ክፈት",
    Search: "ፈልግ",
    Loading: "በመጫን ላይ",
    Refresh: "አድስ",
    "Try Again": "እንደገና ይሞክሩ",
    "No results found.": "ምንም ውጤት አልተገኘም።",
    "No data available": "ምንም መረጃ የለም",
    "Failed to load": "መጫን አልተቻለም",
  },
  om: {
    Books: "Kitaabota",
    "Upload Books": "Kitaabota olkaa'i",
    "Upload Book": "Kitaaba olkaa'i",
    "Book title": "Mata-duree kitaabaa",
    Author: "Barreessaa",
    Description: "Ibsa",
    "Choose PDF book": "Kitaaba PDF filadhu",
    "Read online": "Toora interneetii irratti dubbisi",
    Download: "Buusi",
    "Register to download": "Buusuuf galmaa'i",
    "Certificate of Completion": "Ragaa Xumuraa",
    Assignments: "Hojii manaa",
    Students: "Barattoota",
    "My Courses": "Koorsota koo",
    "My Students": "Barattoota koo",
    Dashboard: "Daashboordii",
    Profile: "Profaayilii",
    Lessons: "Barnoota",
    Courses: "Koorsota",
    Competitions: "Dorgommiiwwan",
    Community: "Hawaasa",
    Research: "Qorannoo",
    Publications: "Maxxansaalee",
    Researchers: "Qorattoota",
    "Innovation Hub": "Wiirtuu Kalaqaa",
    Startups: "Dhaabbilee haaraa",
    Ideas: "Yaadota",
    Innovation: "Kalaqa",
    Submit: "Dhiyeessi",
    Save: "Olkaa'i",
    Cancel: "Haqi",
    Delete: "Haqi",
    Edit: "Gulaali",
    Create: "Uumi",
    Back: "Duubatti",
    Next: "Itti aanu",
    Previous: "Kan duraa",
    Close: "Cufi",
    Open: "Bani",
    Search: "Barbaadi",
    Loading: "Fe'amaa jira",
    Refresh: "Haaromsi",
    "Try Again": "Irra deebi'ii yaali",
    "No results found.": "Bu'aan hin argamne.",
    "No data available": "Daataan hin jiru",
    "Failed to load": "Fe'uu hin dandeenye",
  },
};

const originalText = new WeakMap();
const originalAttributes = new WeakMap();

function translateValue(value, language, t) {
  const extra = EXTRA[language] || {};
  return extra[value] || t(value) || value;
}

export default function LanguageAutoTranslator() {
  const { language, t } = useLanguage();

  useEffect(() => {
    if (typeof document === "undefined" || !document.body) return undefined;

    const translate = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );
      const nodes = [];
      let node;

      while ((node = walker.nextNode())) nodes.push(node);

      for (const textNode of nodes) {
        const parent = textNode.parentElement;
        if (!parent || parent.closest("script,style,noscript")) continue;

        const current = textNode.nodeValue || "";
        const trimmed = current.trim();
        if (!trimmed || trimmed.length > 120) continue;
        if (/^(https?:\/\/|\/|[\w.-]+@)/.test(trimmed)) continue;

        // Text nodes do not have dataset. WeakMap safely associates the original
        // English value with the node without mutating React's DOM ownership.
        if (!originalText.has(textNode)) originalText.set(textNode, trimmed);
        const source = originalText.get(textNode);
        const translated = language === "en" ? source : translateValue(source, language, t);

        if (translated && translated !== trimmed) {
          textNode.nodeValue = current.replace(trimmed, translated);
        } else if (language === "en" && trimmed !== source) {
          textNode.nodeValue = current.replace(trimmed, source);
        }
      }

      document
        .querySelectorAll("input[placeholder], textarea[placeholder], [aria-label]")
        .forEach((element) => {
          if (!originalAttributes.has(element)) originalAttributes.set(element, {});
          const originals = originalAttributes.get(element);

          for (const attr of ["placeholder", "aria-label"]) {
            const current = element.getAttribute(attr);
            if (!current || current.length > 120) continue;
            if (!originals[attr]) originals[attr] = current;

            const source = originals[attr];
            const translated = language === "en" ? source : translateValue(source, language, t);
            if (translated && translated !== current) element.setAttribute(attr, translated);
          }
        });
    };

    translate();

    const observer = new MutationObserver(() => {
      try {
        translate();
      } catch (error) {
        console.warn("OSTA language translation skipped a transient DOM update.", error);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language, t]);

  return null;
}
