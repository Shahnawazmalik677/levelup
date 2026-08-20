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

  return `You are a ${hobby} instructor creating a structured learning plan for a ${level} level student.

Generate exactly ${techniqueCount} techniques to learn, ordered from easiest to most advanced.

${preferences ? `Student context: ${preferences}` : ''}

Return a JSON array where each element has:
- "name": short technique name (2-4 words)
- "description": what this technique is and how to do it (2-3 sentences)
- "whyItMatters": why learning this is important for the student (1-2 sentences)
- "estimatedTime": realistic time to learn (e.g., "2-3 hours", "1 week")
- "difficulty": one of "easy", "medium", or "hard"
- "practiceChecklist": array of 3-5 practice tasks, each with "text" (actionable task description)
- "resources": empty array

Example format:
[
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

Return ONLY the JSON array, no markdown or extra text.`;
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

function formatTechnique(raw: any, order: number, isFirst: boolean): Technique {
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
    practiceChecklist: (raw.practiceChecklist || []).map((item: any) => ({
      id: uuidv4(),
      text: item.text,
      completed: false,
    })),
    resources: [],
  };
}

export async function generateLearningPlan(
  hobby: string,
  level: SkillLevel,
  preferences?: string
): Promise<Technique[]> {
  const prompt = buildPlanPrompt(hobby, level, preferences);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const rawTechniques = JSON.parse(text);

  return rawTechniques.map((raw: any, index: number) =>
    formatTechnique(raw, index + 1, index === 0)
  );
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
  const raw = JSON.parse(text);

  return formatTechnique(raw, 0, false);
}
