const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `
You are a nutrition expert AI for the NutriAI app. 
Your task is to analyze a meal (via image or text description) and provide a detailed nutritional breakdown.
You must return only a valid JSON object with the following structure:
{
  "mealName": "Name of the meal",
  "items": [
    {
      "name": "Food item name",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "portion": "Estimated portion (e.g., 200g, 1 cup)"
    }
  ],
  "totals": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0
  }
}
Be as accurate as possible with estimations. Use standard nutritional data.
`;

async function callGemini(contents) {
    if (!API_KEY) {
        throw new Error('Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: SYSTEM_PROMPT },
                        ...contents
                    ],
                },
            ],
            generationConfig: {
                response_mime_type: 'application/json',
            }
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to call Gemini API');
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    return JSON.parse(textResponse);
}

export async function analyzeMealImage(base64Image) {
    return callGemini([
        {
            inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
            },
        },
        { text: "Analyze this meal image and provide the nutritional breakdown in JSON." }
    ]);
}

export async function analyzeMealText(description) {
    return callGemini([
        { text: `Analyze this meal description: "${description}" and provide the nutritional breakdown in JSON.` }
    ]);
}
