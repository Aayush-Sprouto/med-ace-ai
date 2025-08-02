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
    console.log('Edge function called with method:', req.method);
    console.log('GOOGLE_AI_API_KEY exists:', !!GOOGLE_AI_API_KEY);
    
    const { cheatSheet, userQuestion }: ChatRequest = await req.json();
    console.log('Received request:', { userQuestion, cheatSheetLength: cheatSheet.length });

    // Enhanced prompt for better AI responses
    const final_prompt = `
You are 'MedTutor AI', an expert USMLE medical tutor with deep knowledge in all medical fields. Your mission is to provide comprehensive, accurate, and engaging educational content that helps medical students excel in their studies.

**CORE PRINCIPLES:**
- Always be accurate, evidence-based, and up-to-date with current medical knowledge
- Provide comprehensive explanations that build understanding from fundamentals
- Use clear, professional medical terminology while explaining complex concepts
- Structure responses logically with clear sections and bullet points
- Include relevant clinical correlations and high-yield facts for USMLE
- Be encouraging and supportive while maintaining academic rigor

**FORMATTING REQUIREMENTS:**
- Use proper Markdown formatting throughout
- Create clear section headings with ## for major topics
- Use **bold text** for key terms, medications, and important concepts
- Use bullet points (- or *) for lists and key points
- Include numbered lists for step-by-step processes
- Use > blockquotes for important clinical pearls
- Ensure proper spacing between sections for readability

**CONTENT STYLE:**
- Start with a brief, engaging introduction to the topic
- Break down complex topics into digestible sections
- Include mnemonics, clinical pearls, and high-yield facts
- Provide differential diagnoses where relevant
- Connect basic science to clinical applications
- End with a concise summary of key takeaways

**CONVERSATION CONTEXT:**
${cheatSheet}

**CURRENT STUDENT'S QUESTION:**
${userQuestion}

**COMPREHENSIVE EDUCATIONAL RESPONSE:**
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