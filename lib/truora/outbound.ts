const TRUORA_API_URL = 'https://api.connect.truora.com/v1/whatsapp/outbounds/send';
const TRUORA_API_KEY = process.env.TRUORA_API_KEY ?? '';

export interface SendOutboundParams {
  phone: string;
  outboundId: string;
  flowId: string;
  variables: Record<string, string>;
}

export async function sendOutbound(params: SendOutboundParams): Promise<Record<string, unknown>> {
  if (!TRUORA_API_KEY) {
    throw new Error('TRUORA_API_KEY no configurada');
  }

  const body = new URLSearchParams();
  body.append('outbound_id', params.outboundId);
  body.append('phone_number', params.phone);
  body.append('flow_id', params.flowId);
  body.append('user_authorized', 'true');

  for (const [key, value] of Object.entries(params.variables)) {
    body.append(`var.${key}`, value);
  }

  const res = await fetch(TRUORA_API_URL, {
    method: 'POST',
    headers: {
      'Truora-API-Key': TRUORA_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const responseBody = await res.json();

  if (!res.ok) {
    console.error('[Truora Outbound] API error:', res.status, responseBody);
    throw new Error(`Truora Outbound error ${res.status}: ${JSON.stringify(responseBody)}`);
  }

  return responseBody;
}
