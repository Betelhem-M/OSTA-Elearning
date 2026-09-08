import { useEffect } from "react";
import { useLanguage } from "@context/LanguageContext";

// Legacy pages still contain literal UI strings. This bridge translates exact
// UI labels through the same global language preference until those components
// are migrated to t(). It intentionally ignores long/dynamic content.
const EXTRA = {
  am: {
    Assignments: "የቤት ስራዎች",
    "Not Submitted": "አልቀረበም",
    Submitted: "ቀርቧል",
    "Late Submission": "ዘግይቶ ቀርቧል",
    Graded: "ተገምግሟል",
    Overdue: "ጊዜው አልፏል",
    Total: "ጠቅላላ",
    Search: "ፈልግ",
    "Search assignments...": "የቤት ስራዎችን ፈልግ...",
    "All": "ሁሉም",
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
    Courses: "ኮርሶች",
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
    "Due": "የመጨረሻ ቀን",
    "Max": "ከፍተኛ",
    "pts": "ነጥቦች"
  },
  om: {
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
    pts: "qabxii"
  }
};

export default function LanguageAutoTranslator() {
  const { language, t } = useLanguage();

  useEffect(() => {
    const translate = () => {
      const extra = EXTRA[language] || {};
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let node;
      while ((node = walker.nextNode())) nodes.push(node);

      for (const textNode of nodes) {
        const value = textNode.nodeValue;
        const trimmed = value.trim();
        if (!trimmed || trimmed.length > 120) continue;
        if (/^(https?:\/\/|\/|[\w.-]+@)/.test(trimmed)) continue;
        const translated = Object.prototype.hasOwnProperty.call(extra, trimmed)
          ? extra[trimmed]
          : t(trimmed);
        if (translated && translated !== trimmed) {
          textNode.nodeValue = value.replace(trimmed, translated);
        }
      }

      document.querySelectorAll("input[placeholder], textarea[placeholder], [aria-label]").forEach((el) => {
        for (const attr of ["placeholder", "aria-label"]) {
          const value = el.getAttribute(attr);
          if (!value || value.length > 120) continue;
          const translated = extra[value] || t(value);
          if (translated && translated !== value) el.setAttribute(attr, translated);
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
