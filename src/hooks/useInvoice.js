import { useState, useEffect } from 'react';
import { calculateFromTotal } from '../utils/calculations';

export const useInvoice = () => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('invoice_items');
    return saved ? JSON.parse(saved) : [{ id: crypto.randomUUID(), description: '', quantity: 1, total: '' }];
  });

  const [clientData, setClientData] = useState(() => {
    const saved = localStorage.getItem('invoice_client');
    return saved ? JSON.parse(saved) : { type: '6', number: '', name: '', currency: 'PEN', docType: '1' };
  });

  useEffect(() => {
    localStorage.setItem('invoice_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('invoice_client', JSON.stringify(clientData));
  }, [clientData]);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: '', quantity: 1, total: '' }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const totals = items.reduce((acc, item) => {
    const calcs = calculateFromTotal(item.total, item.quantity);
    return {
      subtotal: acc.subtotal + parseFloat(calcs.subtotal),
      igv: acc.igv + parseFloat(calcs.igv),
      total: acc.total + parseFloat(calcs.total),
    };
  }, { subtotal: 0, igv: 0, total: 0 });

  return {
    items,
    clientData,
    totals,
    addItem,
    removeItem,
    updateItem,
    setClientData
  };
};
