import { useState, useEffect } from 'react';
import { calculateFromLineTotal } from '../utils/calculations'; // Importar la nueva función

export const useInvoice = () => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('invoice_items');
    // item.total ahora representa el lineTotalIncIGV
    return saved ? JSON.parse(saved) : [{ id: crypto.randomUUID(), quantity: 1, total: '' }];
  });

  useEffect(() => {
    localStorage.setItem('invoice_items', JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    setItems(prevItems => [...prevItems, { id: crypto.randomUUID(), quantity: 1, total: '' }]);
  };

  const removeItem = (id) => {
    setItems(prevItems => {
      if (prevItems.length > 1) {
        return prevItems.filter(item => item.id !== id);
      }
      return prevItems;
    });
  };

  const updateItem = (id, field, value) => {
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id) {
          // Aseguramos que quantity y total se guarden como números o cadena vacía
          const updatedValue = (field === 'quantity' || field === 'total') ? (value === '' ? '' : Number(value)) : value;
          return { ...item, [field]: updatedValue };
        }
        return item;
      });
    });
  };

  const totals = items.reduce((acc, item) => {
    // Usamos la nueva función calculateFromLineTotal
    const calcs = calculateFromLineTotal(item.total, item.quantity);
    return {
      subtotal: acc.subtotal + parseFloat(calcs.lineSubtotal),
      igv: acc.igv + parseFloat(calcs.lineIgv),
      total: acc.total + parseFloat(calcs.lineTotalIncIGV),
    };
  }, { subtotal: 0, igv: 0, total: 0 });

  return {
    items,
    totals,
    addItem,
    removeItem,
    updateItem,
  };
};