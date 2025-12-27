/**
 * AI Service for Health App
 * 
 * This service provides AI-powered features for the health app.
 * Configure your API key in the environment or settings.
 * 
 * For OpenAI: Set OPENAI_API_KEY environment variable
 * For other providers: Modify the API endpoint and headers accordingly
 */

const AI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
// Auto-detect API provider based on key prefix
const isGroqKey = AI_API_KEY.startsWith('gsk_');
const AI_API_URL = isGroqKey
  ? 'https://api.groq.com/openai/v1/chat/completions'
  : 'https://api.openai.com/v1/chat/completions';

export interface AIMealRecommendation {
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  reason: string;
  ingredients: string[];
  prepTime: number;
}

export interface AIWorkoutPlan {
  name: string;
  duration: number; // minutes
  exercises: {
    name: string;
    sets?: number;
    reps?: number;
    duration?: number; // minutes
    rest?: number; // seconds
  }[];
  caloriesBurned: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: string;
}

export interface AIHealthInsight {
  title: string;
  insight: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Check if AI service is configured
 */
export function isAIConfigured(): boolean {
  return !!AI_API_KEY;
}

/**
 * Make a request to the AI API
 */
async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  if (!AI_API_KEY) {
    throw new Error('AI API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment.');
  }

  const messages: ChatMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: isGroqKey ? 'llama-3.1-8b-instant' : 'gpt-4o-mini', // Groq uses different models
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('AI API call failed:', error);
    throw error;
  }
}

/**
 * Get AI-powered meal recommendations based on user's goals and current intake
 */
export async function getAIMealRecommendations(
  remainingCalories: number,
  goals: { calories: number; protein?: number },
  preferences?: { dietaryRestrictions?: string[]; favoriteFoods?: string[] }
): Promise<AIMealRecommendation[]> {
  const prompt = `You are a nutritionist AI assistant. Recommend 3 healthy meal options that fit within ${remainingCalories} remaining calories for today.

User's daily calorie goal: ${goals.calories} calories
Remaining calories: ${remainingCalories} calories
${preferences?.dietaryRestrictions ? `Dietary restrictions: ${preferences.dietaryRestrictions.join(', ')}` : ''}
${preferences?.favoriteFoods ? `Favorite foods: ${preferences.favoriteFoods.join(', ')}` : ''}

For each meal, provide:
- name: The meal name
- category: breakfast, lunch, dinner, or snack
- calories: Estimated calories
- protein: Protein in grams
- carbs: Carbs in grams
- fat: Fat in grams
- reason: Why this meal is good for them
- ingredients: Array of 3-5 main ingredients
- prepTime: Preparation time in minutes

Return ONLY a valid JSON array with this structure, no other text:
[
  {
    "name": "Meal Name",
    "category": "breakfast",
    "calories": 350,
    "protein": 20,
    "carbs": 45,
    "fat": 10,
    "reason": "High protein and fiber",
    "ingredients": ["ingredient1", "ingredient2"],
    "prepTime": 10
  }
]`;

  try {
    const response = await callAI(prompt, 'You are a helpful nutritionist. Always return valid JSON only.');
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]) as AIMealRecommendation[];
      return recommendations.slice(0, 3); // Limit to 3 recommendations
    }
    throw new Error('Invalid response format from AI');
  } catch (error) {
    console.error('Failed to get AI meal recommendations:', error);
    // Return fallback recommendations
    return getFallbackMealRecommendations(remainingCalories);
  }
}

/**
 * Get AI-powered health insights based on user's health data
 */
