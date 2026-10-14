import { NextRequest, NextResponse } from 'next/server';

function generateDemoAnswer(prompt: string) {
  const text = prompt.toLowerCase();

  if (text.includes('budget') || text.includes('rashan') || text.includes('rs.')) {
    return 'For a tight grocery budget, make one dal, one sabzi, and one protein dish. Keep rice or potatoes as the low-cost base and use seasonal vegetables to stay affordable.';
  }

  if (text.includes('guest') || text.includes('mehmaan')) {
    return 'For guests, increase the main protein dish by 1 extra serving and add a second vegetable or a larger dal portion. That stretches the meal without buying unnecessarily expensive items.';
  }

  if (text.includes('aloo') || text.includes('daal') || text.includes('sabzi')) {
    return 'Aloo Palak is a strong choice if you have potatoes and spinach. Masoor Dal is also excellent if you want a budget-friendly and filling option.';
  }

  if (text.includes('chicken')) {
    return 'A chicken meal like Chicken Karahi works well with tomatoes, onions, and green chili. It is easy to scale for a family and keeps the menu tasty without extra complexity.';
  }

  return 'A balanced plan is Aloo Palak, Chicken Karahi, and Masoor Dal. It covers one vegetable, one protein, and one pulse while staying practical for a household budget.';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = String(body?.prompt || '').trim();
    const profile = body?.profile || {};

    if (!prompt) {
      return NextResponse.json({ answer: 'Please ask a cooking or grocery question so I can help you plan meals.' }, { status: 400 });
    }

    const token = process.env.HUGGINGFACE_API_TOKEN?.trim();
    const model = process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-3.1-8B-Instruct:fastest';

    if (!token) {
      return NextResponse.json({
        answer: `${generateDemoAnswer(prompt)} Demo mode is active: the app is using a local, no-key recipe engine and can connect to a Hugging Face model later when a token is added.`,
        provider: 'demo',
        model,
      });
    }

    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are PantryPilot, a practical cooking and grocery assistant for Pakistani households. Give concise, budget-aware cooking advice. Use English or Roman Urdu to match the user.',
          },
          {
            role: 'user',
            content: `Household: ${profile.city || 'Lahore'}, ${profile.householdSize || 4} people. Budget: ${profile.budget || 'not set'}. Request: ${prompt}`,
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorMessages: Record<number, string> = {
        401: 'Hugging Face rejected the token. Check that it is valid and has Inference Providers permission.',
        403: 'This token or account does not have permission to use Hugging Face Inference Providers.',
        402: 'Hugging Face requires available inference credits for this model. Check your account billing or choose an available provider/model.',
        404: `The model ${model} is not available through the selected Hugging Face inference providers. Choose a supported chat model.`,
        429: 'Hugging Face rate limit reached. Wait a little and try again.',
        503: 'The selected Hugging Face model/provider is temporarily unavailable. Try again shortly or choose another model.',
      };
      const reason = errorMessages[response.status] || `Hugging Face returned HTTP ${response.status}.`;
      return NextResponse.json({
        answer: `${generateDemoAnswer(prompt)} Hugging Face connection issue: ${reason}`,
        provider: 'demo-fallback',
        model,
      });
    }

    const data = await response.json();
    const outputText = data?.choices?.[0]?.message?.content;
    if (typeof outputText !== 'string' || !outputText.trim()) {
      throw new Error('Hugging Face returned an empty response.');
    }

    return NextResponse.json({ answer: outputText.trim(), provider: 'huggingface', model });
  } catch {
    return NextResponse.json({
      answer: 'The Hugging Face service could not be reached. Check your internet connection and token configuration; PantryPilot is showing a local recommendation instead. ' + generateDemoAnswer(prompt),
      provider: 'demo-fallback',
    });
  }
}
