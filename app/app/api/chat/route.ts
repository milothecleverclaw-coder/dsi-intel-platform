import OpenAI from 'openai';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is missing.');
}

const openai = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: OPENROUTER_API_URL,
});

export async function POST(request: Request) {
    const { messages, caseDetails, personas, pins } = await request.json();

    if (!messages) {
        return new Response(JSON.stringify({ message: 'Messages are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Construct the system prompt with case details, personas, and pins
    let systemPrompt = `คุณเป็นผู้ช่วยวิเคราะห์คดีอาชญากรรม (CSI Case Assistant) ของ DSI เป้าหมายคือชนะคดี ตอบภาษาไทย ระบุช่องโหว่และหลักฐานที่ขาด`;

    if (caseDetails) {
        systemPrompt += `\n\n**Case Details:**\nTitle: ${caseDetails.title}\nCase Number: ${caseDetails.case_number}\nNarrative: ${caseDetails.narrative_report}\nStatus: ${caseDetails.status}`;
    }

    if (personas && personas.length > 0) {
        systemPrompt += '\n\n**Personas:**\n';
        personas.forEach((persona: any) => {
            systemPrompt += `- ${persona.first_name_en || ''} ${persona.last_name_en || ''} (Aliases: ${persona.aliases.join(', ')}, Phones: ${persona.phones.join(', ')}, Role: ${persona.role})\n`;
        });
    }

    if (pins && pins.length > 0) {
        systemPrompt += '\n\n**Pins:**\n';
        pins.forEach((pin: any) => {
            systemPrompt += `- ${pin.context} (Importance: ${pin.importance}, Time: ${pin.incident_time || pin.timestamp_start || 'N/A'})
`;
        });
    }

    const chatMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
    ];

    try {
        const response = await openai.chat.completions.create({
            model: 'anthropic/claude-3.5-sonnet', // Specified model via OpenRouter
            messages: chatMessages,
            // stream: true, // Uncomment if you want to implement streaming responses
        });

        // Ensure response.choices exists and has at least one choice
        if (response.choices && response.choices.length > 0 && response.choices[0].message) {
            return new Response(JSON.stringify(response.choices[0].message), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            console.error('Invalid response structure from OpenAI:', response);
            return new Response(JSON.stringify({ message: 'Invalid response from AI model' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

    } catch (error) {
        console.error('Error communicating with OpenRouter:', error);
        return new Response(JSON.stringify({ message: 'Error communicating with AI service' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
