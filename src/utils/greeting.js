const STORE_NAME = 'ferretería Ansu';
const LIMA_TIME_ZONE = 'America/Lima';

export const getGreeting = (date = new Date()) => {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: LIMA_TIME_ZONE,
    }).format(date),
  );
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

export const buildInvoiceMessage = (date = new Date()) =>
  `${getGreeting(date)}, le comunicamos de la ${STORE_NAME} para adjuntarle la factura de su compra.`;

export const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  }
};
