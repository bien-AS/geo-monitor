import type { TutorialGroup } from "@/lib/data/types";

export const TUTORIAL_GROUPS: TutorialGroup[] = [
  {
    group: "Getting Started",
    blurb: "First-week basics — start here if the platform is new to you.",
    videos: [
      {
        id: "welcome-tour",
        title: "Welcome tour: signing in, picking your location, reading the dashboard",
        description:
          "A first look around: how to sign in, find your clinic in the list, and understand the dashboard tiles you land on. No jargon, no setup required.",
        duration: "~5 min",
        audience: "Everyone",
      },
      {
        id: "understanding-lvi",
        title: "Understanding your LVI score",
        description:
          "What the 0–100 Local Visibility Index means, the nine signals inside it, and how to read the donut so you know what to work on first.",
        duration: "~4 min",
        audience: "Everyone",
      },
      {
        id: "switching-locations",
        title: "Switching between locations",
        description:
          "How the location switcher works, what changes when you move between clinics, and how the fleet view compares all locations at once.",
        duration: "~3 min",
        audience: "Everyone",
      },
    ],
  },
  {
    group: "Your Location's Lanes",
    blurb: "One video per lane — the day-to-day work of a single clinic.",
    videos: [
      {
        id: "reading-geo-grid",
        title: "Reading your Geo-Grid like a map",
        description:
          "What the colored pins mean, how to click into a pin to see who outranks you there, and how to compare this scan cycle with the last one.",
        duration: "~6 min",
        audience: "Clinic staff",
      },
      {
        id: "keywords-tracking-vs-scanning",
        title: "Keywords: tracking vs scanning",
        description:
          "The difference between keywords we watch every cycle and one-time spot checks — and how to decide which a new phrase deserves.",
        duration: "~4 min",
        audience: "Clinic staff",
      },
      {
        id: "reviews-hipaa-safe",
        title: "Reviews: replying safely under HIPAA",
        description:
          "Why replies never confirm someone was a patient, how the PHI Gate protects you, and the approval steps every reply walks through.",
        duration: "~7 min",
        audience: "Clinic staff",
      },
      {
        id: "posts-draft-to-published",
        title: "Posts: from draft to published",
        description:
          "Writing a Google post, previewing exactly what patients will see, and moving it through approval to the publish calendar.",
        duration: "~5 min",
        audience: "Clinic staff",
      },
      {
        id: "citations-nap-cleanup",
        title: "Citations & NAP: the cleanup pipeline",
        description:
          "How wrong phone numbers and addresses get found, what ordering a citation fix actually does, and how to watch fixes flow through.",
        duration: "~6 min",
        audience: "Clinic admin",
      },
    ],
  },
  {
    group: "Content",
    blurb: "Turning patient questions into published, clinician-safe articles.",
    videos: [
      {
        id: "paa-studio-walkthrough",
        title: "PAA Studio: from patient question to published article",
        description:
          "Picking a real 'People also ask' question, generating a draft brief, and walking it through review to a live article and GBP post.",
        duration: "~8 min",
        audience: "Clinic admin",
      },
      {
        id: "approving-content",
        title: "Approving content as a clinic admin",
        description:
          "What to check before you approve: the content score, medical E-E-A-T items, and the compliance rows that are locked on purpose.",
        duration: "~5 min",
        audience: "Clinic admin",
      },
    ],
  },
  {
    group: "Agency",
    blurb: "Operator-side tooling — scans, spend and receipts.",
    videos: [
      {
        id: "spot-check-console",
        title: "Spot Check console walkthrough",
        description:
          "Running a one-off scan to answer a question today: choosing the target, reading the cost preview, and interpreting the result.",
        duration: "~6 min",
        audience: "Agency",
      },
      {
        id: "costs-run-receipts",
        title: "Costs & run receipts",
        description:
          "Where every provider charge shows up, how run receipts tie spend to results, and how to spot a scan that isn't earning its keep.",
        duration: "~5 min",
        audience: "Agency",
      },
    ],
  },
];

export const TUTORIAL_COUNT = TUTORIAL_GROUPS.reduce((sum, g) => sum + g.videos.length, 0);
