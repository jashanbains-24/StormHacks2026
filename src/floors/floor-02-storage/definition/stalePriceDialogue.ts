import type { FloorDialogueLine } from "../../../core/contracts";

export const stalePriceDialogue = {
  danaPrompt: {
    id: "f02_dana_problem",
    speaker: "specialist",
    speakerName: "Dana // DBA",
    text: "Everyone is loading the same sale item, so the [[f02.database]] runs the exact same [[f02.query]] thousands of times a minute. [[f02.db_load]] is critical and the product page is timing out. What's actually wrong?",
    choices: [
      {
        id: "f02_dana_bigger_database",
        label: "Buy a bigger [[f02.database]]",
      },
      {
        id: "f02_dana_add_cache",
        label: "Add a [[f02.cache]]",
      },
      {
        id: "f02_dana_block_users",
        label: "Block users",
      },
    ],
  },
  danaBiggerDatabase: {
    id: "f02_dana_bigger_feedback",
    speaker: "specialist",
    speakerName: "Dana // DBA",
    text: "A bigger [[f02.database]] would work, but it's expensive, and the same [[f02.query]] would still run thousands of times.",
    glossaryIds: ["f02.cache"],
  },
  danaBlockUsers: {
    id: "f02_dana_block_feedback",
    speaker: "specialist",
    speakerName: "Dana // DBA",
    text: "We'd lose the sales we're trying to make. Blocking people doesn't fix the [[f02.db_load]].",
  },
  danaCacheCorrect: {
    id: "f02_dana_cache_correct",
    speaker: "specialist",
    speakerName: "Dana // DBA",
    text: "Exactly. A [[f02.cache]] remembers the popular answer so the [[f02.database]] can stop repeating the same [[f02.query]]. The orange and green units are the two places it could live.",
    glossaryIds: ["f02.cache"],
  },
  danaWaitingForSam: {
    id: "f02_dana_waiting_sam",
    speaker: "specialist",
    speakerName: "Dana // DBA",
    text: "Sam is placing the cache. The database is still getting the same query over and over.",
  },
  danaWaitingForPriya: {
    id: "f02_dana_waiting_priya",
    speaker: "specialist",
    speakerName: "Dana // DBA",
    text: "Priya has the last question: how long can a sale price stay cached?",
  },
  samBusy: {
    id: "f02_sam_busy",
    speaker: "specialist",
    speakerName: "Sam // Backend",
    text: "Ask Dana what's actually going on first.",
  },
  samPrompt: {
    id: "f02_sam_cache_location",
    speaker: "specialist",
    speakerName: "Sam // Backend",
    text: "Cache acquired. Where should it live?",
    choices: [
      {
        id: "f02_sam_local_cache",
        label: "Local cache",
      },
      {
        id: "f02_sam_shared_cache",
        label: "Shared cache",
      },
      {
        id: "f02_sam_browser_cache",
        label: "Browser-only cache",
      },
    ],
  },
  samBrowserFeedback: {
    id: "f02_sam_browser_feedback",
    speaker: "specialist",
    speakerName: "Sam // Backend",
    text: "A [[f02.browser_cache]] lives on the customer's device. Every new visitor still misses and asks the [[f02.database]], so [[f02.db_load]] stays high.",
  },
  samSharedCorrect: {
    id: "f02_sam_shared_correct",
    speaker: "specialist",
    speakerName: "Sam // Backend",
    text: "One [[f02.shared_cache]]. Every [[f02.app_server]] gets a [[f02.cache_hit]] for the same price, and the [[f02.database]] finally gets a quiet minute.",
    glossaryIds: ["f02.shared_cache"],
  },
  priyaLocalMismatch: {
    id: "f02_priya_local_mismatch",
    speaker: "specialist",
    speakerName: "Priya // Product Ops",
    text: "Two customers refreshed the same page and saw two different prices. That's a [[f02.mismatch]].",
  },
  samLocalExplanation: {
    id: "f02_sam_local_explanation",
    speaker: "specialist",
    speakerName: "Sam // Backend",
    text: "Each [[f02.app_server]] has its own [[f02.local_cache]]. The [[f02.load_balancer]] keeps sending people to different servers, so they see different prices. See Floor 1. Let's try that choice again.",
    glossaryIds: ["f02.load_balancer", "f02.local_cache"],
  },
  priyaBusy: {
    id: "f02_priya_busy",
    speaker: "specialist",
    speakerName: "Priya // Product Ops",
    text: "I'll weigh in once we know where the cache goes.",
  },
  priyaPrompt: {
    id: "f02_priya_ttl",
    speaker: "specialist",
    speakerName: "Priya // Product Ops",
    text: "Customers need the right sale price. How long should a cached price live?",
    choices: [
      {
        id: "f02_priya_one_second",
        label: "1 second",
      },
      {
        id: "f02_priya_one_minute",
        label: "About 1 minute",
      },
      {
        id: "f02_priya_one_day",
        label: "1 day",
      },
    ],
  },
  priyaOneSecondFeedback: {
    id: "f02_priya_one_second_feedback",
    speaker: "specialist",
    speakerName: "Priya // Product Ops",
    text: "The [[f02.cache]] barely helps. [[f02.db_load]] stays high because a 1 second [[f02.ttl]] expires immediately.",
    glossaryIds: ["f02.ttl"],
  },
  priyaOneDayFeedback: {
    id: "f02_priya_one_day_feedback",
    speaker: "specialist",
    speakerName: "Priya // Product Ops",
    text: "We changed the price an hour ago! A one-day [[f02.ttl]] leaves [[f02.stale_data]] on the page.",
    glossaryIds: ["f02.ttl"],
  },
  priyaMinuteCorrect: {
    id: "f02_priya_minute_correct",
    speaker: "specialist",
    speakerName: "Priya // Product Ops",
    text: "About one minute of [[f02.ttl]] balances [[f02.freshness]] and speed. The database can breathe, and customers still see today's price.",
    glossaryIds: ["f02.ttl"],
  },
  danaWrapUp: {
    id: "f02_dana_wrap_up",
    speaker: "specialist",
    speakerName: "Dana // DBA",
    text: "[[f02.db_load]] is normal. One shared [[f02.cache]], a short lifetime, and the product page is answering again. Nice save.",
  },
  danaResolved: {
    id: "f02_dana_resolved",
    speaker: "specialist",
    speakerName: "Dana // DBA",
    text: "The database is calm. The incident is over.",
  },
  samResolved: {
    id: "f02_sam_resolved",
    speaker: "specialist",
    speakerName: "Sam // Backend",
    text: "Shared cache is warm and the app servers finally agree with each other.",
  },
  storageQuiet: {
    id: "f02_storage_quiet",
    speaker: "specialist",
    speakerName: "Dana // DBA",
    text: "The database is quiet. This floor starts having trouble once Floor 1 is solved.",
  },
  priyaResolved: {
    id: "f02_priya_resolved",
    speaker: "specialist",
    speakerName: "Priya // Product Ops",
    text: "Prices are fresh, pages are fast, and customers are seeing the sale price.",
  },
} as const satisfies Record<string, FloorDialogueLine>;

export const stalePriceStatus = {
  standby: "Storage is stable",
  incident: "DB LOAD CRITICAL: product page timing out",
  partial: "CACHE ONLINE: checking prices…",
  resolved: "DB LOAD NORMAL: incident resolved",
  loadBalancerWarning:
    "Floor 1 ripple: the load balancer can send customers to different local caches.",
} as const;
