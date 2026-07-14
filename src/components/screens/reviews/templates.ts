import type { ReviewSentiment } from "@/lib/data/types";

export const PATIENT_RELATIONS_PHONE = "(901) 555-0142";

export interface SeoWeaveContext {
  shortName: string;
  city: string;
  serviceLine: string;
}

const TEMPLATES: Record<ReviewSentiment, string> = {
  positive:
    "Thank you for taking the time to share this feedback. Our team works hard to provide compassionate, high-quality care for this community, and we will make sure these kind words are passed along to the whole staff.",
  neutral: `Thank you for sharing this feedback. We are always working to improve the experience at our clinics, and comments like this help us do that. If there is anything more we should know, our patient relations team is available at ${PATIENT_RELATIONS_PHONE}.`,
  negative: `We take all feedback seriously and would welcome the chance to learn more. Because we cannot discuss individual circumstances in a public forum, please contact our patient relations team at ${PATIENT_RELATIONS_PHONE} so the right people can follow up directly.`,
  critical: `We take all feedback seriously. We are unable to discuss individual circumstances in a public forum, but we want to understand and address the concerns raised here — please contact our patient relations team directly at ${PATIENT_RELATIONS_PHONE}.`,
};

export const HANDOFF_ACKNOWLEDGMENT = TEMPLATES.critical;

export function templateFor(sentiment: ReviewSentiment, ctx?: SeoWeaveContext): string {
  if (!ctx || sentiment === "negative" || sentiment === "critical") {
    return TEMPLATES[sentiment];
  }
  if (sentiment === "positive") {
    return `Thank you for taking the time to share this feedback. Our team at ${ctx.shortName} works hard to provide compassionate ${ctx.serviceLine} for the ${ctx.city} community, and we will make sure these kind words are passed along to the whole staff.`;
  }
  return `Thank you for sharing this feedback. We are always working to improve ${ctx.serviceLine} at ${ctx.shortName} in ${ctx.city}, and comments like this help us do that. If there is anything more we should know, our patient relations team is available at ${PATIENT_RELATIONS_PHONE}.`;
}

export function weaveTerms(sentiment: ReviewSentiment, ctx?: SeoWeaveContext): string[] {
  if (!ctx || sentiment === "negative" || sentiment === "critical") return [];
  return [ctx.shortName, ctx.city, ctx.serviceLine];
}
