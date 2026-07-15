import type { HelpArticle, Inline } from "@/lib/data/types";
import { HELP_CATEGORIES } from "@/lib/data/types";

const L = (text: string, href: string): Inline => ({ text, href });

const LOC = "/locations/baptist-memphis";

export const HELP_ARTICLES: HelpArticle[] = [
  // ── Getting Started ────────────────────────────────────────────────
  {
    slug: "understanding-your-lvi",
    title: "Understanding your LVI score",
    category: "Getting Started",
    summary: "What the 0–100 number means, what's inside it, and what actually moves it.",
    readMinutes: 3,
    relatedTerms: ["lvi", "map-pack", "geo-grid", "review-response-rate", "ai-surfaces"],
    blocks: [
      {
        kind: "p",
        body: [
          "LVI stands for Local Visibility Index. It's one number, 0 to 100, that answers a simple question: when someone nearby needs care, how easy is your clinic to find? You'll see it as the donut at the top of your ",
          L("location dashboard", LOC),
          " and next to every clinic on the ",
          L("fleet overview", "/local"),
          ".",
        ],
      },
      { kind: "h2", text: "What's inside the score" },
      {
        kind: "p",
        body: [
          "LVI blends nine signals into one reading. You don't need to memorize them — the donut breaks them out for you — but they fall into a few families:",
        ],
      },
      {
        kind: "bullets",
        items: [
          [
            "How you rank on the map — your ",
            L("geo-grid", `${LOC}/geo-grid`),
            " results across the neighborhoods around your clinic.",
          ],
          [
            "How healthy your ",
            L("reviews", `${LOC}/reviews`),
            " are — rating, volume, and how reliably you reply.",
          ],
          [
            "How complete and accurate your listings are — your ",
            L("Google Business Profile", `${LOC}/gbp-health`),
            ", plus your ",
            L("citations", `${LOC}/citations`),
            " across the web.",
          ],
          [
            "Whether AI assistants mention you — the ",
            L("Local AI lane", `${LOC}/local-ai`),
            " tracks six AI surfaces.",
          ],
        ],
      },
      { kind: "h2", text: "How to read your number" },
      {
        kind: "bullets",
        items: [
          ["80 or above — elite. You're winning most searches near you. Protect it."],
          ["60–79 — healthy. Solid footing, with clear room to grow."],
          ["30–59 — at risk. Competitors are taking searches you could own."],
          ["Below 30 — critical. Patients near you mostly aren't finding you."],
        ],
      },
      { kind: "h2", text: "What actually moves it" },
      {
        kind: "p",
        body: [
          "The score is an outcome, not a dial you turn directly. It moves when the underlying work happens: reviews get answered, wrong phone numbers get fixed, categories get corrected, articles get published. The ",
          L("Action Center", "/action-center"),
          " keeps a ranked list of exactly that work, so the honest answer to 'how do I raise my LVI?' is: do the next thing on that list.",
        ],
      },
      {
        kind: "p",
        body: [
          "A worked example: say Baptist Memphis sits at 62. The donut shows map rankings are fine but review response is lagging and two directories have the old phone number. Clearing the reply queue and approving the NAP fixes won't change the score tomorrow — but over the next cycle or two, both signals recover, and the 62 becomes a 70 for reasons you can actually name.",
        ],
      },
      {
        kind: "note",
        body: [
          "LVI refreshes with each scan cycle, so expect it to move in steps every couple of weeks — not the day after a fix. Slow and steady is normal here.",
        ],
      },
    ],
  },
  {
    slug: "roles-and-permissions",
    title: "Roles and permissions: who can do what",
    category: "Getting Started",
    summary:
      "The three roles — agency, client admin, client user — and where the approval buttons live.",
    readMinutes: 3,
    relatedTerms: ["approval-ladder", "audit-log", "phi-gate"],
    blocks: [
      {
        kind: "p",
        body: [
          "Everyone sees the same numbers here — the roles only decide who can approve changes and who can manage people. There are three:",
        ],
      },
      { kind: "h2", text: "The three roles" },
      { kind: "h3", text: "Client user" },
      {
        kind: "p",
        body: [
          "Most clinic staff. You can see everything about your location — scores, ",
          L("reviews", `${LOC}/reviews`),
          ", the ",
          L("geo-grid", `${LOC}/geo-grid`),
          " — and you can draft things: a review reply, a post idea. What you can't do is press the final Approve button. Your drafts wait in the queue for an admin.",
        ],
      },
      { kind: "h3", text: "Client admin" },
      {
        kind: "p",
        body: [
          "Usually a clinic manager or marketing lead. Everything a client user can do, plus the Approve button: review replies, posts, articles and profile changes all publish on your say-so. Every approval is recorded in the audit log with your name and a timestamp.",
        ],
      },
      { kind: "h3", text: "Agency" },
      {
        kind: "p",
        body: [
          "The operators. Agency users run the machinery that costs money or spans locations — ",
          L("spot checks", "/tools/spot-check"),
          ", citation orders, and ",
          L("cost tracking", "/admin/costs"),
          ". If a button would spend money, it lives on the agency side, always with a cost preview first.",
        ],
      },
      { kind: "h2", text: "Why approvals are gated this way" },
      {
        kind: "p",
        body: [
          "Nothing in this platform auto-posts. Every public change walks the same ladder — preview, human approval, write, audit log entry. For a healthcare organization that's not bureaucracy, it's protection: it means no review reply goes out that hasn't passed the PHI Gate and a human set of eyes.",
        ],
      },
      {
        kind: "p",
        body: [
          "It also keeps the record clean. Six months from now, when someone asks who approved a particular reply or profile change, the answer is one audit-log lookup away — a name, a timestamp, and the exact text that went out. That's a much better conversation than 'we think the system did it automatically.'",
        ],
      },
      { kind: "h2", text: "Checking or changing someone's role" },
      {
        kind: "steps",
        items: [
          ["Open ", L("Settings → Users", "/settings/users"), "."],
          ["Find the person — the Role column shows their current level."],
          ["Admins can invite new users or adjust roles from the same screen; changes are logged."],
        ],
      },
      {
        kind: "note",
        body: [
          "Not sure which role you have? If you can see an Approve button on a queued review reply in the ",
          L("Reviews lane", `${LOC}/reviews`),
          ", you're an admin.",
        ],
      },
    ],
  },

  // ── Rankings & Visibility ──────────────────────────────────────────
  {
    slug: "how-to-read-your-geo-grid",
    title: "How to read your geo-grid",
    category: "Rankings & Visibility",
    summary: "What the colored pins mean, what to click, and how to tell if things are improving.",
    readMinutes: 4,
    relatedTerms: ["geo-grid", "grid-pin", "scan-cycle", "solv", "atrp"],
    blocks: [
      {
        kind: "p",
        body: [
          "Google shows different results depending on where the searcher is standing. Your ",
          L("geo-grid", `${LOC}/geo-grid`),
          " makes that visible: it runs the same search from a grid of points around your clinic and drops a pin at each one showing your rank right there. Read it like a weather map — you're looking for patterns, not individual pins.",
        ],
      },
      { kind: "h2", text: "The colors, in one breath" },
      {
        kind: "bullets",
        items: [
          [
            "Green — you're in the top three there. That's Map Pack territory: most searchers at that spot will see you.",
          ],
          ["Yellow — close, positions 4 to 10 or so. Winnable ground."],
          ["Orange — you're on the list but far down. Few patients scroll that far."],
          ["Red — effectively invisible at that spot. Someone else owns it."],
        ],
      },
      { kind: "h2", text: "A five-minute reading routine" },
      {
        kind: "steps",
        items: [
          [
            "Open your ",
            L("Geo-Grid Scanner", `${LOC}/geo-grid`),
            " and pick the keyword that matters most to you this month.",
          ],
          [
            "Squint at the overall shape first. A green center fading to red at the edges is normal — you rank best near your own front door.",
          ],
          [
            "Look for the odd patch: a red cluster on one side of town usually means a competitor is strong there, not that you did something wrong.",
          ],
          [
            "Click a red or orange pin. The panel shows exactly who outranks you at that spot — now you know who you're actually competing with.",
          ],
          [
            "Open ",
            L("Compare scan cycles", `${LOC}/geo-grid/compare`),
            " and check this cycle against the last one. Pins turning from orange to yellow is progress, even if nothing hit green yet.",
          ],
        ],
      },
      { kind: "h2", text: "The two summary numbers" },
      {
        kind: "p",
        body: [
          "Above the map you'll see SoLV (share of local voice — the percent of pins where you're top three) and ATRP (your average rank across all pins). SoLV tells you how much ground you hold; ATRP tells you whether the whole map is drifting up or down. Watch those two across cycles and you can skip pin-by-pin archaeology.",
        ],
      },
      {
        kind: "note",
        body: [
          "One red pin is noise. The same red patch two cycles in a row is a pattern — and patterns are what the ",
          L("Action Center", "/action-center"),
          " turns into recommended fixes.",
        ],
      },
    ],
  },
  {
    slug: "tracked-vs-scanned-keywords",
    title: "Tracked vs scanned keywords",
    category: "Rankings & Visibility",
    summary: "Two kinds of keywords, two jobs — and how to decide which a new phrase deserves.",
    readMinutes: 3,
    relatedTerms: ["keyword", "scan-cycle", "geo-grid", "spot-check", "service-line"],
    blocks: [
      {
        kind: "p",
        body: [
          "Every keyword in your ",
          L("Keywords lane", `${LOC}/keywords`),
          " is one of two kinds, and the difference is worth thirty seconds to learn: it's the difference between a monitor you watch continuously and a one-time test you order when you have a question.",
        ],
      },
      { kind: "h2", text: "Tracked keywords: the ongoing monitors" },
      {
        kind: "p",
        body: [
          "A tracked keyword gets re-checked across the whole geo-grid in every scan cycle, automatically. That builds history — you can chart 'primary care Memphis' over six months and see whether the citation cleanup moved it. Tracking costs a little every cycle, so the tracked list should stay short and deliberate: the phrases that map to the services your clinic actually wants to grow.",
        ],
      },
      { kind: "h2", text: "Scanned keywords: the one-time spot checks" },
      {
        kind: "p",
        body: [
          "A scanned keyword is checked once, on demand, and doesn't join the recurring schedule. It answers 'what if' questions cheaply: Where do we stand for 'sports physicals'? Did the new pediatrician change anything for 'pediatrician near me'? You get a full grid snapshot without signing up for the recurring cost.",
        ],
      },
      { kind: "h2", text: "Choosing between them" },
      {
        kind: "bullets",
        items: [
          ["Is it a service you'll care about all year? Track it."],
          ["Just curious, or testing a hunch? Scan it once."],
          [
            "A scan came back promising — top ten with room to climb? That's the signal to promote it to tracked and watch it properly.",
          ],
        ],
      },
      { kind: "h2", text: "Requesting a one-time scan" },
      {
        kind: "steps",
        items: [
          [
            "From the ",
            L("Keywords lane", `${LOC}/keywords`),
            ", note the phrase you want checked — real patient language beats industry jargon ('walk in clinic' outperforms 'ambulatory care').",
          ],
          [
            "The agency runs it through the ",
            L("Spot Check console", "/tools/spot-check"),
            " — every scan shows its cost before it runs, so there are no surprise charges.",
          ],
          ["Results land as a grid snapshot you can read exactly like your regular geo-grid."],
        ],
      },
      {
        kind: "note",
        body: [
          "A good rule of thumb: a handful of tracked keywords per service line, scans for everything else. History on the keywords that matter, pocket change for the curiosities.",
        ],
      },
    ],
  },
  {
    slug: "understanding-ai-visibility",
    title: "Understanding AI visibility: the 4+2 surfaces",
    category: "Rankings & Visibility",
    summary:
      "Why patients asking ChatGPT for a doctor matters to you, and why directories decide the answer.",
    readMinutes: 4,
    relatedTerms: ["ai-surfaces", "ai-citation", "directory", "citation"],
    blocks: [
      {
        kind: "p",
        body: [
          "A growing share of patients don't search — they ask. 'Who's a good family doctor near Memphis?' typed into ChatGPT gets a short list of clinics, not ten blue links. If your clinic isn't on that short list, the patient never knows you existed. The ",
          L("Local AI lane", `${LOC}/local-ai`),
          " tracks whether you make those lists.",
        ],
      },
      { kind: "h2", text: "The six surfaces, in two groups" },
      {
        kind: "p",
        body: [
          "We check six AI surfaces, and we deliberately keep them in two groups rather than averaging everything into one number:",
        ],
      },
      {
        kind: "bullets",
        items: [
          [
            "The four chatbots — ChatGPT, Claude, Perplexity and Gemini. Conversational assistants that compose an answer from sources they trust.",
          ],
          [
            "The two Google AI features — AI Overviews and AI Mode, the AI answers built into Google search itself.",
          ],
        ],
      },
      {
        kind: "p",
        body: [
          "They behave differently: Google's features lean heavily on your Google Business Profile and reviews, while chatbots lean on the wider web — directories, articles, anything they can cite. Averaging them would hide exactly the insight you need, which is knowing which group can't see you.",
        ],
      },
      { kind: "h2", text: "Why directories decide the answer" },
      {
        kind: "p",
        body: [
          "Here's the pattern we saw with one of our own clinics, Baptist Memorial Hospital – DeSoto. It ranked respectably on Google Maps — but the chatbots barely mentioned it. The reason wasn't quality or reviews. The clinic was thin or missing on the directories the chatbots cite: Healthgrades here, an outdated listing there. The AI wasn't snubbing the clinic; it literally couldn't find enough trustworthy sources to justify recommending it.",
        ],
      },
      {
        kind: "p",
        body: [
          "That's the unglamorous truth of AI visibility: it's mostly won in the ",
          L("Citations lane", `${LOC}/citations`),
          ". Every directory that lists you accurately is one more source an AI can cite when it builds a recommendation. Fix the citations, and mentions tend to follow — a step behind, like an echo.",
        ],
      },
      { kind: "h2", text: "What to actually do" },
      {
        kind: "steps",
        items: [
          [
            "Open the ",
            L("Local AI lane", `${LOC}/local-ai`),
            " and note which of the two groups is weaker for your clinic.",
          ],
          [
            "Weak on chatbots? Check the AI citations panel — it shows which sources the assistants leaned on, and whether you're in them.",
          ],
          [
            "Close the gaps in the ",
            L("Citations lane", `${LOC}/citations`),
            " first; they're usually the cheapest wins.",
          ],
          ["Give it a few cycles. AI answers refresh slowly — think tide, not light switch."],
        ],
      },
    ],
  },

  // ── Reviews & Content ──────────────────────────────────────────────
  {
    slug: "reply-to-reviews-hipaa-safe",
    title: "Replying to reviews the HIPAA-safe way",
    category: "Reviews & Content",
    summary:
      "The one rule that protects you, what the PHI Gate checks, and how a reply gets published.",
    readMinutes: 4,
    relatedTerms: ["phi-gate", "approval-ladder", "review-response-rate", "audit-log"],
    blocks: [
      {
        kind: "p",
        body: [
          "Replying to reviews is one of the highest-value habits a clinic has — patients read the replies, and Google notices the responsiveness. But healthcare replies carry a rule that surprises most people, so let's start there.",
        ],
      },
      { kind: "h2", text: "The one rule: never confirm they were a patient" },
      {
        kind: "p",
        body: [
          "Under HIPAA, even acknowledging that someone visited your clinic is protected health information. That's true even when the reviewer described their whole appointment themselves. So a reply can never say 'thanks for coming in' or 'we're glad your visit went well' — each of those confirms patienthood. Instead, replies speak generally: 'We appreciate the kind words about our team' works; 'We're glad your blood work went smoothly' absolutely does not.",
        ],
      },
      {
        kind: "note",
        body: [
          "This feels unnatural at first — normal customer service instincts pull the other way. That's exactly why the platform drafts replies for you and checks every one before it can be approved.",
        ],
      },
      { kind: "h2", text: "What the PHI Gate checks" },
      {
        kind: "p",
        body: [
          "Every draft reply passes through the PHI Gate before the Approve button will work. It looks for confirmations of patienthood, mentions of conditions, treatments, appointments or dates, and anything that could tie the reviewer to care they received. If a draft trips the gate, it's sent back for editing — it cannot be approved as-is, no matter who's clicking.",
        ],
      },
      { kind: "h2", text: "How a reply gets published" },
      {
        kind: "steps",
        items: [
          [
            "Open the ",
            L("Reviews lane", `${LOC}/reviews`),
            ". New reviews wait in the queue, worst-first, so the urgent ones surface on top.",
          ],
          [
            "Open a review and read the suggested draft. Positive and neutral replies may naturally mention your location or services; replies to negative reviews stay short, humane and unpromotional — always.",
          ],
          ["Edit if you'd like. The PHI Gate re-checks whatever you change."],
          [
            "Pass the gate, then Approve (client admins). The reply publishes, and the audit log records who approved it and when.",
          ],
        ],
      },
      { kind: "h2", text: "Negative reviews deserve a reply too" },
      {
        kind: "p",
        body: [
          "A calm, generic, kind reply under a harsh review does more good than ten replies under five-star ones — every prospective patient scrolling by sees how you handle criticism. Offer a phone number and an invitation to talk offline. Never argue the details; you legally can't, and it never reads well anyway. Your ",
          L("review trends", `${LOC}/reviews/trends`),
          " page shows how your response rate tracks over time.",
        ],
      },
    ],
  },
  {
    slug: "paa-studio-flow",
    title: "PAA Studio: from patient question to published article",
    category: "Reviews & Content",
    summary:
      "The full pipeline — pick a real question, generate a draft, review it, publish it, post it.",
    readMinutes: 4,
    relatedTerms: ["paa", "content-score", "term-coverage", "e-e-a-t", "approval-ladder"],
    blocks: [
      {
        kind: "p",
        body: [
          "Google's 'People also ask' boxes are a free list of what patients actually want to know — 'Do I need a referral to see a specialist?', 'How much is a physical without insurance?'. PAA Studio turns those questions into published answers, with your clinic as the source. Here's the whole pipeline, start to finish.",
        ],
      },
      { kind: "h2", text: "Step by step" },
      {
        kind: "steps",
        items: [
          [
            "Open ",
            L("PAA Studio", `${LOC}/paa-studio`),
            " for your location. You'll see real questions patients ask in your area, ranked by how often they're asked and how weak the existing answers are.",
          ],
          [
            "Pick a question your clinic can genuinely answer well. The best picks match a service you want to grow — a question about school physicals is gold if that's a push this season.",
          ],
          [
            "Generate the brief. The studio hands the question to ",
            L("the article editor", `${LOC}/paa-studio`),
            " as a structured draft: suggested outline, the terms readers expect covered, and the questions the article should answer.",
          ],
          [
            "Edit in the article editor. The content score updates live as you write — term coverage, structure, medical E-E-A-T checks. Watching the score climb tells you the draft is getting genuinely more complete, not just longer.",
          ],
          [
            "Send it for review. A clinic admin (and clinically-reviewed content should mean exactly that) approves it through the standard ladder — preview, approve, publish, audit log.",
          ],
          [
            "Close the loop with a GBP post. A short ",
            L("post", `${LOC}/posts`),
            " pointing at the new article puts the answer directly on your Google profile, where searchers see it without clicking anywhere.",
          ],
        ],
      },
      { kind: "h2", text: "Why this loop works" },
      {
        kind: "p",
        body: [
          "Each published answer works three jobs at once: it can rank in regular search, it can win the PAA box for that exact question, and it becomes a source AI assistants can cite when someone asks them the same thing. One patient question, answered well, keeps paying rent for years.",
        ],
      },
      {
        kind: "note",
        body: [
          "Quality beats volume here. One genuinely useful article a month, clinically reviewed, outperforms four thin ones — for readers, for Google and for the AI surfaces alike.",
        ],
      },
    ],
  },

  // ── Citations & Listings ───────────────────────────────────────────
  {
    slug: "order-citations-what-happens-next",
    title: "Ordering citations: what happens next",
    category: "Citations & Listings",
    summary:
      "The timeline after you approve a citation order — submission, indexing, and when to expect movement.",
    readMinutes: 3,
    relatedTerms: ["citation", "directory", "data-aggregator", "index-check", "nap"],
    blocks: [
      {
        kind: "p",
        body: [
          "You've approved a citation order in the ",
          L("Citations lane", `${LOC}/citations`),
          " — now what? Citations are the slowest-moving work in local SEO, and knowing the timeline up front saves a lot of 'is this even working?' three weeks in. Here's what happens, in order.",
        ],
      },
      { kind: "h2", text: "The pipeline" },
      {
        kind: "steps",
        items: [
          [
            "Submission. Your clinic's exact NAP — name, address, phone, straight from the verified profile — is submitted to the chosen directories and data aggregators. The aggregators matter most: fix your record there and it flows downstream to hundreds of smaller sites automatically.",
          ],
          [
            "Directory processing. Each site reviews and publishes the listing on its own schedule. Big directories take days; sleepy ones take weeks. The lane shows per-directory status so you can watch them land one by one.",
          ],
          [
            "Index checks. A published listing only helps once Google has found and stored it. The platform runs index checks on each new citation and flags any that Google hasn't picked up after a reasonable window — those get chased rather than forgotten.",
          ],
          [
            "Drift watch. Once live, each citation joins the ongoing ",
            L("NAP monitoring", `${LOC}/citations`),
            ", so if a directory later mangles your phone number, it surfaces as drift instead of quietly rotting.",
          ],
        ],
      },
      { kind: "h2", text: "When to expect movement" },
      {
        kind: "p",
        body: [
          "Rough honest numbers: listings publish over 1–6 weeks, indexing follows over another few weeks, and ranking effects show up across the following scan cycles — think two to three months for the full effect, not two to three days. The effect compounds, though: every accurate citation keeps vouching for your clinic long after it lands.",
        ],
      },
      { kind: "h2", text: "What to do in the meantime" },
      {
        kind: "p",
        body: [
          "Nothing, mostly — and that's fine. The lane's per-directory statuses update as listings land, so resist the urge to re-order the same directories while the first batch is still processing; duplicate submissions can actually slow things down. If a status has sat unchanged well past its window, it's flagged for follow-up automatically, and you can always raise it with the agency team.",
        ],
      },
      {
        kind: "note",
        body: [
          "Citation work is also AI work. The directories being fixed are the same sources chatbots cite when recommending clinics — see ",
          L("Understanding AI visibility", "/learn/help/understanding-ai-visibility"),
          " for that story.",
        ],
      },
    ],
  },
  {
    slug: "nap-drift-why-it-matters",
    title: "NAP drift: why it matters",
    category: "Citations & Listings",
    summary:
      "How your clinic's info quietly goes stale across the web, and how the fix pipeline works.",
    readMinutes: 3,
    relatedTerms: ["nap", "nap-drift", "citation", "data-aggregator", "directory"],
    blocks: [
      {
        kind: "p",
        body: [
          "Your NAP is your clinic's Name, Address and Phone number as they appear across the web. Drift is what happens when those copies stop agreeing — Google says one phone number, Healthgrades says another, an old Yelp listing still shows the suite you moved out of in 2023. It sounds cosmetic. It isn't.",
        ],
      },
      { kind: "h2", text: "The two costs of drift" },
      {
        kind: "p",
        body: [
          "The first cost is human and immediate: a patient finds the stale listing, calls the old number, hits a dead line or the wrong department, and books somewhere else. For a clinic, a wrong phone number on a busy directory is a leak in the schedule, week after week.",
        ],
      },
      {
        kind: "p",
        body: [
          "The second cost is quieter: trust. Google cross-checks your listing against every copy of your info it can find. When the copies agree, it can promote you with confidence. When they disagree, that confidence drops — and confidence is a real ranking input. Enough drift, and a clinic slides down the map without anyone having done anything wrong.",
        ],
      },
      { kind: "h2", text: "How drift gets caught and fixed" },
      {
        kind: "steps",
        items: [
          [
            "Detection. The ",
            L("Citations lane", `${LOC}/citations`),
            " regularly compares every known copy of your info against your verified profile and flags each mismatch — old numbers, stale suites, misspelled names.",
          ],
          [
            "Triage. Mismatches are ranked by how much the site matters. A wrong phone on a major directory outranks a typo on a site nobody visits.",
          ],
          [
            "Fix. Corrections queue as proposed changes — preview, approve, submit, audit log — the same ladder as everything else. Fixes at the aggregator level cascade to the small sites automatically.",
          ],
          [
            "Verify. Fixed listings get re-checked until the correction is actually live, because directories sometimes say yes and do nothing.",
          ],
        ],
      },
      {
        kind: "note",
        body: [
          "Drift is never finished — clinics move, numbers change, directories glitch. The win condition isn't zero drift forever; it's catching each new mismatch in weeks instead of years.",
        ],
      },
    ],
  },

  // ── Reports & Admin ────────────────────────────────────────────────
  {
    slug: "generate-a-report-before-a-meeting",
    title: "Generate a report before a meeting",
    category: "Reports & Admin",
    summary:
      "Five minutes to a shareable PDF — which report to pick for which audience, and how to read it aloud.",
    readMinutes: 3,
    relatedTerms: ["lvi", "solv", "scan-cycle", "audit-log"],
    blocks: [
      {
        kind: "p",
        body: [
          "Board meeting Tuesday, operations huddle Thursday — either way, you want numbers on paper without spending an evening building slides. The reports library does that in about five minutes. Here's the routine, plus a word on which report fits which room, because handing a spreadsheet to a board or a summary page to an analyst are both ways to have a worse meeting than you needed to.",
        ],
      },
      { kind: "h2", text: "Pick the right report for the room" },
      {
        kind: "bullets",
        items: [
          [
            "Fleet LVI Summary — for leadership. Every location's score and trend on a page; great for 'how are we doing overall?'",
          ],
          [
            "Location deep-dive — for a clinic-level meeting. One location, all lanes: rankings, reviews, citations, AI visibility.",
          ],
          [
            "Review health summary — for patient-experience conversations: ratings, volume and response-rate trends.",
          ],
          [
            "Citations export (CSV) — for whoever asks 'can I get that in a spreadsheet?' Someone always does.",
          ],
          [
            "AI visibility evidence pack — receipts for the 'do AI assistants even mention us?' question, surface by surface.",
          ],
        ],
      },
      { kind: "h2", text: "Generating it" },
      {
        kind: "steps",
        items: [
          ["Open the ", L("Reports library", "/system/reports"), "."],
          [
            "Choose the report type and scope — the whole fleet, or a single location like Baptist Memphis.",
          ],
          [
            "Generate, then download. The artifact stays in the library, so next quarter's comparison copy is already there.",
          ],
          [
            "For one clinic's story, the ",
            L("location reports page", `${LOC}/reports`),
            " keeps that location's artifacts in one place.",
          ],
        ],
      },
      { kind: "h2", text: "Reading it aloud without jargon" },
      {
        kind: "p",
        body: [
          "Three translations cover most of the room: LVI is 'our overall findability, 0 to 100'. SoLV is 'the share of nearby searches where we're in the top three'. Scan cycle is 'we re-measure everything every couple of weeks'. Anything deeper, send the room to the ",
          L("glossary", "/learn/glossary"),
          " — it's written for exactly this audience.",
        ],
      },
      {
        kind: "note",
        body: [
          "Generate the report a day early, skim it once, and note the single best and worst number. Meetings go better when you already know where the eyebrows will go up.",
        ],
      },
    ],
  },
  {
    slug: "competitor-who-wins-overlay",
    title: "Reading the Competitor who-wins overlay",
    category: "Rankings & Visibility",
    summary:
      "Turn every grid cell into an answer to one question: who is winning the map pack right there?",
    readMinutes: 4,
    relatedTerms: ["geo-grid", "map-pack", "grid-pin", "solv"],
    blocks: [
      {
        kind: "p",
        body: [
          "The regular grid view answers “where do WE rank?” The who-wins overlay answers the other half: “who is beating us, exactly where?” Toggle it with the ",
          "Competitor who-wins",
          " chip above the map on ",
          L("the Geo-Grid screen", `${LOC}/geo-grid`),
          ".",
        ],
      },
      { kind: "h2", text: "What the colors mean" },
      {
        kind: "bullets",
        items: [
          [
            "Every circle is one real search, run at that exact spot on the map. When the overlay is on, the circle's COLOR tells you which business holds the #1 map-pack spot for searches made there.",
          ],
          [
            "Baptist blue means YOU win that spot — counting your whole listing family. If one of your own physicians' profiles holds #1, that's still a Baptist win, and it shows as blue.",
          ],
          [
            "Each strong rival gets its own color — purple, pink, teal, orange. The legend at the bottom of the map names them and counts how many cells each one owns.",
          ],
          [
            "Gray (“Others”) bundles everyone who only wins a cell or two — not worth memorizing a color for.",
          ],
        ],
      },
      {
        kind: "note",
        body: [
          "The number inside each circle does NOT change — it is still your own rank at that spot. So a purple circle with a 7 reads: “here, a rival holds #1 and we sit at #7.”",
        ],
      },
      { kind: "h2", text: "How to act on it" },
      {
        kind: "steps",
        items: [
          [
            "Look for solid blocks of one rival color. A rival owning a whole neighborhood usually means they out-rank you on proximity or reviews there — check their listing from ",
            L("Local Competitive", `${LOC}/competitive`),
            ".",
          ],
          [
            "Blue center, rival edges is the normal pattern — you win near your address and fade with distance. The fix for edge cells is citations, service-area content, and review volume, not panic.",
          ],
          [
            "If a color you don't recognize owns cells, click any pin to see the live results at that point and find their listing.",
          ],
        ],
      },
      {
        kind: "p",
        body: [
          "Where the data comes from: a real scan ran one map-pack query at every pin — the overlay simply looks up who came back #1 in each of those results. Nothing is modeled or estimated.",
        ],
      },
    ],
  },
  {
    slug: "ai-citation-halo-explained",
    title: "How the AI citation halo works",
    category: "Rankings & Visibility",
    summary:
      "The rings around your listing show which AI assistants actually cite you — from real prompt checks, not guesses.",
    readMinutes: 4,
    relatedTerms: ["ai-surfaces", "ai-citation", "geo-grid"],
    blocks: [
      {
        kind: "p",
        body: [
          "Patients increasingly ask ChatGPT, Perplexity, or Google's AI Mode instead of scrolling results. The halo answers one question at a glance: when those assistants talk about care in your area, do they cite YOUR location?",
        ],
      },
      { kind: "h2", text: "Where the data comes from" },
      {
        kind: "p",
        body: [
          "We run real patient-style prompts (“who is the best primary care doctor near Memphis?”) against each AI surface and record the answer it actually gave — including which sources it cited. Each ring in the halo is one surface; the count next to it (say, 2/4) means 2 of the 4 prompts we checked cited this location.",
        ],
      },
      {
        kind: "bullets",
        items: [
          ["Cited — the surface cited this location in every prompt we checked."],
          [
            "Partial — cited in some prompts, missed in others. Very common, and very fixable: it usually tracks citation and content gaps.",
          ],
          ["Not cited — the surface never mentioned this location. That ring renders faded."],
        ],
      },
      {
        kind: "note",
        body: [
          "The halo is location-level: the rings sit on your listing, not on individual grid cells. AI answers don't change every mile the way map-pack results do — per-pin AI checks are a future phase, and the map never pretends to have data it doesn't.",
        ],
      },
      { kind: "h2", text: "Digging deeper" },
      {
        kind: "p",
        body: [
          "Every ring is backed by a stored check you can read — the exact prompt, the answer, and the cited source — on the ",
          L("Local AI screen", `${LOC}/local-ai`),
          ". If a rival's domain keeps appearing as the cited source, that's your target: ",
          L("PAA Studio", `${LOC}/paa-studio`),
          " exists to win those citations back.",
        ],
      },
    ],
  },
  {
    slug: "how-geoscan-works",
    title: "How GeoScan works (where your ranking data comes from)",
    category: "Rankings & Visibility",
    summary:
      "The scanning engine behind the grid: real geo-located queries, three ranking layers, a weekly rhythm, and alerts when things move.",
    readMinutes: 5,
    relatedTerms: ["geo-grid", "scan-cycle", "map-pack", "grid-pin", "solv"],
    blocks: [
      {
        kind: "p",
        body: [
          "Every number on ",
          L("the Geo-Grid screen", `${LOC}/geo-grid`),
          " comes from GeoScan — our in-house scanning engine. No sampling, no estimates: it runs real Google queries pinned to real coordinates and stores exactly what came back.",
        ],
      },
      { kind: "h2", text: "The grid" },
      {
        kind: "p",
        body: [
          "Each location gets a 10×10 lattice of scan points — 100 spots, one mile apart, centered on the clinic. At every spot, GeoScan asks Google the tracked keyword as if a patient were standing right there, because local results genuinely change block by block.",
        ],
      },
      { kind: "h2", text: "Three layers per spot" },
      {
        kind: "bullets",
        items: [
          [
            "Map Pack — the boxed map results patients see first. This is the headline number on every pin.",
          ],
          ["Local Finder — the expanded list behind “More places.”"],
          ["Organic — the classic web results, tracked against your GBP-declared website."],
        ],
      },
      { kind: "h2", text: "The weekly rhythm" },
      {
        kind: "steps",
        items: [
          [
            "A full scan cycle runs weekly — every location, every tracked keyword, all three layers.",
          ],
          [
            "Each new cycle joins the filmstrip on the Geo-Grid screen, so Δ vs prior cycle and trend lines build automatically.",
          ],
          [
            "When a keyword moves meaningfully between cycles — dropping out of the pack, or breaking into it — an alert lands in ",
            L("Notifications", "/system/notifications"),
            " with a link straight to the affected grid.",
          ],
        ],
      },
      {
        kind: "note",
        body: [
          "Honesty rule: the very first cycle can't show movement — there's nothing to compare against yet. Deltas, trends, and alerts all begin with cycle two. If a screen shows a dash instead of a trend, that's why.",
        ],
      },
    ],
  },
];

export const HELP_ARTICLE_COUNT = HELP_ARTICLES.length;

export const HELP_BY_SLUG: Record<string, HelpArticle> = Object.fromEntries(
  HELP_ARTICLES.map((a) => [a.slug, a]),
);

/** Articles grouped in canonical category order. */
export function articlesByCategory() {
  return HELP_CATEGORIES.map((category) => ({
    category,
    articles: HELP_ARTICLES.filter((a) => a.category === category),
  })).filter((g) => g.articles.length > 0);
}
