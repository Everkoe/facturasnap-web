import React, { useState } from 'react';
import { copyText } from '../utils/greeting';

const FEEDBACK_MS = 1500;

const VARIANTS = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600',
  soft: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50',
};
const COPIED_STYLE = 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';

/** Botón de ancho completo que muestra un valor y lo copia al hacer clic. */
export const CopyValue = ({ label, value, variant = 'soft', large = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!(await copyText(value))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), FEEDBACK_MS);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 text-left transition-all active:scale-[0.99] ${
        large ? 'py-3' : 'py-2.5'
      } ${copied ? COPIED_STYLE : VARIANTS[variant]}`}
    >
      <span className="min-w-0">
        <span className="block truncate text-[10px] font-semibold uppercase tracking-wide opacity-80">{label}</span>
        <span className={`block font-mono font-bold leading-tight ${large ? 'text-2xl' : 'text-base'}`}>S/ {value}</span>
      </span>
      <span className="shrink-0 text-xs font-bold">{copied ? '✓ Copiado' : 'Copiar'}</span>
    </button>
  );
};
