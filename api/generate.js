import Stripe from "stripe";
import Anthropic from "@anthropic-ai/sdk";

const PLAN_PROMPT = `You are an expert academic advisor and study strategist. A student has shared their course material (syllabus, notes, or description) and needs a personalized study plan for their final exam.

Create a detailed, actionable study plan that includes:
1. A prioritized list of topics ordered by importance/weight and the student's likely weak areas
2. A day-by-day schedule leading up to the exam (assume they have 5-7 days unless they specify otherwise)
3. Specific study techniques for each topic (active recall, practice problems, concept mapping, etc.)
4. Time estimates for each study block (be realistic — 45-60 min blocks with breaks)
5. A "night before" and "morning of" checklist

Be specific to their actual course content — reference real topics, chapters, and concepts from what they provided. Don't be generic.

Tone: direct, encouraging, like a smart upperclassman who's taken the class. Not corporate or robotic.`;

const QUIZ_PROMPT = `You are an expert professor creating a practice final exam. A student has shared their course material (lecture notes, study guide, or description).

Create a comprehensive practice exam that includes:
1. 15-20 questions of mixed types:
   - Multiple choice (5-6 questions)
   - Short answer (4-5 questions)
   - True/False with explanation (3-4 questions)
   - 2-3 longer problem-solving or essay-style questions
2. Questions should span the full range of topics in the material
3. Include some questions that test conceptual understanding, not just memorization
4. After ALL questions, provide a complete answer key with detailed explanations for every question

Make the difficulty match a real college final — not too easy, not impossibly hard. Base every question on the actual content the student provided. Reference specific concepts, formulas, terms, and examples from their material.`;

const BOTH_PROMPT = `You are an expert academic advisor, study strategist, and professor. A student has shared their course material and needs BOTH a study plan AND a practice exam for their final.

PART 1 — STUDY PLAN:
Create a detailed study plan including:
1. Prioritized topics by importance/weight
2. A day-by-day schedule (assume 5-7 days)
3. Specific study techniques per topic
4. Time estimates per block (45-60 min with breaks)
5. Night-before and morning-of checklist

PART 2 — PRACTICE EXAM:
Create a practice final with:
1. 15-20 mixed questions (multiple choice, short answer, true/false with explanation, and 2-3 longer problems)
2. Full coverage of all topics
3. Mix of conceptual and applied questions
4. Complete answer key with detailed explanations after all questions

Clearly separate PART 1 and PART 2 with headers. Be specific to their actual course material — reference real topics, concepts, and terms. Tone: direct and encouraging, like a smart upperclassman who aced the class.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { content, courseName, tool, sessionId } = req.body;

  if (!content || !tool || !sessionId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Verify payment with Stripe
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(403).json({ error: "Payment not completed." });
    }
  } catch (err) {
    console.error("Stripe verification error:", err);
    return res.status(403).json({ error: "Could not verify payment." });
  }

  // Select prompt
  let systemPrompt;
  if (tool === "plan") systemPrompt = PLAN_PROMPT;
  else if (tool === "quiz") systemPrompt = QUIZ_PROMPT;
  else systemPrompt = BOTH_PROMPT;

  const userMessage = courseName
    ? `Course: ${courseName}\n\nHere is my course material:\n\n${content}`
    : `Here is my course material:\n\n${content}`;

  // Call Claude API
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: userMessage }],
      system: systemPrompt,
    });

    const result = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    res.status(200).json({ result });
  } catch (err) {
    console.error("Claude API error:", err);
    res.status(500).json({ error: "AI generation failed. Please try again." });
  }
}
