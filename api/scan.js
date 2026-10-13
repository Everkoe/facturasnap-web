// Función serverless de Vercel: lee una nota de venta con Gemini y devuelve el documento (RUC/DNI) y las filas.
// La clave vive solo en la variable de entorno GEMINI_API_KEY; nunca llega al navegador.

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
// Se prueban en orden; los 2.5 solo se sirven a cuentas que ya los usaban, por eso arrancamos con la serie 3
const MODELS = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];
const MAX_BASE64_CHARS = 4_000_000;
const MAX_ITEMS = 50;
const REQUEST_TIMEOUT_MS = 20_000;
const OVERLOAD_RETRY_DELAY_MS = 1500;
const OVERLOAD_RETRIES = 1;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const PROMPT = `Eres un asistente que lee notas de venta peruanas escritas a mano o impresas.
Extrae:
- documento: el RUC (11 dígitos) o DNI (8 dígitos) del CLIENTE, escrito junto a "Señor(es)". Devuélvelo solo con dígitos, sin espacios ni guiones. No uses teléfonos, el número de la nota ni datos del negocio que emite la nota. Si no hay, devuelve null.
- items: cada fila escrita en la tabla, con cantidad (número), descripcion (texto) e importe (el monto total de esa fila, número). Ignora filas vacías.
- total: el total final de la nota como número, o null si no se ve.
Si un número manuscrito es dudoso, devuelve tu mejor lectura. No inventes datos que no estén en la imagen.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    documento: { type: 'STRING', nullable: true },
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          cantidad: { type: 'NUMBER' },
          descripcion: { type: 'STRING' },
          importe: { type: 'NUMBER' },
        },
        required: ['cantidad', 'descripcion', 'importe'],
      },
    },
    total: { type: 'NUMBER', nullable: true },
  },
  required: ['items'],
};

const isSameOrigin = (req) => {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

/** Normaliza lo que devuelve el modelo para no confiar en su formato. */
export const sanitizeResult = (raw) => {
  const documento = typeof raw?.documento === 'string' ? raw.documento.replace(/\D/g, '') : '';
  const items = (Array.isArray(raw?.items) ? raw.items : [])
    .slice(0, MAX_ITEMS)
    .map((item) => ({
      cantidad: toNumber(item?.cantidad),
      descripcion: String(item?.descripcion ?? '').slice(0, 120),
      importe: toNumber(item?.importe),
    }))
    .filter((item) => item.cantidad !== null && item.cantidad > 0 && item.importe !== null && item.importe > 0);

  return { documento: documento || null, items, total: toNumber(raw?.total) };
};

class GeminiError extends Error {
  constructor(status, geminiStatus) {
    super(`Gemini respondió ${status} ${geminiStatus}`);
    this.status = status;
    this.geminiStatus = geminiStatus;
  }
}

// Errores donde probar con otro modelo tiene sentido (cuota por modelo, modelo retirado, sobrecarga)
const RETRYABLE_STATUSES = new Set([404, 429, 500, 503]);

const getModels = () => [...new Set([process.env.GEMINI_MODEL, ...MODELS].filter(Boolean))];

const askGemini = async ({ image, mimeType }, model) => {
  const response = await fetch(`${GEMINI_URL}/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mimeType, data: image } }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA },
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    console.error(`Gemini ${model} ${response.status}:`, JSON.stringify(body?.error ?? body).slice(0, 500));
    throw new GeminiError(response.status, body?.error?.status ?? '');
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini no devolvió texto');
  return JSON.parse(text);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Un modelo saturado (503) se reintenta una vez; otros errores pasan directo al siguiente modelo. */
const askModelWithRetry = async (input, model) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await askGemini(input, model);
    } catch (error) {
      const isOverloaded = error instanceof GeminiError && error.status === 503;
      if (!isOverloaded || attempt >= OVERLOAD_RETRIES) throw error;
      await sleep(OVERLOAD_RETRY_DELAY_MS);
    }
  }
};

const scanWithFallback = async (input) => {
  let lastError;
  for (const model of getModels()) {
    try {
      return await askModelWithRetry(input, model);
    } catch (error) {
      lastError = error;
      const canTryNext = error.name === 'TimeoutError' || (error instanceof GeminiError && RETRYABLE_STATUSES.has(error.status));
      if (!canTryNext) break;
    }
  }
  throw lastError;
};

const describeError = (error) => {
  if (error.name === 'TimeoutError') return 'Gemini tardó demasiado en responder. Intenta de nuevo.';
  if (!(error instanceof GeminiError)) return 'No se pudo interpretar la respuesta. Intenta de nuevo con una foto más clara.';
  const detail = `(Gemini ${error.status}${error.geminiStatus ? ` ${error.geminiStatus}` : ''})`;
  if (error.status === 429) return `Se alcanzó el límite gratuito de Gemini. Espera un minuto e intenta de nuevo. ${detail}`;
  if (error.status === 400 || error.status === 403) return `Gemini rechazó la solicitud: revisa que la clave GEMINI_API_KEY sea válida. ${detail}`;
  if (error.status === 404) return `El modelo de Gemini no está disponible. ${detail}`;
  return error.status === 503
    ? `Los servidores de Gemini están saturados ahora mismo. Espera un momento e intenta de nuevo. ${detail}`
    : `Gemini no pudo procesar la imagen. Intenta de nuevo. ${detail}`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!isSameOrigin(req)) return res.status(403).json({ error: 'Origen no permitido' });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Falta configurar GEMINI_API_KEY en Vercel' });

  const { image, mimeType } = req.body ?? {};
  if (typeof image !== 'string' || !image || image.length > MAX_BASE64_CHARS) {
    return res.status(400).json({ error: 'Imagen inválida o demasiado grande' });
  }
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return res.status(400).json({ error: 'Formato de imagen no permitido' });
  }

  try {
    const raw = await scanWithFallback({ image, mimeType });
    return res.status(200).json(sanitizeResult(raw));
  } catch (error) {
    console.error('scan error:', error.message);
    return res.status(502).json({ error: describeError(error) });
  }
}
