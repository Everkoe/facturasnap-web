import React, { useState, useEffect, useRef } from 'react';
import { CopyValue } from './CopyValue';
import { prepareImage } from '../utils/image';
import { classifyDocument, isValidMobile } from '../utils/documents';

const ITEMS_TOLERANCE = 0.01;

const readImageFromClipboard = (event) =>
  [...(event.clipboardData?.items ?? [])].find((item) => item.type.startsWith('image/'))?.getAsFile() ?? null;

const requestScan = async (file) => {
  const { image, mimeType } = await prepareImage(file);
  const response = await fetch('/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, mimeType }),
  });
  if (response.status === 404) {
    throw new Error('La lectura de notas solo funciona en la página publicada en Vercel.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'No se pudo leer la imagen.');
  return data;
};

const Notice = ({ tone, children }) => (
  <p className={`mt-2 text-xs ${tone === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
    {children}
  </p>
);

export const DocumentScanner = ({ onLoadItems }) => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const fileInputRef = useRef(null);

  const scan = async (file) => {
    setStatus('loading');
    setError('');
    setResult(null);
    setLoaded(false);
    try {
      setResult(await requestScan(file));
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    const handlePaste = (event) => {
      const file = readImageFromClipboard(event);
      if (file) scan(file);
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (file) scan(file);
  };

  const handleLoadItems = () => {
    onLoadItems(result.items.map(({ cantidad, importe }) => ({ quantity: cantidad, total: importe })));
    setLoaded(true);
  };

  const doc = result?.documento ? classifyDocument(result.documento) : null;
  const hasPhone = Boolean(result?.telefono);
  const itemsSum = result?.items.reduce((acc, item) => acc + item.importe, 0) ?? 0;
  const totalMatches = result?.total != null && Math.abs(itemsSum - result.total) < ITEMS_TOLERANCE;

  return (
    <section className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700 transition-colors">
      <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Leer nota de venta</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Sube una foto o pega una imagen con Ctrl+V.</p>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <button
        onClick={() => fileInputRef.current.click()}
        disabled={status === 'loading'}
        className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95 disabled:opacity-60 transition-all"
      >
        {status === 'loading' ? 'LEYENDO NOTA…' : 'SUBIR O TOMAR FOTO'}
      </button>

      {status === 'error' && <Notice tone="warn">{error}</Notice>}

      {result && (
        <div className="mt-3 space-y-3">
          {doc ? (
            <div>
              <CopyValue label={`${doc.kind} del cliente`} value={result.documento} variant="primary" large raw />
              {doc.kind === 'RUC' && doc.isValid && <Notice tone="ok">RUC válido (dígito verificador correcto).</Notice>}
              {doc.kind === 'RUC' && !doc.isValid && <Notice tone="warn">El dígito verificador no cuadra: revisa el número en la foto.</Notice>}
              {doc.kind === 'DESCONOCIDO' && <Notice tone="warn">El número no tiene 8 ni 11 dígitos: revísalo.</Notice>}
            </div>
          ) : (
            <Notice tone="warn">No se encontró RUC ni DNI en la imagen.</Notice>
          )}

          {hasPhone && (
            <div>
              <CopyValue label="Celular del cliente" value={result.telefono} raw />
              {!isValidMobile(result.telefono) && (
                <Notice tone="warn">No parece un celular de 9 dígitos que empiece con 9: revísalo en la foto.</Notice>
              )}
            </div>
          )}

          {result.items.length > 0 && (
            <div>
              <ul className="divide-y divide-gray-100 dark:divide-gray-700 text-xs text-gray-700 dark:text-gray-300">
                {result.items.map((item, index) => (
                  <li key={index} className="flex justify-between gap-3 py-1.5">
                    <span className="min-w-0 truncate">{item.cantidad} × {item.descripcion}</span>
                    <span className="font-mono font-semibold">S/ {item.importe.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              {result.total != null && !totalMatches && (
                <Notice tone="warn">Las filas suman S/ {itemsSum.toFixed(2)} pero la nota dice S/ {result.total.toFixed(2)}: revisa los montos.</Notice>
              )}
              {totalMatches && <Notice tone="ok">Las filas suman el total de la nota (S/ {itemsSum.toFixed(2)}).</Notice>}
              <button
                onClick={handleLoadItems}
                disabled={loaded}
                className="mt-2 w-full py-2.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:bg-green-50 disabled:text-green-700 transition-all"
              >
                {loaded ? '✓ Filas cargadas en la calculadora' : 'Cargar filas en la calculadora'}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
