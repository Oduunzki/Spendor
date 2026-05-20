import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ReceiptItem {
  description: string;
  amount: number;
  quantity: number;
  category: string;
}

export interface ReceiptParseResult {
  store_name: string | null;
  date: string | null;
  total: number | null;
  currency: string;
  items: ReceiptItem[];
}

const RECEIPT_SYSTEM_PROMPT = `Du er en kvitteringsanalysator. Du returnerer alltid gyldig JSON uten forklaring.`;

const COACH_SYSTEM_PROMPT = `Du er ImpulseGuard-coachen — en vennlig, uformell AI-coach for en person med ADHD som jobber med å kontrollere impulskjøp. Du snakker norsk.

Regler:
- Aldri skam eller guilt-tripping
- Feire alle fremskritt, selv små
- Vær kort og punchy (maks 2-3 setninger)
- Bruk humor der det passer
- Gi konkret innsikt basert på dataen
- Sammenlign med forrige uke når det er relevant`;

export async function parseReceiptImage(
  base64Image: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
): Promise<ReceiptParseResult> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: RECEIPT_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64Image },
          },
          {
            type: 'text',
            text: `Analyser dette kvitteringsbildet. Returner JSON med følgende struktur:
{
  "store_name": "butikknavn",
  "date": "YYYY-MM-DD",
  "total": 123.50,
  "currency": "NOK",
  "items": [
    {
      "description": "varenavn",
      "amount": 29.90,
      "quantity": 1,
      "category": "en av: Mat, Kaffe, Elektronikk, Klær, Hobby, Restaurant, Transport, Abonnement, Helse, Annet"
    }
  ]
}

Hvis du ikke kan lese noe, sett verdien til null.
Svar KUN med JSON, ingen annen tekst.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude returned no JSON');

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    store_name: parsed.store_name || null,
    date: parsed.date || null,
    total: parsed.total ? parseFloat(parsed.total) : null,
    currency: parsed.currency || 'NOK',
    items: Array.isArray(parsed.items) ? parsed.items.map((item: any) => ({
      description: item.description || '',
      amount: parseFloat(item.amount) || 0,
      quantity: parseInt(item.quantity) || 1,
      category: item.category || 'Annet',
    })) : [],
  };
}

export async function generateCoachMessage(
  messageType: string,
  userStats: object
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    system: [
      {
        type: 'text',
        text: COACH_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Brukerdata denne perioden:\n${JSON.stringify(userStats, null, 2)}\n\nGenerer en ${messageType} melding.`,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
