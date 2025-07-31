import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  cheatSheet: string;
  userQuestion: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cheatSheet, userQuestion }: ChatRequest = await req.json();

    // For now, we'll use general knowledge since we don't have the knowledge base
    // In future, you can implement the FAISS vector search logic here
    const final_prompt = `
You are 'MedTutor AI', a friendly and expert USMLE medical tutor. Your goal is to provide a clear, detailed, and beautifully formatted answer.

**FORMATTING INSTRUCTIONS:**
- Use Markdown for all formatting.
- Use headings (e.g., ## Systolic HF, ## Key Differences) to structure the answer.
- Use bullet points (* or -) for lists.
- Use bold text (**text**) to highlight important keywords (like **Ejection Fraction < 40%**).
- Keep responses concise but comprehensive.

**CONVERSATION CONTEXT:**
${cheatSheet}

**CURRENT USER'S QUESTION:**
${userQuestion}

**EXPERT, FORMATTED ANSWER:**
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: final_prompt
          }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});