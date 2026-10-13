import { useState, useEffect } from 'react';
import { sumLines } from '../utils/calculations';

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
    resetItems,
  };
};