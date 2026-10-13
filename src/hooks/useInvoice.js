import { useState, useEffect } from 'react';
import { sumLines, getLineTotal, INPUT_MODE } from '../utils/calculations';

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
    // La fila nueva hereda el modo de la última para no cambiar de modo en cada fila
    setItems(prevItems => {
      const mode = prevItems[prevItems.length - 1]?.mode ?? INPUT_MODE.TOTAL;
      return [...prevItems, { id: crypto.randomUUID(), quantity: 1, total: '', mode }];
    });
  };

  const toggleMode = (id) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id !== id) return item;
      const qty = Number(item.quantity);
      if (item.mode === INPUT_MODE.UNIT) {
        return { ...item, mode: INPUT_MODE.TOTAL, total: getLineTotal(item) };
      }
      const entered = Number(item.total);
      const unit = entered > 0 && qty > 0 ? String(Number((entered / qty).toFixed(4))) : '';
      return { ...item, mode: INPUT_MODE.UNIT, total: unit };
    }));
  };

  // Agrega filas leídas de una nota; si la calculadora está vacía las reemplaza
  const loadItems = (newItems) => {
    setItems(prevItems => {
      const isEmpty = prevItems.every(item => item.total === '');
      const mapped = newItems.map(({ quantity, total }) => ({
        id: crypto.randomUUID(), quantity, total: String(total), mode: INPUT_MODE.TOTAL,
      }));
      return isEmpty ? mapped : [...prevItems, ...mapped];
    });
  };

  const resetItems = () => {
    setItems([{ id: crypto.randomUUID(), quantity: 1, total: '' }]);
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
          // Se guarda el texto tal cual para no alterar lo que el usuario escribe (ej. "2.")
          return { ...item, [field]: value };
        }
        return item;
      });
    });
  };

  const totals = sumLines(items);

  return {
    items,
    totals,
    addItem,
    removeItem,
    updateItem,
    toggleMode,
    loadItems,
    resetItems,
  };
};