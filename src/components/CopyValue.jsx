import React, { useState } from 'react';
import { copyText } from '../utils/greeting';

const FEEDBACK_MS = 1500;

export const CopyValue = ({ value, small = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!(await copyText(value))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), FEEDBACK_MS);
  };

  return (
    <button
      onClick={handleCopy}
      className={`rounded-lg font-bold transition-all ${small ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-2 text-xs'} ${
        copied
          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
      }`}
    >
      {copied ? '¡Copiado!' : 'Copiar'}
    </button>
  );
};
