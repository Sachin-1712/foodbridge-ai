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
  
  return `I can help you with questions about FoodBridge! Try asking about:\n• How to create a donation\n• What status badges mean\n• How smart matching works\n• What to do with urgent donations\n• How the delivery process works\n• NGO analytics and metrics`;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    // messages is expected to have { role: 'user' | 'assistant', parts: [{ text: string }] }
    // Let's get the last user message text for the fallback
    const lastUserMessage = messages?.filter((m: any) => m.role === 'user').pop();
    const lastText = lastUserMessage?.parts?.[0]?.text || '';
    
    if (!lastText) {
      return NextResponse.json({ reply: 'Please ask me a question about FoodBridge!' });
    }

    // Try Gemini if key exists
    if (process.env.GEMINI_API_KEY) {
      console.log('Gemini API key found, attempting to call Gemini...');
      try {
        // Map 'assistant' to 'model' for Gemini
        const geminiMessages = messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: m.parts || [{ text: m.content || '' }],
        }));

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: geminiMessages.slice(-5), // keep last 5
            systemInstruction: {
              parts: [{ text: `You are the FoodBridge platform assistant. FoodBridge is a food waste redistribution platform that connects food donors (restaurants, bakeries) with NGOs through delivery partners. Be concise, helpful, and guide users to their next action. Only answer platform-related questions.` }]
            },
            generationConfig: {
              maxOutputTokens: 300,
              temperature: 0.7,
            }
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          console.log('Gemini API success. Reply:', reply?.substring(0, 50) + '...');
          if (reply) {
            return NextResponse.json({ reply });
          }
        } else {
          const errorData = await res.text();
          console.error('Gemini API responded with error status:', res.status, errorData);
        }
      } catch (e) {
        // Fall through to deterministic response
        console.error('Gemini API Error:', e);
      }
    } else {
      console.log('No GEMINI_API_KEY found in process.env, falling back to deterministic FAQ mode.');
    }

    // Try OpenAI if key exists (legacy fallback)
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiMessages = messages.map((m: any) => ({
          role: m.role,
          content: m.parts?.[0]?.text || m.content || '',
        }));
        
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are the FoodBridge platform assistant. FoodBridge is a food waste redistribution platform that connects food donors (restaurants, bakeries) with NGOs through delivery partners. Be concise, helpful, and guide users to their next action. Only answer platform-related questions.`,
              },
              ...openaiMessages.slice(-5),
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ reply: data.choices[0].message.content });
        }
      } catch {
        // Fall through to deterministic response
      }
    }

    // Deterministic fallback
    const reply = generateResponse(lastText);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: 'Sorry, I had trouble processing your question. Please try again.' },
      { status: 200 }
    );
  }
}
