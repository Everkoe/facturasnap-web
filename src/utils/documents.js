const RUC_LENGTH = 11;
const DNI_LENGTH = 8;
const RUC_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
const RUC_PREFIXES = ['10', '15', '16', '17', '20'];
const MODULUS = 11;

/** Valida el dígito verificador de un RUC peruano (módulo 11). */
export const isValidRuc = (ruc) => {
  if (!/^\d{11}$/.test(ruc) || !RUC_PREFIXES.includes(ruc.slice(0, 2))) return false;
  const sum = RUC_WEIGHTS.reduce((acc, weight, i) => acc + weight * Number(ruc[i]), 0);
  const check = (MODULUS - (sum % MODULUS)) % 10;
  return check === Number(ruc[RUC_LENGTH - 1]);
};

/**
 * Clasifica el documento leído: { kind: 'RUC' | 'DNI' | 'DESCONOCIDO', isValid }.
 * El DNI solo se puede validar por longitud (no tiene dígito verificador público).
 */
export const classifyDocument = (number) => {
  if (number?.length === RUC_LENGTH) return { kind: 'RUC', isValid: isValidRuc(number) };
  if (number?.length === DNI_LENGTH) return { kind: 'DNI', isValid: true };
  return { kind: 'DESCONOCIDO', isValid: false };
};
