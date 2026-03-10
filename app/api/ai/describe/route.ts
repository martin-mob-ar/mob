import { NextResponse } from "next/server";
import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";

interface DescribeRequest {
  propertyType: string;
  location: string;
  address: string;
  piso?: string;
  depto?: string;
  ambientes: number;
  dormitorios: number;
  banos: number;
  toilettes: number;
  cocheras: number;
  superficieCubierta: string;
  superficieTotal: string;
  antiguedad: string;
  disposicion?: string;
  amoblado: boolean;
  tags: string[];
}

function buildPrompt(data: DescribeRequest): string {
  const lines: string[] = [];

  lines.push(`Tipo: ${data.propertyType}`);
  lines.push(`Ubicación: ${data.location}`);
  if (data.address) lines.push(`Dirección: ${data.address}`);
  if (data.piso)
    lines.push(
      `Piso: ${data.piso}${data.depto ? `, Depto ${data.depto}` : ""}`
    );
  lines.push(`Ambientes: ${data.ambientes}`);
  lines.push(`Dormitorios: ${data.dormitorios}`);
  lines.push(`Baños: ${data.banos}`);
  if (data.toilettes > 0) lines.push(`Toilettes: ${data.toilettes}`);
  if (data.cocheras > 0) lines.push(`Cocheras: ${data.cocheras}`);
  if (data.superficieCubierta)
    lines.push(`Superficie cubierta: ${data.superficieCubierta} m²`);
  if (data.superficieTotal)
    lines.push(`Superficie total: ${data.superficieTotal} m²`);
  if (data.antiguedad) lines.push(`Antigüedad: ${data.antiguedad} años`);
  if (data.disposicion) lines.push(`Disposición: ${data.disposicion}`);
  lines.push(`Amoblado: ${data.amoblado ? "Sí" : "No"}`);
  if (data.tags.length > 0)
    lines.push(`Amenities y características: ${data.tags.join(", ")}`);

  return `Sos un redactor inmobiliario argentino profesional. Escribí la descripción de un aviso de alquiler basándote en los datos concretos de la propiedad.

DATOS DE LA PROPIEDAD:
${lines.join("\n")}

INSTRUCCIONES:
- Tu objetivo principal es describir la propiedad usando TODOS los datos proporcionados. Cada dato debe reflejarse en la descripción.
- Mencioná explícitamente: cantidad de ambientes, dormitorios, baños, superficie, antigüedad, disposición, cocheras, y cualquier otro dato numérico.
- Si tiene amenities o características (pileta, gimnasio, balcón, terraza, parrilla, etc.), nombralas todas.
- Si está amoblado, mencionalo. Si tiene cochera, mencionalo.
- El barrio se puede mencionar brevemente pero NO dediques más de una oración al barrio. El foco es la propiedad.
- Escribí en español rioplatense natural (usá "vos", "departamento", etc.)
- NO uses frases genéricas como "no te lo pierdas", "oportunidad única", "ideal para", "te invitamos"
- NO incluyas información de contacto ni precios
- Escribí entre 80 y 150 palabras en un solo párrafo fluido
- No uses markdown, bullets, asteriscos ni formato especial — solo texto plano
- No empieces con "Se alquila" ni "Alquiler de"`;
}

export async function POST(request: Request) {
  try {
    const body: DescribeRequest = await request.json();

    if (!body.propertyType || !body.location) {
      return NextResponse.json(
        { error: "Faltan datos de la propiedad" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(body);

    const { text } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      prompt,
      temperature: 0.7,
      maxOutputTokens: 2048,
      providerOptions: {
        google: { thinkingConfig: { thinkingBudget: 0 } },
      },
    });

    const description = text?.trim();

    if (!description) {
      return NextResponse.json(
        { error: "No se pudo generar la descripción" },
        { status: 500 }
      );
    }

    return NextResponse.json({ description });
  } catch (e) {
    console.error("[ai/describe]", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Error al generar descripción",
      },
      { status: 500 }
    );
  }
}
