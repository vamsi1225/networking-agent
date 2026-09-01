// app/api/extract/route.ts
//
// This API will Take a raw transcript and sends it to Claude with a strict prompt asking (may be i can change the prompting technique)
// for structured JSON back like a short narrative, a spark strength score, and
// any commitment signals detected in the conversation. This is the step and important one in V1 "messy spoken text" into a memory card.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const EXTRACTION_PROMPT = `You are extracting structured information from a transcript of someone's voice note about a person they just met at a networking event.

Return ONLY valid JSON in exactly this shape, with no other text:

{
  "name": string | null,
  "company": string | null,
  "narrative": string,
  "sparkStrength": number,
  "commitmentSignals": [
    { "category": string, "quote": string, "reasoning": string }
  ]
}

Field guidance:
- "narrative": 2-3 sentences capturing the story of the conversation, written the way a person would describe it to a friend. Not a list of facts.
- "sparkStrength": a 1-10 rating of how promising this connection feels overall, based on tone, engagement, and warmth in the conversation.
- "commitmentSignals": zero or more signals detected, using ONLY these category values: "concrete_offer", "opportunity_mentioned", "next_step_proposed", "vague_interest".

Category definitions and examples:

concrete_offer — the person explicitly offered to take an action on the speaker's behalf.
Example: "I'll introduce you to my manager." → concrete_offer

opportunity_mentioned — a specific real opening or need was mentioned, even without a direct offer.
Example: "We're actually hiring for a role like that right now." → opportunity_mentioned

next_step_proposed — a specific future interaction was suggested.
Example: "Let's grab coffee sometime next month." → next_step_proposed

vague_interest — general friendliness or enthusiasm, with no specific action or opportunity.
Example: "It was great talking, we should stay in touch." → vague_interest

If a conversation is purely informational with none of the above, return an empty array for commitmentSignals.

Transcript:
{{transcript}}`;

// The shape of response
type ExtractionResult = {
  name: string | null;
  company: string | null;
  narrative: string;
  sparkStrength: number;
  commitmentSignals: {
    category: string;
    quote: string;
    reasoning: string;
  }[];
};

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    const prompt = EXTRACTION_PROMPT.replace("{{transcript}}", transcript);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    console.log("Claude response:", response);

    const textBlock = response.content.find((block) => block.type === "text");
    const rawText = textBlock?.type === "text" ? textBlock.text : "";
    const cleanedText = rawText.replace(/```json|```/g, "").trim();

    let extracted: ExtractionResult;
    try {
      extracted = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error("Failed to parse Claude's response as JSON:", rawText);
      return NextResponse.json(
        { error: "Extraction returned an unexpected format" },
        { status: 502 }
      );
    }

    return NextResponse.json(extracted);
  } catch (err) {
    console.error("Extract route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}