import React, { useState } from 'react';
import { calculateFromLineTotal } from '../utils/calculations';
import { copyText } from '../utils/greeting';

export const InvoiceItem = ({ item, onUpdate, onRemove, onEnter, autoFocus }) => {
  // item.total ahora es el lineTotalIncIGV
  const calcs = calculateFromLineTotal(item.total, item.quantity);
  const [copiedUnitPrice, setCopiedUnitPrice] = useState(false);

  const copyUnitPriceToClipboard = () => {
    // Copiamos el precio unitario sin IGV
    copyText(calcs.unitSubtotal).then((ok) => {
      if (!ok) return;
      setCopiedUnitPrice(true);
      setTimeout(() => setCopiedUnitPrice(false), 2000);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-3 animate-in fade-in slide-in-from-bottom-2 transition-colors">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Cantidad */}
        <div className="col-span-3">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 block">Cant.</label>
          <input
            type="number"
            inputMode="decimal"
            onFocus={(e) => e.target.select()}
            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-center font-semibold dark:text-gray-200 transition-colors"
            value={item.quantity}
            onChange={(e) => onUpdate(item.id, 'quantity', e.target.value)}
          />
        </div>

        {/* Monto Total (Inc. IGV) */}
        <div className="col-span-6">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 block">Monto Total (Inc. IGV)</label>
          <input
            type="number"
            inputMode="decimal"
            autoFocus={autoFocus}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && item.total !== '') onEnter();
            }}
            className="w-full p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-blue-700 dark:text-blue-400 text-lg transition-colors"
            placeholder="0.00"
            value={item.total} // item.total ahora es el lineTotalIncIGV
            onChange={(e) => onUpdate(item.id, 'total', e.target.value)}
          />
        </div>

        {/* Desglose Rápido y Borrar */}
        <div className="col-span-3 flex flex-col items-end gap-1">
          <button 
            onClick={() => onRemove(item.id)}
            tabIndex={-1}
            className="p-2 text-red-300 hover:text-red-500 dark:text-red-900/50 dark:hover:text-red-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="text-[9px] text-gray-400 dark:text-gray-600 text-right font-mono">
            <div>Sub. Línea: S/ {calcs.lineSubtotal}</div>
            <div>IGV Línea: S/ {calcs.lineIgv}</div>
          </div>
        </div>
      </div>
      {/* Botón de Copiar Precio Unitario */}
      <div className="mt-3">
        <button 
          onClick={copyUnitPriceToClipboard}
          className={`w-full text-center py-2 rounded-lg text-xs font-bold transition-all ${
            copiedUnitPrice 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
          }`}
        >
          {copiedUnitPrice ? '¡PRECIO UNITARIO COPIADO!' : `COPIAR PRECIO UNITARIO (SIN IGV): S/ ${calcs.unitSubtotal}`}
        </button>
        {!calcs.isExact && (
          <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 text-center">
            Ojo: con este monto SUNAT puede variar S/ 0.01 por redondeo.
          </p>
        )}
      </div>
    </div>
  );
};