export async function getAIHealthInsights(
  today: {
    steps: number;
    sleep: number;
    water: number;
    calories: number;
    bmi: number;
    bloodPressure: string;
  },
  goals: { steps: number; sleep: number; water: number; calories: number },
  history: { date: string; steps: number; sleep: number; water: number; calories: number }[]
): Promise<AIHealthInsight[]> {
  const avgSteps = history.length > 0
    ? history.reduce((sum, d) => sum + d.steps, 0) / history.length
    : today.steps;
  const avgSleep = history.length > 0
    ? history.reduce((sum, d) => sum + d.sleep, 0) / history.length
    : today.sleep;
  const avgWater = history.length > 0
    ? history.reduce((sum, d) => sum + d.water, 0) / history.length
    : today.water;

  const prompt = `You are a health analytics AI. Analyze this user's health data and provide 3 key insights.

Today's Data:
- Steps: ${today.steps} (goal: ${goals.steps})
- Sleep: ${today.sleep} hours (goal: ${goals.sleep} hours)
- Water: ${today.water} oz (goal: ${goals.water} oz)
- Calories: ${today.calories} (goal: ${goals.calories})
- BMI: ${today.bmi.toFixed(1)}
- Blood Pressure: ${today.bloodPressure}

7-Day Averages:
- Average Steps: ${Math.round(avgSteps)}
- Average Sleep: ${avgSleep.toFixed(1)} hours
- Average Water: ${Math.round(avgWater)} oz

Provide 3 insights in JSON format:
[
  {
    "title": "Insight Title",
    "insight": "What the data shows",
    "recommendation": "Actionable recommendation",
    "priority": "high" or "medium" or "low"
  }
]

Return ONLY valid JSON array, no other text.`;

  try {
    const response = await callAI(prompt, 'You are a health analytics expert. Return only valid JSON.');
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]) as AIHealthInsight[];
      return insights.slice(0, 3);
    }
    throw new Error('Invalid response format from AI');
  } catch (error) {
    console.error('Failed to get AI health insights:', error);
    return getFallbackHealthInsights(today, goals);
  }
}

/**
 * Generate a personalized workout plan
 */
export async function generateAIWorkoutPlan(
  preferences: {
    duration?: number; // minutes
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    focus?: string; // e.g., "cardio", "strength", "flexibility"
    availableEquipment?: string[];
  }
): Promise<AIWorkoutPlan> {
  const prompt = `You are a fitness trainer AI. Create a personalized workout plan.

Preferences:
- Duration: ${preferences.duration || 30} minutes
- Difficulty: ${preferences.difficulty || 'intermediate'}
- Focus: ${preferences.focus || 'full body'}
- Equipment: ${preferences.availableEquipment?.join(', ') || 'bodyweight only'}

Return a JSON object with this structure:
{
  "name": "Workout Plan Name",
  "duration": 30,
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": 12,
      "duration": null,
      "rest": 60
    }
  ],
  "caloriesBurned": 250,
  "difficulty": "intermediate",
  "focus": "full body"
}

For cardio exercises, use "duration" instead of "sets/reps".
Return ONLY valid JSON, no other text.`;

  try {
    const response = await callAI(prompt, 'You are a fitness trainer. Return only valid JSON.');
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AIWorkoutPlan;
    }
    throw new Error('Invalid response format from AI');
  } catch (error) {
    console.error('Failed to generate AI workout plan:', error);
    return getFallbackWorkoutPlan(preferences);
  }
}

/**
 * Get AI-powered personalized greeting message for the home screen
 * Returns a short message (max 10 words) based on current health metrics
 */
export async function getAIGreetingMessage(
  today: {
    steps: number;
    sleep: number;
    water: number;
    calories: number;
    activity: number;
    bloodSugar: number;
    bmi: number;
  },
  goals: {
    steps: number;
    sleep: number;
    water: number;
    calories: number;
  }
): Promise<string> {
  const prompt = `You are a health coach AI. Generate a short, encouraging greeting message (MAXIMUM 10 WORDS) based on the user's current health metrics.

Current Metrics:
- Steps: ${today.steps} / ${goals.steps} goal (${Math.round((today.steps / goals.steps) * 100)}%)
- Sleep: ${today.sleep} hours / ${goals.sleep} hours goal (${Math.round((today.sleep / goals.sleep) * 100)}%)
- Water: ${today.water} oz / ${goals.water} oz goal (${Math.round((today.water / goals.water) * 100)}%)
- Calories: ${today.calories} / ${goals.calories} goal (${Math.round((today.calories / goals.calories) * 100)}%)
- Activity Level: ${today.activity}%
- Blood Sugar: ${today.bloodSugar} mg/dL
- BMI: ${today.bmi.toFixed(1)}

Generate ONE short, positive, encouraging message (exactly 10 words or less) that reflects their current health status. Examples:
- "You're making great progress on your health goals today!"
- "Keep up the excellent work with your daily activities!"
- "Your hydration and activity levels are looking strong!"

Return ONLY the message text, nothing else. Maximum 10 words.`;

  try {
    const response = await callAI(prompt, 'You are a positive health coach. Return only a short greeting message (max 10 words), no other text.');
    // Clean up the response and ensure it's 10 words or less
    const message = response.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
    const words = message.split(/\s+/);
    if (words.length > 10) {
      return words.slice(0, 10).join(' ') + '...';
    }
    return message;
  } catch (error) {
    console.error('Failed to get AI greeting message:', error);
    return getFallbackGreetingMessage(today, goals);
  }
}

