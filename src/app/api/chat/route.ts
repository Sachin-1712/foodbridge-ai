import { NextRequest, NextResponse } from 'next/server';

// Deterministic FAQ responses — no OpenAI dependency needed
const faqResponses: Record<string, string> = {
  'create': `To create a donation, click "New Donation" in the sidebar. Fill in the food details including title, category, quantity, urgency level, and pickup window. Once submitted, the system will automatically generate match suggestions for nearby NGOs.`,
  'status': `Donation statuses progress as follows:\n• **Open** — Donation has been created and is visible to NGOs\n• **Matched** — System has generated NGO suggestions\n• **Accepted** — An NGO has accepted the donation\n• **Pickup Assigned** — A delivery partner has been assigned\n• **Picked Up** — Food has been collected from the donor\n• **In Transit** — Food is being delivered to the NGO\n• **Delivered** — Successfully delivered! 🎉`,
  'match': `Smart matching uses a weighted scoring algorithm that considers:\n• **Distance** (35%) — Closer NGOs score higher\n• **Category fit** (20%) — NGOs that accept the food type score higher\n• **Urgency readiness** (20%) — NGOs with high acceptance rates are preferred for urgent donations\n• **Capacity** (15%) — NGOs with available capacity score higher\n• **Reliability** (10%) — Historical acceptance rate\n\nThe system ranks all eligible NGOs and shows scores from 0–100.`,
  'urgent': `For urgent donations, the system prioritizes NGOs with:\n• Closest proximity\n• High acceptance rates\n• History of responding quickly to urgent requests\n\nUrgent donations appear highlighted in the NGO feed and receive higher matching scores.`,
  'delivery': `Delivery jobs are automatically created when an NGO accepts a donation. The delivery partner can:\n1. **Accept** the job\n2. **Pick up** the food from the donor\n3. Mark as **In Transit**\n4. Mark as **Delivered**\n\nEach status update is reflected across all dashboards in real-time.`,
  'ngo': `As an NGO, you can:\n• View available donations in your feed\n• Filter by category, urgency, and distance\n• See smart match scores for each donation\n• Accept or reject donations based on your capacity\n• Track incoming deliveries\n• View analytics and impact metrics`,
  'analytics': `The analytics dashboard shows:\n• Donations received this week\n• Total meals rescued\n• Top donor categories\n• Average acceptance time\n• Trends over the past 14 days\n\nAn AI-powered insight box provides actionable recommendations based on your data patterns.`,
};

function generateResponse(question: string): string {
  const q = question.toLowerCase();
  
  if (q.includes('create') || q.includes('donation') || q.includes('listing') || q.includes('post')) {
    return faqResponses['create'];
  }
  if (q.includes('status') || q.includes('badge') || q.includes('progress') || q.includes('track')) {
    return faqResponses['status'];
  }
  if (q.includes('match') || q.includes('score') || q.includes('rank') || q.includes('why was')) {
    return faqResponses['match'];
  }
  if (q.includes('urgent') || q.includes('emergency') || q.includes('quickly')) {
    return faqResponses['urgent'];
  }
  if (q.includes('deliver') || q.includes('pickup') || q.includes('transit') || q.includes('route')) {
    return faqResponses['delivery'];
  }
  if (q.includes('ngo') || q.includes('accept') || q.includes('reject') || q.includes('feed')) {
    return faqResponses['ngo'];
  }
  if (q.includes('analytics') || q.includes('chart') || q.includes('metric') || q.includes('impact')) {
    return faqResponses['analytics'];
  }
  
  return `I can help you with questions about Sharebite! Try asking about:\n• How to create a donation\n• What status badges mean\n• How smart matching works\n• What to do with urgent donations\n• How the delivery process works\n• NGO analytics and metrics`;
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[Chat API ${requestId}] Processing new request...`);

  try {
    const { messages } = await request.json();
    const lastUserMessage = messages?.filter((m: any) => m.role === 'user').pop();
    const lastText = lastUserMessage?.parts?.[0]?.text || '';
    
    if (!lastText) {
      console.log(`[Chat API ${requestId}] No user message found.`);
      return NextResponse.json({ reply: 'Please ask me a question about Sharebite!' });
    }

    // Try Gemini if key exists
    if (process.env.GEMINI_API_KEY) {
      console.log(`[Chat API ${requestId}] Gemini API key found. Attempting Gemini 2.5 Flash call...`);
      try {
        // Map 'assistant' to 'model' for Gemini and filter out empty messages
        let geminiMessages = messages
          .filter((m: any) => (m.parts?.[0]?.text || m.content))
          .map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: m.parts || [{ text: m.content || '' }],
          }));

        // Gemini REQUIREMENT: History must start with 'user'
        if (geminiMessages.length > 0 && geminiMessages[0].role === 'model') {
          console.log(`[Chat API ${requestId}] Removing initial model message to satisfy Gemini requirements.`);
          geminiMessages.shift();
        }

        // Gemini REQUIREMENT: Must alternate between user and model
        // If we have consecutive roles, we'll keep the last one of each type for simplicity in this demo
        const sanitizedMessages: any[] = [];
        for (let i = 0; i < geminiMessages.length; i++) {
          if (i === 0 || geminiMessages[i].role !== geminiMessages[i - 1].role) {
            sanitizedMessages.push(geminiMessages[i]);
          } else {
            // Replace the previous one with current one (likely more recent/relevant)
            sanitizedMessages[sanitizedMessages.length - 1] = geminiMessages[i];
          }
        }

        console.log(`[Chat API ${requestId}] Sending ${sanitizedMessages.length} messages to Gemini.`);

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: sanitizedMessages.slice(-6), // keep last few exchanges
            systemInstruction: {
              parts: [{ text: `You are the Sharebite platform assistant. Sharebite connects food donors (restaurants, bakeries) with NGOs through delivery partners. 
              DONOR FLOW: Create donation -> Match with NGO -> Delivery assigned -> Food picked up -> Delivered.
              NGO FLOW: View marketplace -> Accept donation -> Track delivery -> Receive food.
              DELIVERY FLOW: View assigned jobs -> Accept -> Pick up -> Mark in-transit -> Deliver.
              Be concise, professional, and guide users. If asked about technical details, use the FAQ knowledge but keep it conversational.` }]
            },
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.8,
            }
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            console.log(`[Chat API ${requestId}] Gemini SUCCESS. Reply length: ${reply.length}`);
            return NextResponse.json({ reply });
          }
        } else {
          const errorBody = await res.text();
          console.error(`[Chat API ${requestId}] Gemini API Error (${res.status}):`, errorBody);
        }
      } catch (e) {
        console.error(`[Chat API ${requestId}] Exception during Gemini call:`, e);
      }
    } else {
      console.warn(`[Chat API ${requestId}] GEMINI_API_KEY is MISSING in environment.`);
    }

    // Deterministic fallback (FAQ)
    console.log(`[Chat API ${requestId}] Falling back to deterministic FAQ mode.`);
    const reply = generateResponse(lastText);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error(`[Chat API ${requestId}] Critical Route Error:`, err);
    return NextResponse.json(
      { reply: 'Sorry, I encountered a technical glitch. Please try again or ask about "how to start".' },
      { status: 200 }
    );
  }
}
