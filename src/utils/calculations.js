export const IGV_RATE = 0.18;

/**
 * Calcula los valores de una línea de ítem basándose en el monto total de la línea (incluido IGV) y la cantidad.
 * @param {number|string} lineTotalIncIGV - El monto total de la línea incluyendo IGV.
 * @param {number|string} quantity - La cantidad de unidades.
 * @returns {object} Un objeto con los cálculos de la línea y unitarios.
 */
export const calculateFromLineTotal = (lineTotalIncIGV, quantity = 1) => {
  const numericLineTotalIncIGV = Number(lineTotalIncIGV);
  const numericQuantity = Number(quantity);

  // Si alguno de los valores no es un número válido o es cero, retornamos ceros
  if (isNaN(numericLineTotalIncIGV) || isNaN(numericQuantity) || numericLineTotalIncIGV === 0 || numericQuantity === 0) {
    return {
      lineSubtotal: '0.00',
      lineIgv: '0.00',
      lineTotalIncIGV: '0.00',
      unitPriceIncIGV: '0.00', // Precio unitario incluyendo IGV
      unitSubtotal: '0.00',    // Precio unitario sin IGV
    };
  }

  // Cálculos de la línea completa
  const lineSubtotal = numericLineTotalIncIGV / (1 + IGV_RATE);
  const lineIgv = numericLineTotalIncIGV - lineSubtotal;

  // Cálculos unitarios
  const unitPriceIncIGV = numericLineTotalIncIGV / numericQuantity;
  const unitSubtotal = lineSubtotal / numericQuantity;

  return {
    lineSubtotal: lineSubtotal.toFixed(2),
    lineIgv: lineIgv.toFixed(2),
    lineTotalIncIGV: numericLineTotalIncIGV.toFixed(2),
    unitPriceIncIGV: unitPriceIncIGV.toFixed(2),
    unitSubtotal: unitSubtotal.toFixed(2),
  };
};

export const formatNubefactItem = (item) => {
  // item.total ahora es lineTotalIncIGV
  const calcs = calculateFromLineTotal(item.total, item.quantity);
  return {
    unidad_de_medida: "NIU", // O el valor que corresponda
    codigo: item.code || "P001", // Si se necesita un código
    descripcion: item.description || "Producto/Servicio", // Si se necesita descripción
    cantidad: parseFloat(item.quantity),
    valor_unitario: parseFloat(calcs.unitSubtotal), // Precio unitario sin IGV
    precio_unitario: parseFloat(calcs.unitPriceIncIGV), // Precio unitario con IGV
    subtotal: parseFloat(calcs.lineSubtotal), // Subtotal de la línea
    tipo_de_igv: 1, // Gravado
    igv: parseFloat(calcs.lineIgv), // IGV de la línea
    total: parseFloat(calcs.lineTotalIncIGV), // Total de la línea (Inc. IGV)
  };
};