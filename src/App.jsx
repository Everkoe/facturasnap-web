import React from 'react';
import { useInvoice } from './hooks/useInvoice';
import { useTheme } from './hooks/useTheme';
import { InvoiceItem } from './components/InvoiceItem';
import { MessageBox } from './components/MessageBox';
import { CopyValue } from './components/CopyValue';

function App() {
  const { items, totals, addItem, removeItem, updateItem, resetItems } = useInvoice();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-40 font-sans transition-colors"> {/* Aumentado pb-32 a pb-48 */}
      {/* Header Minimalista */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-4 sticky top-0 z-10 transition-colors">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-black text-blue-600 dark:text-blue-500 tracking-tight flex items-center gap-2">
            FACTURASNAP
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full uppercase">Calculadora</span>
          </h1>
          
          <div className="flex items-center gap-3">
            {/* Botón de Tema */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              title="Cambiar tema"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              )}
            </button>

            <button 
              onClick={() => {
                  if (confirm('¿Empezar una nueva factura? Se borrarán todas las filas.')) resetItems();
              }} 
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Nueva factura"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 lg:grid lg:grid-cols-[36rem_1fr] lg:gap-6 lg:items-start">
        <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">Conceptos</h2>
          <button 
            onClick={addItem}
            className="bg-blue-600 dark:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95 transition-all"
          >
            + Nueva Fila
          </button>
        </div>
        
        <div className="space-y-1">
          {items.map((item, index) => (
            <InvoiceItem 
              key={item.id} 
              item={item} 
              onUpdate={updateItem} 
              onRemove={removeItem}
              onEnter={addItem}
              autoFocus={index === items.length - 1 && items.length > 1}
            />
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-300 dark:text-gray-800 mb-2 italic text-sm">Calculadora vacía</div>
            <button onClick={addItem} className="text-blue-500 font-bold hover:underline">Añadir primera fila</button>
          </div>
        )}

        </div>

        <MessageBox />
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-5 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] dark:shadow-none z-20 transition-colors">
        <div className="max-w-5xl mx-auto">
        <div className="space-y-4 lg:w-[36rem]">
          
          {/* Sección del Total a Cobrar (sin funcionalidad de copiar) */}
          <div 
            className={`group flex justify-between items-center p-3 rounded-2xl transition-all border-2 bg-gray-50 dark:bg-gray-800/50 border-transparent dark:border-gray-800`}
          >
            <div>
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-none mb-1">TOTAL A COBRAR</div>
              <div className="text-xl font-mono font-bold text-gray-800 dark:text-gray-200 transition-colors">
                S/ {totals.total.toFixed(2)}
              </div>
            </div>
            <CopyValue value={totals.total.toFixed(2)} />
          </div>

          <div className="flex justify-between items-center px-2">
            <div>
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Subtotal (Sin IGV)</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">S/ {totals.subtotal.toFixed(2)}</span>
                <CopyValue value={totals.subtotal.toFixed(2)} small />
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">IGV (18%)</div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">S/ {totals.igv.toFixed(2)}</span>
                <CopyValue value={totals.igv.toFixed(2)} small />
              </div>
            </div>
          </div>

        </div>
        </div>
      </footer>
    </div>
  );
}

export default App;