import { getAi } from './gemini';

export interface GeneratedLesson {
  concept: string; // The single focused concept
  explanation: string; // Plain language explanation
  realWorldExample: string; // Concrete real-world example
  interaction: {
    scenario: string; // Brief scenario-based question
    options: { text: string; isCorrect: boolean }[];
    correctFeedback: string;
    incorrectFeedback: string;
  };
  closingHook: string; // Connects the concept to real-world application
  attribution?: string; // Internal record of original source
}

/**
 * The Master Content Pipeline.
 * Takes a raw authoritative source (e.g., a book excerpt) and transforms it into an original, 
 * verified, and simplified micro-lesson.
 */
export const runContentPipeline = async (rawSourceText: string, sourceName: string): Promise<GeneratedLesson> => {
  const model = getAi().getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  const systemPrompt = `You are the master content architect for T1GER, an elite learning platform.
Your task is to take raw, authoritative source material and transform it into a single, focused micro-lesson.

PIPELINE INSTRUCTIONS (Execute these internally before generating the final output):
1. EXTRACTION & REWRITING: Extract ONE core concept from the source. Rewrite it completely in your own words. Do NOT paraphrase or mirror the original structure. It must be 100% original educational content inspired by the source.
2. VERIFICATION PASS: Ensure the extracted concept is factually accurate according to general consensus, not just the single source's claim.
3. SIMPLIFICATION PASS: Simplify the concept so a complete beginner can understand it in under 2 minutes. No jargon without explanation.
4. FORMATTING: Structure the output strictly into the requested JSON format.

LESSON RULES:
- One single concept per lesson. Never combine multiple ideas.
- Tone is warm, direct, encouraging, and respects the user's intelligence.
- Use a concrete real-world example, not abstract theory.
- Provide a brief interaction (scenario question) to confirm understanding (not a punishing test).
- End with a closing hook that connects the concept to real-world application (setting up a future Action).

Return ONLY valid JSON matching this schema:
{
  "concept": "The core concept title (max 5 words)",
  "explanation": "Short, plain-language explanation of the concept (2-3 paragraphs)",
  "realWorldExample": "A concrete real-world example illustrating the concept",
  "interaction": {
    "scenario": "A brief scenario-based question testing understanding",
    "options": [
      { "text": "Option A", "isCorrect": false },
      { "text": "Option B", "isCorrect": true }
    ],
    "correctFeedback": "Encouraging feedback for the right answer",
    "incorrectFeedback": "Guiding, non-punishing feedback for the wrong answer"
  },
  "closingHook": "One sentence connecting this to why it matters in the real world",
  "attribution": "Name of the original source material"
}`;

  const prompt = `Source Material (${sourceName}):\n\n"${rawSourceText}"\n\nRun the pipeline and generate the lesson JSON.`;

  try {
    const result = await model.generateContent({
      contents: [
        { role: 'model', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: prompt }] }
      ],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const text = result.response.text();
    return JSON.parse(text.trim()) as GeneratedLesson;
  } catch (error) {
    console.error("Content Pipeline Error:", error);
    throw error;
  }
};