/**
 * Get AI-powered personalized recommendations for the home screen
 */
export async function getAIHomeRecommendations(
  today: {
    steps: number;
    sleep: number;
    water: number;
    calories: number;
    activity: number;
    bloodSugar: number;
    bmi: number;
  },
  goals: {
    steps: number;
    sleep: number;
    water: number;
    calories: number;
  }
): Promise<string[]> {
  const prompt = `You are a health coach AI. Based on the user's current health metrics and goals, provide 3-4 personalized, actionable recommendations.

Current Metrics:
- Steps: ${today.steps} / ${goals.steps} goal
- Sleep: ${today.sleep} hours / ${goals.sleep} hours goal
- Water: ${today.water} oz / ${goals.water} oz goal
- Calories: ${today.calories} / ${goals.calories} goal
- Activity Level: ${today.activity}%
- Blood Sugar: ${today.bloodSugar} mg/dL
- BMI: ${today.bmi.toFixed(1)}

Provide 3-4 short, actionable recommendations (one sentence each) that are:
1. Specific and actionable
2. Encouraging and positive
3. Based on what they need most right now
4. Practical and easy to implement

Return ONLY a JSON array of strings, no other text:
["Recommendation 1", "Recommendation 2", "Recommendation 3"]`;

  try {
    const response = await callAI(prompt, 'You are a helpful health coach. Return only valid JSON array of recommendation strings.');
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]) as string[];
      return recommendations.slice(0, 4); // Limit to 4 recommendations
    }
    throw new Error('Invalid response format from AI');
  } catch (error) {
    console.error('Failed to get AI home recommendations:', error);
    // Return fallback recommendations
    return getFallbackHomeRecommendations(today, goals);
  }
}

/**
 * Chat with AI health assistant
 */
export async function chatWithAIHealthAssistant(
  message: string,
  context?: {
    currentHealthData?: any;
    goals?: any;
  }
): Promise<string> {
  const systemPrompt = `You are a helpful health and wellness AI assistant. Provide accurate, helpful, and encouraging health advice. 
Always remind users to consult healthcare professionals for medical concerns.`;

  const contextInfo = context
    ? `\n\nUser's current health context:\n${JSON.stringify(context, null, 2)}`
    : '';

  const prompt = `${message}${contextInfo}`;

  try {
    return await callAI(prompt, systemPrompt);
  } catch (error) {
    console.error('Failed to chat with AI assistant:', error);
    return "I'm having trouble connecting right now. Please try again later or consult with a healthcare professional for immediate concerns.";
  }
}

// Fallback functions when AI is not available
function getFallbackMealRecommendations(remainingCalories: number): AIMealRecommendation[] {
  return [
    {
      name: 'Grilled Chicken Salad',
      category: 'lunch',
      calories: Math.min(400, remainingCalories),
      protein: 35,
      carbs: 25,
      fat: 15,
      reason: 'High protein, low calorie option',
      ingredients: ['Grilled chicken', 'Mixed greens', 'Cherry tomatoes', 'Olive oil dressing'],
      prepTime: 15,
    },
    {
      name: 'Greek Yogurt with Berries',
      category: 'snack',
      calories: Math.min(200, remainingCalories),
      protein: 15,
      carbs: 25,
      fat: 5,
      reason: 'Protein-rich snack to keep you full',
      ingredients: ['Greek yogurt', 'Mixed berries', 'Honey'],
      prepTime: 5,
    },
  ];
}

function getFallbackHealthInsights(
  today: any,
  goals: any
): AIHealthInsight[] {
  const insights: AIHealthInsight[] = [];

  if (today.steps < goals.steps * 0.8) {
    insights.push({
      title: 'Step Count Below Target',
      insight: `You're at ${today.steps} steps, below your ${goals.steps} goal.`,
      recommendation: 'Try a 10-minute walk to boost your daily steps.',
      priority: 'medium',
    });
  }

  if (today.sleep < goals.sleep) {
    insights.push({
      title: 'Sleep Duration',
      insight: `You got ${today.sleep} hours of sleep, below your ${goals.sleep} hour goal.`,
      recommendation: 'Aim for consistent sleep schedule to improve rest quality.',
      priority: 'high',
    });
  }

  if (today.water < goals.water * 0.8) {
    insights.push({
      title: 'Hydration Level',
      insight: `You've consumed ${today.water} oz of water, below your ${goals.water} oz goal.`,
      recommendation: 'Drink water regularly throughout the day to stay hydrated.',
      priority: 'medium',
    });
  }

  return insights.length > 0 ? insights : [
    {
      title: 'Great Progress!',
      insight: 'You\'re doing well with your health goals.',
      recommendation: 'Keep up the good work and maintain consistency.',
      priority: 'low',
    },
  ];
}

