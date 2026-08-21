export type CardArcana = "major" | "minor";
export type CardSuit = "bamboo" | "mulberry" | "lotus" | "rice";

export interface CardNarrative {
  vietnameseName: string;
  summary: string;
  classification: "legend" | "historical-archaeological-record";
  sourceUrl: string | null;
}

export interface Card {
  slug: string;
  rwsName: string;
  arcana: CardArcana;
  suit: CardSuit | null;
  number: string;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  beginnerNote: string;
  narrative: CardNarrative | null;
  imageKey: string | null;
  status: "draft" | "published";
}

export type LeadSource =
  | "hero"
  | "card-grid"
  | "story-section"
  | "houses-section"
  | "footer"
  | "pricing-interest";

export type LeadInterest = "beginner" | "reader" | "collector" | "gift";

export type TelemetryEventName =
  | "landing_view"
  | "card_grid_open"
  | "card_detail_open"
  | "minor_collection_open"
  | "minor_collection_complete_view"
  | "story_open"
  | "lead_form_open"
  | "lead_submitted"
  | "lead_confirmed";
