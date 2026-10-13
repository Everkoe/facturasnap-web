import React, { useState } from 'react';
import { calculateFromLineTotal, getLineTotal, INPUT_MODE } from '../utils/calculations';
import { copyText } from '../utils/greeting';

const COPIED_FEEDBACK_MS = 2000;

const FIELD_LABEL = 'text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide';
const INPUT_BASE =
  'w-full h-12 px-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors';

export const InvoiceItem = ({ item, index, onUpdate, onRemove, onEnter, onToggleMode, autoFocus }) => {
  const isUnitMode = item.mode === INPUT_MODE.UNIT;
  const lineTotal = getLineTotal(item);
  const calcs = calculateFromLineTotal(lineTotal, item.quantity);
  const [copiedUnitPrice, setCopiedUnitPrice] = useState(false);

  const copyUnitPriceToClipboard = () => {
    copyText(calcs.unitSubtotal).then((ok) => {
      if (!ok) return;
      setCopiedUnitPrice(true);
      setTimeout(() => setCopiedUnitPrice(false), COPIED_FEEDBACK_MS);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700 mb-3 transition-colors">
      <div className="flex items-start gap-3">
        <span className="mt-6 hidden h-7 w-7 shrink-0 items-center sm:flex justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-500 dark:text-gray-300">
          {index + 1}
        </span>

        {/* Cantidad */}
        <div className="w-24 shrink-0">
          <label className={`${FIELD_LABEL} mb-1 block`}>Cantidad</label>
          <input
            type="number"
            inputMode="decimal"
            onFocus={(e) => e.target.select()}
            className={`${INPUT_BASE} bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-center text-lg font-semibold text-gray-800 dark:text-gray-200`}
            value={item.quantity}
            onChange={(e) => onUpdate(item.id, 'quantity', e.target.value)}
          />
        </div>

        {/* Monto (total de la línea o precio unitario, ambos con IGV) */}
        <div className="min-w-0 flex-1">
          <label className={`${FIELD_LABEL} mb-1 block whitespace-nowrap`}>
            {isUnitMode ? 'Unitario c/ IGV' : 'Total c/ IGV'}
          </label>
          <input
            type="number"
            inputMode="decimal"
            autoFocus={autoFocus}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && lineTotal !== '') onEnter();
            }}
            className={`${INPUT_BASE} bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-xl font-bold text-blue-700 dark:text-blue-300 placeholder:text-blue-300 dark:placeholder:text-blue-800`}
            placeholder="0.00"
            value={item.total}
            onChange={(e) => onUpdate(item.id, 'total', e.target.value)}
          />
        </div>

        <button
          onClick={() => onRemove(item.id)}
          tabIndex={-1}
          title="Eliminar fila"
          className="mt-6 flex h-12 w-9 shrink-0 items-center justify-center rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Desglose de la línea */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs font-mono text-gray-500 dark:text-gray-400">
        <span>Subtotal <b className="font-semibold text-gray-700 dark:text-gray-300">S/ {calcs.lineSubtotal}</b></span>
        <span>IGV <b className="font-semibold text-gray-700 dark:text-gray-300">S/ {calcs.lineIgv}</b></span>
        {isUnitMode && lineTotal !== '' && (
          <span>Total <b className="font-semibold text-gray-700 dark:text-gray-300">S/ {lineTotal}</b></span>
        )}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => onToggleMode(item.id)}
          title="Cambiar entre monto total y precio unitario"
          className="ml-auto rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 font-sans text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          {isUnitMode ? '⇄ Escribir total' : '⇄ Escribir unitario'}
        </button>
      </div>

      {/* Precio unitario sin IGV: lo que se copia a SUNAT */}
      <button
        onClick={copyUnitPriceToClipboard}
        className={`mt-3 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all active:scale-[0.99] ${
          copiedUnitPrice
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
        }`}
      >
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-80">Precio unitario sin IGV</span>
          <span className="block font-mono text-xl font-bold leading-tight">S/ {calcs.unitSubtotal}</span>
        </span>
        <span className="text-xs font-bold">{copiedUnitPrice ? '✓ ¡Copiado!' : 'Copiar'}</span>
      </button>

      {!calcs.isExact && (
        <p className="mt-2 text-center text-[11px] text-amber-600 dark:text-amber-400">
          Con este monto SUNAT puede variar S/ 0.01 por redondeo.
        </p>
      )}
    </div>
  );
};
