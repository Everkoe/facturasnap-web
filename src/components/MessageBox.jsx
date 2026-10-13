import React, { useState, useEffect } from 'react';
import { buildInvoiceMessage, copyText } from '../utils/greeting';

const REFRESH_MS = 30_000;
const FEEDBACK_MS = 2000;

export const MessageBox = () => {
  const [message, setMessage] = useState(() => buildInvoiceMessage());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setMessage(buildInvoiceMessage()), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const handleCopy = async () => {
    const fresh = buildInvoiceMessage();
    setMessage(fresh);
    if (await copyText(fresh)) {
      setCopied(true);
      setTimeout(() => setCopied(false), FEEDBACK_MS);
    }
  };

  return (
    <section className="mt-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <h2 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-3">
        Mensaje para el cliente
      </h2>
      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3">
        {message}
      </p>
      <button
        onClick={handleCopy}
        className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
          copied
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95'
        }`}
      >
        {copied ? '¡MENSAJE COPIADO!' : 'COPIAR MENSAJE'}
      </button>
    </section>
  );
};
