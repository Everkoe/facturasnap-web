export const IGV_RATE = 0.18;

export const calculateFromTotal = (total, quantity = 1) => {
  const numericTotal = parseFloat(total) || 0;
  const numericQuantity = parseFloat(quantity) || 1;

  const subtotal = numericTotal / (1 + IGV_RATE);
  const igv = numericTotal - subtotal;
  const unitPrice = subtotal / numericQuantity;

  return {
    subtotal: subtotal.toFixed(2),
    igv: igv.toFixed(2),
    unitPrice: unitPrice.toFixed(2),
    total: numericTotal.toFixed(2),
  };
};

export const formatNubefactItem = (item) => {
  const calcs = calculateFromTotal(item.total, item.quantity);
  return {
    unidad_de_medida: "NIU",
    codigo: item.code || "P001",
    descripcion: item.description || "Producto/Servicio",
    cantidad: parseFloat(item.quantity),
    valor_unitario: parseFloat(calcs.unitPrice),
    precio_unitario: parseFloat((parseFloat(calcs.unitPrice) * (1 + IGV_RATE)).toFixed(10)),
    subtotal: parseFloat(calcs.subtotal),
    tipo_de_igv: 1,
    igv: parseFloat(calcs.igv),
    total: parseFloat(calcs.total),
  };
};
