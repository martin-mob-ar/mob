const TOKKO_WEBCONTACT_URL = 'http://www.tokkobroker.com/api/v1/webcontact/';

interface TokkoWebContactPayload {
  name: string;
  email: string;
  cellphone?: string;
  text: string;
  properties: number[];
}

interface TokkoWebContactResult {
  success: boolean;
  error?: string;
}

/**
 * Create a web contact (lead) in Tokko Broker.
 * @param apiKey - Raw Tokko API key (decrypted)
 * @param tokkoPropertyId - The Tokko property ID to associate the contact with
 * @param lead - Lead contact data
 */
export async function createTokkoWebContact(
  apiKey: string,
  tokkoPropertyId: number,
  lead: { name: string; email: string; phone?: string; message: string }
): Promise<TokkoWebContactResult> {
  const payload: TokkoWebContactPayload = {
    name: lead.name,
    email: lead.email,
    text: lead.message,
    properties: [tokkoPropertyId],
  };

  if (lead.phone) {
    payload.cellphone = lead.phone;
  }

  const url = `${TOKKO_WEBCONTACT_URL}?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.status === 201) {
    return { success: true };
  }

  const text = await response.text();
  console.error(`[Tokko WebContact] Error ${response.status}: ${text}`);
  return { success: false, error: `HTTP ${response.status}: ${text}` };
}
