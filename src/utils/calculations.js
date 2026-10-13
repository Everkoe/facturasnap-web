export const IGV_RATE = 0.18;

const MAX_UNIT_DECIMALS = 10;
const MIN_UNIT_DECIMALS = 2;

const toCents = (value) => Math.round(value * 100 + 1e-9 * Math.sign(value));
const fromCents = (cents) => (cents / 100).toFixed(2);
const igvOfBaseCents = (baseCents) => Math.round(baseCents * IGV_RATE);

/**
 * Busca la base imponible (en céntimos) tal como la calcula SUNAT:
 * base + round(base * 18%) = total. Se prefiere la más cercana a total / 1.18.
 * Devuelve null si ningún valor de base produce ese total exacto.
 */
const findExactBaseCents = (totalCents) => {
  const ideal = Math.round(totalCents / (1 + IGV_RATE));
  for (const offset of [0, -1, 1, -2, 2]) {
    const base = ideal + offset;
    if (base + igvOfBaseCents(base) === totalCents) return base;
  }
  return null;
};

/**
 * Menor cantidad de decimales del precio unitario tal que cantidad * unitario
 * redondeado a 2 decimales reproduzca la base imponible.
 */
const findUnitDecimals = (baseCents, quantity) => {
  const exactUnit = baseCents / 100 / quantity;
  for (let decimals = MIN_UNIT_DECIMALS; decimals <= MAX_UNIT_DECIMALS; decimals++) {
    const unit = Number(exactUnit.toFixed(decimals));
    if (toCents(unit * quantity) === baseCents) return decimals;
  }
  return MAX_UNIT_DECIMALS;
};

const EMPTY_RESULT = {
  lineSubtotal: '0.00',
  lineIgv: '0.00',
  lineTotalIncIGV: '0.00',
  unitPriceIncIGV: '0.00',
  unitSubtotal: '0.00',
  lineSubtotalCents: 0,
  lineIgvCents: 0,
  lineTotalCents: 0,
  isExact: true,
};

/**
 * Calcula los valores de una línea a partir del monto total (con IGV) y la cantidad,
 * de modo que al ingresar `unitSubtotal` en SUNAT el total vuelva a ser el mismo.
 * `unitSubtotal` usa los decimales necesarios (2 a 10); `isExact` es false cuando
 * ninguna base de 2 decimales puede producir ese total exacto (diferencia inevitable de S/ 0.01).
 */
export const calculateFromLineTotal = (lineTotalIncIGV, quantity = 1) => {
  const total = Number(lineTotalIncIGV);
  const qty = Number(quantity);

  if (!Number.isFinite(total) || !Number.isFinite(qty) || total <= 0 || qty <= 0) {
    return EMPTY_RESULT;
  }

  const totalCents = toCents(total);
  const exactBase = findExactBaseCents(totalCents);
  const isExact = exactBase !== null;
  const baseCents = isExact ? exactBase : Math.round(totalCents / (1 + IGV_RATE));
  const igvCents = isExact ? igvOfBaseCents(baseCents) : totalCents - baseCents;

  const decimals = findUnitDecimals(baseCents, qty);
  const unitSubtotal = (baseCents / 100 / qty).toFixed(decimals);

  return {
    lineSubtotal: fromCents(baseCents),
    lineIgv: fromCents(igvCents),
    lineTotalIncIGV: fromCents(totalCents),
    unitPriceIncIGV: (totalCents / 100 / qty).toFixed(Math.max(2, decimals)),
    unitSubtotal,
    lineSubtotalCents: baseCents,
    lineIgvCents: igvCents,
    lineTotalCents: totalCents,
    isExact,
  };
};

/** Suma las líneas en céntimos para que subtotal + IGV = total sin descuadres. */
export const sumLines = (items) => {
  const cents = items.reduce(
    (acc, item) => {
      const calcs = calculateFromLineTotal(item.total, item.quantity);
      return {
        subtotal: acc.subtotal + calcs.lineSubtotalCents,
        igv: acc.igv + calcs.lineIgvCents,
        total: acc.total + calcs.lineTotalCents,
      };
    },
    { subtotal: 0, igv: 0, total: 0 },
  );
  return {
    subtotal: cents.subtotal / 100,
    igv: cents.igv / 100,
    total: cents.total / 100,
  };
};

export const formatNubefactItem = (item) => {
  const calcs = calculateFromLineTotal(item.total, item.quantity);
  return {
    unidad_de_medida: "NIU",
    codigo: item.code || "P001",
    descripcion: item.description || "Producto/Servicio",
    cantidad: parseFloat(item.quantity),
    valor_unitario: parseFloat(calcs.unitSubtotal),
    precio_unitario: parseFloat(calcs.unitPriceIncIGV),
    subtotal: parseFloat(calcs.lineSubtotal),
    tipo_de_igv: 1,
    igv: parseFloat(calcs.lineIgv),
    total: parseFloat(calcs.lineTotalIncIGV),
  };
};
