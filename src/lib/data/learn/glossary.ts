import type { GlossaryEntry } from "@/lib/data/types";

const LOC = "/locations/baptist-memphis";

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: "lvi",
    term: "LVI (Local Visibility Index)",
    short: "Your location's overall local-search health, rolled into one 0–100 score.",
    long: "LVI blends nine signals — map rankings, review health, listing accuracy, AI visibility and more — into a single number you can watch over time. Think of it like vital signs rolled into one reading: the score tells you something's off, and the breakdown tells you what. If Baptist Memorial Hospital – Memphis sits at 62, the useful part is seeing which of the nine signals is dragging it down.",
    seeAlso: ["geo-grid", "map-pack", "review-response-rate", "ai-surfaces"],
    whereYouSeeIt: [
      { label: "Fleet overview", href: "/local" },
      { label: "Location dashboard", href: LOC },
    ],
  },
  {
    id: "map-pack",
    term: "Map Pack",
    short:
      "The block of three businesses Google shows on a map at the top of local search results.",
    long: "Search 'walk-in clinic near me' and Google shows a map with three suggested businesses before any regular links. That block is the Map Pack, and it takes most of the clicks. Almost everything in this platform — reviews, categories, citations, posts — exists to earn your clinic one of those three spots.",
    seeAlso: ["gbp", "geo-grid", "solv"],
    whereYouSeeIt: [
      { label: "Geo-Grid Scanner", href: `${LOC}/geo-grid` },
      { label: "Competitive lane", href: `${LOC}/competitive` },
    ],
  },
  {
    id: "geo-grid",
    term: "Geo-Grid",
    short: "A map of pins around your clinic showing where you rank in each nearby neighborhood.",
    long: "Google gives different results depending on where the searcher is standing. A geo-grid runs the same search from dozens of points around your clinic — a 10×10 spread across the neighborhood — so you can see exactly where you win and where a competitor does. Green pins mean you're near the top there; red pins mean patients in that area likely never see you.",
    seeAlso: ["grid-pin", "scan-cycle", "map-pack", "solv"],
    whereYouSeeIt: [
      { label: "Geo-Grid Scanner", href: `${LOC}/geo-grid` },
      { label: "Compare scan cycles", href: `${LOC}/geo-grid/compare` },
    ],
  },
  {
    id: "grid-pin",
    term: "Grid Pin",
    short: "One dot on the geo-grid — your ranking at that exact spot on the map.",
    long: "Each pin is one simulated search from one point. The number on the pin is your position there: a '3' means someone searching from that street corner sees your clinic third. Click any pin to see who outranks you at that spot and by how much.",
    seeAlso: ["geo-grid", "scan-cycle", "atrp"],
    whereYouSeeIt: [{ label: "Geo-Grid Scanner", href: `${LOC}/geo-grid` }],
  },
  {
    id: "scan-cycle",
    term: "Scan Cycle",
    short: "One complete run of the geo-grid — every pin checked once, on a set schedule.",
    long: "Rankings move constantly, so the whole grid gets re-checked on a schedule, usually every week. Each full run is one scan cycle. Comparing this cycle against the last one is how you know whether the work — new reviews, fixed citations, better categories — is actually moving pins.",
    seeAlso: ["geo-grid", "grid-pin", "keyword"],
    whereYouSeeIt: [
      { label: "Compare scan cycles", href: `${LOC}/geo-grid/compare` },
      { label: "Runs & receipts", href: "/system/runs" },
    ],
  },
  {
    id: "keyword",
    term: "Keyword",
    short:
      "A search phrase we watch for your clinic — like 'primary care Memphis' or 'flu shot near me'.",
    long: "There are two kinds here, and the difference matters. Tracked keywords are checked automatically in every scan cycle, so they build history you can chart. Scanned keywords are one-time spot checks — good for 'what if' questions without adding ongoing cost. If Baptist Memphis wants to know where it stands for 'sports physicals', we scan it once before deciding whether it earns a tracked slot.",
    seeAlso: ["geo-grid", "scan-cycle", "service-line"],
    whereYouSeeIt: [
      { label: "Keywords lane", href: `${LOC}/keywords` },
      { label: "Geo-Grid Scanner", href: `${LOC}/geo-grid` },
    ],
  },
  {
    id: "nap",
    term: "NAP",
    short: "Your clinic's Name, Address and Phone number exactly as they appear across the web.",
    long: "When a directory shows an old phone number, patients call the wrong line — and Google trusts your listing a little less every time it sees the mismatch. Keeping NAP identical everywhere (Google, Healthgrades, Yelp and dozens more) is one of the most basic, highest-payoff jobs in local search. Boring, but it works.",
    seeAlso: ["nap-drift", "citation", "directory"],
    whereYouSeeIt: [{ label: "Citations lane", href: `${LOC}/citations` }],
  },
  {
    id: "nap-drift",
    term: "NAP Drift",
    short: "When your name, address or phone shows up differently on different websites.",
    long: "Drift creeps in quietly: a clinic moves suites, the phone tree changes, an old listing never gets the memo. If Healthgrades still shows Baptist Memphis's old phone number while Google shows the new one, that's drift — and Google notices the disagreement. The Citations lane finds each mismatch and queues the fix for approval.",
    seeAlso: ["nap", "citation", "data-aggregator"],
    whereYouSeeIt: [
      { label: "Citations lane", href: `${LOC}/citations` },
      { label: "Action Center", href: "/action-center" },
    ],
  },
  {
    id: "citation",
    term: "Citation",
    short:
      "Any place online that lists your clinic's name, address and phone — like Yelp or Healthgrades.",
    long: "Every accurate citation is a small vote of confidence that your clinic is real and located where you say it is. Google counts those votes when ranking you, and AI assistants read the same sites when deciding which clinics to recommend. The Citations lane shows which directories list you, which have wrong info, and which are missing you entirely.",
    seeAlso: ["directory", "nap", "data-aggregator", "ai-citation"],
    whereYouSeeIt: [{ label: "Citations lane", href: `${LOC}/citations` }],
  },
  {
    id: "directory",
    term: "Directory",
    short:
      "A website that keeps lists of businesses — Yelp, Healthgrades, Apple Maps, Bing Places.",
    long: "Directories matter twice over. Patients use them directly, and Google cross-checks your info against them to decide how much to trust your listing. AI assistants lean on them too — a clinic missing from the major directories is invisible in more places than it realizes.",
    seeAlso: ["citation", "data-aggregator", "ai-surfaces"],
    whereYouSeeIt: [
      { label: "Citations lane", href: `${LOC}/citations` },
      { label: "Local AI lane", href: `${LOC}/local-ai` },
    ],
  },
  {
    id: "data-aggregator",
    term: "Data Aggregator",
    short: "A wholesale supplier of business info that feeds hundreds of directories at once.",
    long: "A handful of companies supply business data to hundreds of smaller sites downstream. Fix your info at the aggregator and the correction flows out to all of them — like updating the master patient record instead of every paper chart in the building. That's why aggregator submissions are the backbone of a citation cleanup.",
    seeAlso: ["citation", "directory", "nap-drift"],
    whereYouSeeIt: [{ label: "Citations lane", href: `${LOC}/citations` }],
  },
  {
    id: "index-check",
    term: "Index Check (Indexation)",
    short: "A check that Google has actually found and stored a page, so it can show up in search.",
    long: "Publishing a page doesn't mean Google shows it — Google first has to find it and add it to its catalog, which is called indexing. An index check confirms that happened. If a citation we ordered still isn't indexed weeks later, it technically exists but isn't helping your clinic yet, so we chase it.",
    seeAlso: ["citation", "directory"],
    whereYouSeeIt: [{ label: "Citations lane", href: `${LOC}/citations` }],
  },
  {
    id: "gbp",
    term: "GBP (Google Business Profile)",
    short:
      "Your clinic's official listing on Google — the panel with hours, phone, reviews and directions.",
    long: "GBP is what patients see when they search your clinic by name, and it's the profile Google uses to decide your Map Pack ranking. Hours, categories, photos, posts and review replies all live there. The GBP Health lane grades your profile against a 16-point scorecard so you know exactly what's missing.",
    seeAlso: ["map-pack", "primary-category", "listing-type"],
    whereYouSeeIt: [
      { label: "GBP Health lane", href: `${LOC}/gbp-health` },
      { label: "Posts lane", href: `${LOC}/posts` },
    ],
  },
  {
    id: "listing-type",
    term: "Listing Type",
    short:
      "Whether a Google listing represents a whole facility, a department inside it, or an individual provider.",
    long: "Healthcare listings come in three flavors: the clinic building itself (facility), a unit inside it like imaging (department), and individual clinicians (practitioner). Google has different rules for each — a practitioner listing shouldn't carry the clinic's name, for example. Every listing in this platform wears a badge so you always know which rules apply.",
    seeAlso: ["gbp", "primary-category"],
    whereYouSeeIt: [
      { label: "GBP Health lane", href: `${LOC}/gbp-health` },
      { label: "Fleet overview", href: "/local" },
    ],
  },
  {
    id: "primary-category",
    term: "Primary Category",
    short:
      "The one Google category that best describes your clinic — its single strongest ranking lever.",
    long: "Google lets each listing pick one primary category ('Family practice physician', 'Urgent care center') plus a few extras. The primary carries by far the most ranking weight. Choosing a vague 'Medical clinic' when 'Urgent care center' fits better can cost you nearly every 'urgent care near me' search in your area.",
    seeAlso: ["gbp", "map-pack"],
    whereYouSeeIt: [{ label: "GBP Health lane", href: `${LOC}/gbp-health` }],
  },
  {
    id: "review-response-rate",
    term: "Review Response Rate",
    short: "The share of patient reviews your clinic has publicly replied to.",
    long: "Replying shows patients — and Google — that someone is home. Clinics that answer reviews, especially the tough ones, look more trustworthy in search and turn more profile views into calls. The Reviews lane tracks your rate and keeps a queue of drafts so no review sits unanswered for weeks.",
    seeAlso: ["phi-gate", "approval-ladder"],
    whereYouSeeIt: [
      { label: "Reviews lane", href: `${LOC}/reviews` },
      { label: "Review trends", href: `${LOC}/reviews/trends` },
    ],
  },
  {
    id: "phi-gate",
    term: "PHI / PHI Gate",
    short:
      "PHI is Protected Health Information; the PHI Gate is the safety check every review reply passes before it can be approved.",
    long: "Under HIPAA, even confirming that someone is a patient counts as revealing health information. So replies here never say 'thanks for visiting us' or mention appointments, conditions or treatments — even when the reviewer shared those details themselves. The PHI Gate is the checkpoint that catches this: a draft that acknowledges patienthood gets stopped before anyone can approve it.",
    seeAlso: ["approval-ladder", "review-response-rate"],
    whereYouSeeIt: [
      { label: "Reviews lane", href: `${LOC}/reviews` },
      { label: "Compliance profile", href: `${LOC}/profile?section=compliance` },
    ],
  },
  {
    id: "approval-ladder",
    term: "Approval Ladder",
    short: "The rule that nothing publishes without a preview and a human approval first.",
    long: "Every change moves in the same four steps: preview exactly what will happen, a person approves it, the write goes out, and the audit log records who approved what and when. Nothing in this platform auto-posts — not a review reply, not a post, not a citation fix. If it changes something patients can see, a human signed off on it.",
    seeAlso: ["audit-log", "phi-gate"],
    whereYouSeeIt: [
      { label: "Reviews lane", href: `${LOC}/reviews` },
      { label: "Posts lane", href: `${LOC}/posts` },
      { label: "Action Center", href: "/action-center" },
    ],
  },
  {
    id: "audit-log",
    term: "Audit Log",
    short: "The permanent record of who approved and published what, and when.",
    long: "Every approval leaves a fingerprint: the change, the person, the timestamp. If a review reply or profile edit is ever questioned later, the audit log shows exactly how it got there and who signed off. In this demo, writes are simulated — but they're logged the same way the real thing would be.",
    seeAlso: ["approval-ladder"],
    whereYouSeeIt: [
      { label: "GBP Health lane", href: `${LOC}/gbp-health` },
      { label: "Runs & receipts", href: "/system/runs" },
    ],
  },
  {
    id: "paa",
    term: "PAA (People Also Ask)",
    short:
      "The 'People also ask' question boxes on Google — real questions patients are typing in.",
    long: "Questions like 'How much does a physical cost without insurance?' appear in Google's PAA boxes because real people keep asking them. Each one is a patient telling you exactly what they want to know before choosing a clinic. PAA Studio collects those questions and turns the best ones into article briefs your team can review and publish.",
    seeAlso: ["term-coverage", "content-score"],
    whereYouSeeIt: [{ label: "PAA Studio", href: `${LOC}/paa-studio` }],
  },
  {
    id: "ai-surfaces",
    term: "AI Surfaces",
    short:
      "The six places an AI can recommend your clinic: four chatbots plus two Google AI features.",
    long: "When someone asks ChatGPT, Claude, Perplexity or Gemini 'who's a good family doctor near me?', the answer is built from directories, reviews and articles — you can't buy your way in. This platform tracks those four chatbots as one group and Google's two AI features (AI Overviews and AI Mode) as another, because they behave differently and shouldn't be averaged together.",
    seeAlso: ["ai-citation", "directory", "lvi"],
    whereYouSeeIt: [
      { label: "Local AI lane", href: `${LOC}/local-ai` },
      { label: "Competitive lane", href: `${LOC}/competitive` },
    ],
  },
  {
    id: "ai-citation",
    term: "AI Citation",
    short: "A source an AI assistant leaned on when it mentioned — or skipped — your clinic.",
    long: "When an AI recommends a clinic, it usually shows where the information came from: Healthgrades, a local news story, your own website. If none of the AI's favorite sources list your clinic, you don't get recommended — simple as that. It's why fixing citations and directories directly improves how often AI mentions you.",
    seeAlso: ["ai-surfaces", "citation", "directory"],
    whereYouSeeIt: [{ label: "Local AI lane", href: `${LOC}/local-ai` }],
  },
  {
    id: "term-coverage",
    term: "Term Coverage",
    short: "How well an article covers the words and phrases readers expect for its topic.",
    long: "An article about flu shots should naturally touch on things like 'egg allergy', 'high-dose' and 'Medicare coverage' — the topics real readers look for. Term coverage measures how many of those expected phrases your draft actually includes. It's a completeness checklist, not a keyword-stuffing contest: the editor shows which terms are still missing so you can cover them naturally.",
    seeAlso: ["content-score", "e-e-a-t", "paa"],
    whereYouSeeIt: [{ label: "PAA Studio", href: `${LOC}/paa-studio` }],
  },
  {
    id: "content-score",
    term: "Content Score",
    short: "A 0–100 grade on how complete and well-structured an article is before you publish it.",
    long: "The score blends term coverage, how well the draft answers common questions, structure, and medical trust signals into one number. It updates live as you edit, so you can watch a draft climb from 54 to 82 and know the improvements landed before anything goes out the door.",
    seeAlso: ["term-coverage", "e-e-a-t"],
    whereYouSeeIt: [{ label: "PAA Studio", href: `${LOC}/paa-studio` }],
  },
  {
    id: "e-e-a-t",
    term: "E-E-A-T",
    short:
      "Google's quality yardstick for content: Experience, Expertise, Authoritativeness, Trust.",
    long: "Google holds health content to a higher bar than most topics, because bad medical advice can hurt people. Pages with a named author, clinical review and real sources rank better — and AI assistants prefer them too. That's why the article editor includes medical E-E-A-T checks alongside the usual writing ones.",
    seeAlso: ["content-score", "term-coverage"],
    whereYouSeeIt: [{ label: "PAA Studio", href: `${LOC}/paa-studio` }],
  },
  {
    id: "solv",
    term: "SoLV (Share of Local Voice)",
    short: "The share of nearby searches where your clinic shows up in the top three results.",
    long: "Out of every grid point and keyword we scan, what fraction show your clinic in the top three? A SoLV of 40% means you make the Map Pack in 4 out of 10 chances. It's the cleanest way to compare your clinic against competitors across a whole area instead of one street corner.",
    seeAlso: ["atrp", "geo-grid", "map-pack"],
    whereYouSeeIt: [
      { label: "Geo-Grid Scanner", href: `${LOC}/geo-grid` },
      { label: "Competitive lane", href: `${LOC}/competitive` },
    ],
  },
  {
    id: "atrp",
    term: "ATRP (Average Total Rank Position)",
    short: "Your average ranking across every pin in the grid — lower is better.",
    long: "Take your ranking at each grid pin and average them all. An ATRP of 3.2 means that wherever people search near your clinic, you're roughly third. It moves gradually, which makes it good at showing slow, steady progress that a colorful map might hide.",
    seeAlso: ["solv", "geo-grid", "grid-pin"],
    whereYouSeeIt: [
      { label: "Geo-Grid Scanner", href: `${LOC}/geo-grid` },
      { label: "Compare scan cycles", href: `${LOC}/geo-grid/compare` },
    ],
  },
  {
    id: "service-line",
    term: "Service Line",
    short:
      "A category of care your clinic offers — primary care, imaging, physical therapy, sports physicals.",
    long: "The platform ties keywords, articles and posts back to service lines so the marketing effort follows what the clinic actually wants to grow. If Baptist Memphis is pushing sports physicals this fall, its tracked keywords, PAA questions and posts should all lean that way — and the service line view shows whether they do.",
    seeAlso: ["keyword", "paa"],
    whereYouSeeIt: [
      { label: "Services & geography", href: `${LOC}/profile?section=services-geo` },
      { label: "Keywords lane", href: `${LOC}/keywords` },
    ],
  },
  {
    id: "spot-check",
    term: "Spot Check",
    short:
      "A quick one-off scan the agency runs to answer a question without waiting for the next cycle.",
    long: "Sometimes you need an answer today: 'did that citation fix land?', 'where do we rank for this new keyword?'. A spot check runs a single targeted scan outside the normal schedule, with the cost shown up front before anything runs. It's the difference between waiting for the next lab panel and running one test now.",
    seeAlso: ["scan-cycle", "keyword"],
    whereYouSeeIt: [
      { label: "Spot Check console", href: "/tools/spot-check" },
      { label: "Costs & receipts", href: "/admin/costs" },
    ],
  },
  {
    id: "who-wins",
    term: "Who-Wins Overlay",
    short: "A map view that colors every grid cell by which business holds map-pack #1 there.",
    long: "Your rank tells you half the story; who-wins tells the other half. Each scan point already knows the full top-20 that came back, so the overlay simply paints each cell with the #1 business — Baptist blue when it's you or one of your practitioners, a rival's color when it's not. Solid blocks of rival color are the neighborhoods to fight for.",
    seeAlso: ["geo-grid", "map-pack", "grid-pin"],
    whereYouSeeIt: [{ label: "Geo-Grid overlays", href: `${LOC}/geo-grid` }],
  },
  {
    id: "geoscan",
    term: "GeoScan",
    short:
      "The in-house engine that runs real geo-located Google queries for every grid cell, weekly.",
    long: "GeoScan posts one real query per scan point — 100 points per location per keyword — and stores the map pack, local finder, and organic results exactly as Google returned them. Cycles run weekly; movement between cycles becomes alerts. It replaced the third-party scanner so the platform owns its own ranking data end to end.",
    seeAlso: ["scan-cycle", "geo-grid", "who-wins"],
    whereYouSeeIt: [{ label: "Geo-Grid screen", href: `${LOC}/geo-grid` }],
  },
];

/** Fast id → entry lookup for see-also chips and article footers. */
export const GLOSSARY_BY_ID: Record<string, GlossaryEntry> = Object.fromEntries(
  GLOSSARY.map((e) => [e.id, e]),
);

export const GLOSSARY_COUNT = GLOSSARY.length;
