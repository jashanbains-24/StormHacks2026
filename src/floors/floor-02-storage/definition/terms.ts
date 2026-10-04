import type { FloorGlossaryEntry } from "../../../core/contracts";

export interface TeachingTerm {
  id: string;
  title: string;
  definition: string;
  analogy: string;
  realWorld?: string;
}

export const teachingTerms: readonly TeachingTerm[] = [
  {
    id: "f02.database",
    title: "Database",
    definition:
      "The place that stores all the app's permanent data (products, prices, users).",
    analogy: "A giant filing cabinet.",
    realWorld: "PostgreSQL / MySQL",
  },
  {
    id: "f02.query",
    title: "Query",
    definition: "A request asking the database for specific data.",
    analogy: "Asking the librarian for one book.",
  },
  {
    id: "f02.db_load",
    title: "DB load",
    definition: "How much work the database is doing at once.",
    analogy: "How busy the librarian is.",
  },
  {
    id: "f02.cache",
    title: "Cache",
    definition:
      "A fast temporary copy of data kept close by so you don't ask the database every time.",
    analogy:
      "Keeping your most-used notes on your desk instead of walking to the archive.",
    realWorld: "Redis / Memcached",
  },
  {
    id: "f02.app_server",
    title: "App server",
    definition:
      "The computer running your app's code that talks to users and the database.",
    analogy: "A waiter between customers and the kitchen.",
  },
  {
    id: "f02.load_balancer",
    title: "Load balancer",
    definition:
      "Spreads incoming users across several servers. This is the Floor 1 traffic cop.",
    analogy: "The host who seats guests at different tables.",
    realWorld: "NGINX / AWS ELB",
  },
  {
    id: "f02.local_cache",
    title: "Local cache",
    definition: "A separate cache stored inside each individual server.",
    analogy: "Every waiter keeping their own personal notepad.",
  },
  {
    id: "f02.shared_cache",
    title: "Shared cache",
    definition: "One cache that all servers read from and write to.",
    analogy: "One whiteboard the whole staff looks at.",
    realWorld: "Redis / Memcached",
  },
  {
    id: "f02.browser_cache",
    title: "Browser cache",
    definition: "Data saved on the user's own device.",
    analogy: "A sticky note the customer keeps at home.",
  },
  {
    id: "f02.mismatch",
    title: "Mismatch",
    definition: "Different users seeing different answers for the same thing.",
    analogy: "Two waiters quoting two different prices.",
  },
  {
    id: "f02.cache_hit",
    title: "Cache hit / miss",
    definition:
      "Hit = the answer was found in the cache. Miss = it was not, so ask the database.",
    analogy: "Finding the note on your desk vs. walking to the archive.",
  },
  {
    id: "f02.ttl",
    title: "TTL (time to live)",
    definition:
      "How long a cached item is kept before it expires and must be refreshed.",
    analogy: "The expiry date on milk.",
  },
  {
    id: "f02.stale_data",
    title: "Stale data",
    definition: "Out-of-date data still being shown.",
    analogy: "Yesterday's menu still posted on the door.",
  },
  {
    id: "f02.freshness",
    title: "Freshness vs. speed",
    definition: "Longer caching is faster but riskier for outdated info.",
    analogy: "Checking a fridge less often saves time but risks spoiled food.",
  },
];

export const teachingTermById: Readonly<Record<string, TeachingTerm>> =
  Object.fromEntries(teachingTerms.map((term) => [term.id, term]));

export const glossaryEntries: FloorGlossaryEntry[] = teachingTerms.map(
  (term) => ({
    id: term.id,
    term: term.title,
    definition: term.definition,
    analogy: term.analogy,
    realWorld: term.realWorld,
  }),
);

export const glossaryById: Readonly<Record<string, FloorGlossaryEntry>> =
  Object.fromEntries(glossaryEntries.map((entry) => [entry.id, entry]));
