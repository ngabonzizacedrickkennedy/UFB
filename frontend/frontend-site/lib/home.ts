import type { HomeData } from "@/lib/api";

export const DEFAULT_HOME_DATA: HomeData = {
  hero: {
    kicker: "Unified Finance Bridge · Consulting",
    titleHtml: "Bridging finance to <em>growth</em> for Africa’s ambitious businesses.",
    lead: "A tech-native financial advisory firm helping growth-stage businesses turn numbers into clarity, foresight, and access to capital.",
    primaryLabel: "Start a Conversation",
    primaryHref: "#contact",
    secondaryLabel: "Explore Services",
    secondaryHref: "#services",
    backgroundUrl: null,
  },
  stats: [
    { target: 50, prefix: "", suffix: "+", label: "Businesses supported" },
    { target: 12, prefix: "$", suffix: "M+", label: "Capital facilitated" },
    { target: 3, prefix: "", suffix: "", label: "Service pillars" },
    { target: 100, prefix: "", suffix: "%", label: "Founder-focused" },
  ],
  slides: [
    { heading: "Advisory in action", text: "Sitting alongside founders to turn raw numbers into a clear plan.", imageUrl: null, bg: "linear-gradient(135deg,#03122E,#0a2350)" },
    { heading: "Capital, unlocked", text: "Preparing women-led SMEs to meet investors with confidence.", imageUrl: null, bg: "linear-gradient(135deg,#0a2350,#A07C2C)" },
    { heading: "The Academy", text: "Workshops that build lasting financial capability across teams.", imageUrl: null, bg: "linear-gradient(135deg,#A07C2C,#C9A65A)" },
    { heading: "Across Africa", text: "Bridging expertise and ambition, one business at a time.", imageUrl: null, bg: "linear-gradient(135deg,#223247,#03122E)" },
  ],
  posts: [
    {
      meta: "Funding · 5 min read",
      title: "What investors really look for in African SMEs",
      excerpt: "Beyond the pitch deck — the financial signals that move a “maybe” to a “yes”.",
      imageUrl: null,
      thumb: "linear-gradient(135deg,#03122E,#0a2350)",
      body: [
        "Investors rarely decide on vision alone. Behind every funded business is a set of numbers that tells a credible, consistent story.",
        "Clean books, a defensible model, and a clear view of unit economics do more to build confidence than any single slide ever could.",
      ],
    },
    {
      meta: "Strategy · 4 min read",
      title: "From messy books to a live financial picture",
      excerpt: "How disciplined bookkeeping quietly becomes a decision-making engine.",
      imageUrl: null,
      thumb: "linear-gradient(135deg,#0a2350,#A07C2C)",
      body: [
        "Most founders treat bookkeeping as compliance. The ones who grow fastest treat it as instrumentation.",
        "When your numbers are current and trusted, every decision — pricing, hiring, spending — gets sharper.",
      ],
    },
    {
      meta: "Growth · 6 min read",
      title: "Building an investment-ready data room",
      excerpt: "The documents and models that earn investor confidence fast.",
      imageUrl: null,
      thumb: "linear-gradient(135deg,#A07C2C,#C9A65A)",
      body: [
        "A data room is where momentum is won or lost. Disorganisation reads as risk.",
        "Prepare it before you need it: financials, model, cap table, and the narrative that ties them together.",
      ],
    },
  ],
  contact: {
    email: "info@ufbconsulting.com",
    phone: "+250 781 141 576",
    location: "Kigali, Rwanda",
    web: "www.ufbconsulting.com",
  },
  socials: [],
  authBackgroundUrl: null,
};

export function normalizeHomeData(raw: unknown): HomeData {
  let data: unknown = raw;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = null;
    }
  }
  if (!data || typeof data !== "object") {
    return DEFAULT_HOME_DATA;
  }
  const d = data as Partial<HomeData>;
  return {
    hero: { ...DEFAULT_HOME_DATA.hero, ...(d.hero && typeof d.hero === "object" ? d.hero : {}) },
    stats: Array.isArray(d.stats) ? d.stats : DEFAULT_HOME_DATA.stats,
    slides: Array.isArray(d.slides) ? d.slides : DEFAULT_HOME_DATA.slides,
    posts: Array.isArray(d.posts) ? d.posts : DEFAULT_HOME_DATA.posts,
    contact: { ...DEFAULT_HOME_DATA.contact, ...(d.contact && typeof d.contact === "object" ? d.contact : {}) },
    socials: Array.isArray(d.socials) ? d.socials : DEFAULT_HOME_DATA.socials,
    authBackgroundUrl: typeof d.authBackgroundUrl === "string" ? d.authBackgroundUrl : DEFAULT_HOME_DATA.authBackgroundUrl,
  };
}
