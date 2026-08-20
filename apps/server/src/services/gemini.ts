import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { SkillLevel, Technique } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash-lite',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.8,
  },
});

function buildPlanPrompt(hobby: string, level: SkillLevel, preferences?: string): string {
  const techniqueCount = level === 'curious' ? 5 : level === 'beginner' ? 6 : 8;

  return `A student typed the following into a "what hobby do you want to learn?" box: "${hobby}"

This may be phrased as a full sentence, a question, an abbreviation, or just a
plain hobby name. First, identify the actual hobby or recreational skill they
mean, and write it as a short, properly capitalized name (e.g. "I want to
learn piano" -> "Piano", "chess" -> "Chess").

Then decide whether it's actually a hobby - something people learn and
practice for enjoyment or personal interest (this includes practical/domestic
interests like cooking, gardening, or home DIY). It is NOT a hobby if it's a
professional/trade service (e.g. "AC repair", "plumbing"), asking for advice
on a one-off task (e.g. "how to do my taxes", "write my resume"), a
homework/school question, or unrelated/nonsensical input.

If it IS a hobby: as an instructor for it, create a structured learning plan
for a ${level} level student: exactly ${techniqueCount} techniques, ordered
from easiest to most advanced.

${preferences ? `Student context: ${preferences}` : ''}

Return a single JSON object with:
- "isHobby": true or false
- "hobby": the cleaned-up hobby name (your best guess at what they meant, even if isHobby is false)
- "techniques": if isHobby is true, an array where each element has:
  - "name": short technique name (2-4 words)
  - "description": what this technique is and how to do it (2-3 sentences)
  - "whyItMatters": why learning this is important for the student (1-2 sentences)
  - "estimatedTime": realistic time to learn (e.g., "2-3 hours", "1 week")
  - "difficulty": one of "easy", "medium", or "hard"
  - "practiceChecklist": array of 3-5 practice tasks, each with "text" (actionable task description)
  - "resources": empty array
  If isHobby is false, return an empty array.

Example format:
{
  "isHobby": true,
  "hobby": "Guitar",
  "techniques": [
    {
      "name": "Basic Grip",
      "description": "Learn the fundamental way to hold and control the instrument.",
      "whyItMatters": "A proper grip is the foundation for all other techniques.",
      "estimatedTime": "1-2 hours",
      "difficulty": "easy",
      "practiceChecklist": [
        { "text": "Practice holding for 5 minutes" },
        { "text": "Try switching between grips" }
      ],
      "resources": []
    }
  ]
}

Return ONLY the JSON object, no markdown or extra text.`;
}

function buildSwapPrompt(
  hobby: string,
  level: SkillLevel,
  currentTechnique: string,
  existingTechniques: string[],
  reason?: string
): string {
  return `You are a ${hobby} instructor. A ${level} level student wants to swap out the technique "${currentTechnique}" from their learning plan.

${reason ? `Reason for swapping: ${reason}` : ''}

Their current techniques are: ${existingTechniques.join(', ')}

Suggest ONE alternative technique that:
- Is at a similar difficulty level
- Is NOT already in their plan
- Fits well with the other techniques in the plan

Return a single JSON object with:
- "name": short technique name (2-4 words)
- "description": what this technique is (2-3 sentences)
- "whyItMatters": why it's important (1-2 sentences)
- "estimatedTime": realistic time estimate
- "difficulty": one of "easy", "medium", or "hard"
- "practiceChecklist": array of 3-5 practice tasks, each with "text"
- "resources": empty array

Return ONLY the JSON object, no markdown or extra text.`;
}

interface RawTechnique {
  name: string;
  description: string;
  whyItMatters: string;
  estimatedTime: string;
  difficulty: Technique['difficulty'];
  practiceChecklist?: { text: string }[];
}

function formatTechnique(raw: RawTechnique, order: number, isFirst: boolean): Technique {
  return {
    id: uuidv4(),
    name: raw.name,
    description: raw.description,
    whyItMatters: raw.whyItMatters,
    order,
    status: isFirst ? 'active' : 'locked',
    progress: 0,
    estimatedTime: raw.estimatedTime,
    difficulty: raw.difficulty,
    practiceChecklist: (raw.practiceChecklist || []).map((item) => ({
      id: uuidv4(),
      text: item.text,
      completed: false,
    })),
    resources: [],
  };
}

interface RawPlan {
  isHobby: boolean;
  hobby: string;
  techniques: RawTechnique[];
}

export type PlanResult =
  | { isHobby: true; hobby: string; techniques: Technique[] }
  | { isHobby: false; hobby: string };

export async function generateLearningPlan(
  hobby: string,
  level: SkillLevel,
  preferences?: string
): Promise<PlanResult> {
  const prompt = buildPlanPrompt(hobby, level, preferences);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const rawPlan: RawPlan = JSON.parse(text);

  if (!rawPlan.isHobby) {
    return { isHobby: false, hobby: rawPlan.hobby };
  }

  return {
    isHobby: true,
    hobby: rawPlan.hobby,
    techniques: rawPlan.techniques.map((raw, index) =>
      formatTechnique(raw, index + 1, index === 0)
    ),
  };
}

export async function generateSwapTechnique(
  hobby: string,
  level: SkillLevel,
  currentTechnique: string,
  existingTechniques: string[],
  reason?: string
): Promise<Technique> {
  const prompt = buildSwapPrompt(hobby, level, currentTechnique, existingTechniques, reason);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const raw: RawTechnique = JSON.parse(text);

  return formatTechnique(raw, 0, false);
}
