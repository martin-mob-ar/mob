const NOTION_API_URL = 'https://api.notion.com/v1/pages';
const NOTION_VERSION = '2022-06-28';

interface NotionLeadData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  type: 'visita' | 'reserva';
  source: string;
  propertyId: number;
  tokko: boolean;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

/**
 * Create a lead entry in a Notion database.
 * Requires NOTION_API_KEY and NOTION_LEADS_DATABASE_ID env vars.
 */
export async function createNotionLead(
  data: NotionLeadData
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_LEADS_DATABASE_ID;

  if (!apiKey || !databaseId) {
    console.warn('[Notion] Missing NOTION_API_KEY or NOTION_LEADS_DATABASE_ID, skipping');
    return { success: false, error: 'Notion not configured' };
  }

  const body = {
    parent: { database_id: databaseId },
    properties: {
      'nombre lead': {
        title: [{ text: { content: data.name } }],
      },
      'email lead': {
        email: data.email,
      },
      ...(data.phone ? {
        'telefono lead': {
          phone_number: data.phone,
        },
      } : {}),
      mensaje: {
        rich_text: [{ text: { content: data.message.slice(0, 2000) } }],
      },
      internal_property_id: {
        number: data.propertyId,
      },
      tokko: {
        checkbox: data.tokko,
      },
      tipo: {
        select: { name: data.type },
      },
      created_at: {
        date: { start: new Date().toISOString() },
      },
      source: {
        select: { name: data.source },
      },
      ...(data.ownerName ? {
        'nombre duenio': {
          rich_text: [{ text: { content: data.ownerName } }],
        },
      } : {}),
      ...(data.ownerEmail ? {
        'email duenio': {
          email: data.ownerEmail,
        },
      } : {}),
      ...(data.ownerPhone ? {
        'telefono duenio': {
          phone_number: data.ownerPhone,
        },
      } : {}),
    },
  };

  try {
    const response = await fetch(NOTION_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[Notion] Error ${response.status}: ${text}`);
      return { success: false, error: `HTTP ${response.status}: ${text}` };
    }

    return { success: true };
  } catch (error) {
    console.error('[Notion] Exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
