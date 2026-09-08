import { useEffect } from "react";
import { useLanguage } from "@context/LanguageContext";

// Legacy pages still contain literal UI strings. Keep one immutable source
// value for every node so switching EN -> AM -> OM never translates a
// previously translated value a second time.
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
    "Certificate of completion": "የማጠናቀቂያ ምስክር ወረቀት",
    "What a completed OSTA course certificate looks like": "የተጠናቀቀ የኦስታ ኮርስ ምስክር ወረቀት ምሳሌ",
    "Courses": "ኮርሶች",
    "Only PDF books are supported.": "የPDF መጻሕፍት ብቻ ይደገፋሉ።",
    Assignments: "የቤት ስራዎች",
    "Not Submitted": "አልቀረበም",
    Submitted: "ቀርቧል",
    "Late Submission": "ዘግይቶ ቀርቧል",
    Graded: "ተገምግሟል",
    Overdue: "ጊዜው አልፏል",
    Total: "ጠቅላላ",
    Search: "ፈልግ",
    "Search assignments...": "የቤት ስራዎችን ፈልግ...",
    All: "ሁሉም",
    Loading: "በመጫን ላይ",
    "Loading your assignments...": "የቤት ስራዎችዎን በመጫን ላይ...",
    "Unable to load assignments": "የቤት ስራዎችን መጫን አልተቻለም",
    "Try Again": "እንደገና ይሞክሩ",
    Refresh: "አድስ",
    "Refreshing...": "በማደስ ላይ...",
    Students: "ተማሪዎች",
    "My Courses": "ኮርሶቼ",
    "My Students": "ተማሪዎቼ",
    Dashboard: "ዳሽቦርድ",
    Profile: "መገለጫ",
    Lessons: "ትምህርቶች",
    Competitions: "ውድድሮች",
    Competition: "ውድድር",
    Community: "ማህበረሰብ",
    Research: "ምርምር",
    Publications: "ህትመቶች",
    Researchers: "ተመራማሪዎች",
    "Innovation Hub": "የፈጠራ ማዕከል",
    Startups: "ጀማሪ ድርጅቶች",
    Ideas: "ሀሳቦች",
    Innovation: "ፈጠራ",
    "Create Publication": "ህትመት ይፍጠሩ",
    "New Publication": "አዲስ ህትመት",
    "Publish Research": "ምርምር ያትሙ",
    "Write a post": "ጽሁፍ ይጻፉ",
    "Create Post": "ጽሁፍ ይፍጠሩ",
    "Join Community": "ማህበረሰቡን ይቀላቀሉ",
    "View All": "ሁሉንም ይመልከቱ",
    "View Details": "ዝርዝር ይመልከቱ",
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
    "No results found.": "ምንም ውጤት አልተገኘም።",
    "No data available": "ምንም መረጃ የለም",
    "Failed to fetch": "መረጃን ማምጣት አልተቻለም",
    "Failed to load": "መጫን አልተቻለም",
    Due: "የመጨረሻ ቀን",
    Max: "ከፍተኛ",
    pts: "ነጥቦች",
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
    "Certificate of completion": "Ragaa Xumuraa",
    "What a completed OSTA course certificate looks like": "Fakkeenya ragaa xumura koorsii OSTA",
    Assignments: "Hojii manaa",
    "Not Submitted": "Hin dhiyaanne",
    Submitted: "Dhiyaate",
    "Late Submission": "Yeroo darbee dhiyaate",
    Graded: "Qoratame",
    Overdue: "Yeroon isaa darbe",
    Total: "Waliigala",
    Search: "Barbaadi",
    "Search assignments...": "Hojii mana barbaadi...",
    All: "Hunda",
    Loading: "Fe'amaa jira",
    "Loading your assignments...": "Hojii mana kee fe'amaa jira...",
    "Unable to load assignments": "Hojii mana fe'uu hin dandeenye",
    "Try Again": "Irra deebi'ii yaali",
    Refresh: "Haaromsi",
    "Refreshing...": "Haaromsaa jira...",
    Students: "Barattoota",
    "My Courses": "Koorsota koo",
    "My Students": "Barattoota koo",
    Dashboard: "Daashboordii",
    Profile: "Profaayilii",
    Lessons: "Barnoota",
    Courses: "Koorsota",
    Competitions: "Dorgommiiwwan",
    Competition: "Dorgommii",
    Community: "Hawaasa",
    Research: "Qorannoo",
    Publications: "Maxxansaalee",
    Researchers: "Qorattoota",
    "Innovation Hub": "Wiirtuu Kalaqaa",
    Startups: "Dhaabbilee haaraa",
    Ideas: "Yaadota",
    Innovation: "Kalaqa",
    "Create Publication": "Maxxansa uumi",
    "New Publication": "Maxxansa haaraa",
    "Publish Research": "Qorannoo maxxansi",
    "Write a post": "Barreeffama barreessi",
    "Create Post": "Barreeffama uumi",
    "Join Community": "Hawaasa seeni",
    "View All": "Hunda ilaali",
    "View Details": "Bal'ina ilaali",
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
    "No results found.": "Bu'aan hin argamne.",
    "No data available": "Daataan hin jiru",
    "Failed to fetch": "Daataa fiduu hin dandeenye",
    "Failed to load": "Fe'uu hin dandeenye",
    Due: "Guyyaa xumuraa",
    Max: "Ol'aanaa",
    pts: "qabxii",
  },
};

function translateValue(value, language, t) {
  const extra = EXTRA[language] || {};
  return extra[value] || t(value) || value;
}

export default function LanguageAutoTranslator() {
  const { language, t } = useLanguage();

  useEffect(() => {
    const translate = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let node;
      while ((node = walker.nextNode())) nodes.push(node);

      for (const textNode of nodes) {
        if (textNode.parentElement?.closest("script,style,noscript")) continue;
        const current = textNode.nodeValue;
        const trimmed = current.trim();
        if (!trimmed || trimmed.length > 120) continue;
        if (/^(https?:\/\/|\/|[\w.-]+@)/.test(trimmed)) continue;
        if (!textNode.dataset.ostaOriginalText) textNode.dataset.ostaOriginalText = trimmed;
        const original = textNode.dataset.ostaOriginalText;
        const translated = translateValue(original, language, t);
        if (translated !== current) textNode.nodeValue = current.replace(trimmed, translated);
      }

      document.querySelectorAll("input[placeholder], textarea[placeholder], [aria-label]").forEach((el) => {
        for (const attr of ["placeholder", "aria-label"]) {
          const current = el.getAttribute(attr);
          if (!current || current.length > 120) continue;
          const key = `ostaOriginal${attr === "placeholder" ? "Placeholder" : "AriaLabel"}`;
          if (!el.dataset[key]) el.dataset[key] = current;
          const original = el.dataset[key];
          const translated = translateValue(original, language, t);
          if (translated !== current) el.setAttribute(attr, translated);
        }
      });
    };

    translate();
    const observer = new MutationObserver(() => translate());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language, t]);

  return null;
}