function getFallbackWorkoutPlan(preferences: any): AIWorkoutPlan {
  return {
    name: 'Full Body Workout',
    duration: preferences.duration || 30,
    exercises: [
      { name: 'Jumping Jacks', duration: 2, rest: 30 },
      { name: 'Push-ups', sets: 3, reps: 10, rest: 45 },
      { name: 'Squats', sets: 3, reps: 15, rest: 45 },
      { name: 'Plank', duration: 1, rest: 30 },
      { name: 'Lunges', sets: 2, reps: 12, rest: 45 },
    ],
    caloriesBurned: 200,
    difficulty: preferences.difficulty || 'intermediate',
    focus: preferences.focus || 'full body',
  };
}

function getFallbackGreetingMessage(today: any, goals: any): string {
  const progressCount = [
    today.steps >= goals.steps * 0.8,
    today.water >= goals.water * 0.8,
    today.sleep >= goals.sleep * 0.8,
    today.calories >= goals.calories * 0.8 && today.calories <= goals.calories * 1.2,
  ].filter(Boolean).length;

  if (progressCount >= 3) {
    return 'Your health metrics look great today!';
  } else if (progressCount >= 2) {
    return 'You are making good progress on your goals!';
  } else {
    return 'Keep working towards your health goals today!';
  }
}

/**
 * Get AI-powered address suggestions based on partial address input
 */
export interface AddressSuggestion {
  street: string;
  city: string;
  state: string;
  zip: string;
  fullAddress: string; // Formatted full address
}

export async function getAIAddressSuggestions(
  partialAddress: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  }
): Promise<AddressSuggestion[]> {
  const hasStreet = partialAddress.street && partialAddress.street.trim().length > 3;
  const hasCity = partialAddress.city && partialAddress.city.trim().length > 2;
  const hasState = partialAddress.state && partialAddress.state.trim().length > 0;
  const hasZip = partialAddress.zip && partialAddress.zip.trim().length > 0;

  // Only suggest if user has entered at least street address or city
  if (!hasStreet && !hasCity) {
    return [];
  }

  const prompt = `You are an address completion AI. Based on the partial address information provided, suggest 3-5 complete, valid US addresses that match the input.

Partial Address:
- Street: ${partialAddress.street || '(not provided)'}
- City: ${partialAddress.city || '(not provided)'}
- State: ${partialAddress.state || '(not provided)'}
- Zip Code: ${partialAddress.zip || '(not provided)'}

Generate 3-5 complete, realistic US addresses that match the provided information. If only street is provided, suggest addresses with that street name in common cities. If city is provided, prioritize that city. If state is provided, use that state.

Return ONLY a JSON array with this structure:
[
  {
    "street": "123 Main Street",
    "city": "New York",
    "state": "New York",
    "zip": "10001",
    "fullAddress": "123 Main Street, New York, NY 10001"
  }
]

Return ONLY valid JSON array, no other text.`;

  try {
    const response = await callAI(prompt, 'You are an address completion assistant. Return only valid JSON array of address objects.');
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]) as AddressSuggestion[];
      // Format fullAddress if not provided
      return suggestions.map((addr) => ({
        ...addr,
        fullAddress: addr.fullAddress || `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`,
      })).slice(0, 5);
    }
    throw new Error('Invalid response format from AI');
  } catch (error) {
    console.error('Failed to get AI address suggestions:', error);
    return [];
  }
}

function getFallbackHomeRecommendations(
  today: any,
  goals: any
): string[] {
  const recs: string[] = [];
  if (today.steps < goals.steps)
    recs.push('Time for a 10-minute walk to boost your steps.');
  if (today.water < goals.water)
    recs.push('Drink 2 glasses of water to stay hydrated.');
  if (today.sleep < goals.sleep)
    recs.push('Aim for at least 7 hours of sleep tonight.');
  if (today.activity < 60)
    recs.push('Add a short stretching or cycling session.');
  if (today.bloodSugar > 110)
    recs.push('Take a short walk to help stabilize blood sugar.');
  if (today.calories > goals.calories)
    recs.push('Balance calories with a light, protein-rich snack.');
  if (recs.length === 0)
    recs.push("Great job! Keep maintaining today's healthy rhythm.");
  return recs.slice(0, 4);
}

