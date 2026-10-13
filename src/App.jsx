import React from 'react';
import { useInvoice } from './hooks/useInvoice';
import { useTheme } from './hooks/useTheme';
import { InvoiceItem } from './components/InvoiceItem';
import { MessageBox } from './components/MessageBox';
import { DocumentScanner } from './components/DocumentScanner';
import { TotalsPanel } from './components/TotalsPanel';

function App() {
  const { items, totals, addItem, removeItem, updateItem, toggleMode, loadItems, resetItems } = useInvoice();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-44 lg:pb-10 font-sans transition-colors">
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

      <main className="max-w-5xl mx-auto p-4 lg:grid lg:grid-cols-[38rem_1fr] lg:gap-8 lg:items-start">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">Conceptos</h2>
            <button
              onClick={addItem}
              className="bg-blue-600 dark:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95 transition-all"
            >
              + Nueva fila
            </button>
          </div>

          {items.map((item, index) => (
            <InvoiceItem
              key={item.id}
              item={item}
              index={index}
              onUpdate={updateItem}
              onRemove={removeItem}
              onEnter={addItem}
              onToggleMode={toggleMode}
              autoFocus={index === items.length - 1 && items.length > 1}
            />
          ))}
        </div>

        <aside className="mt-6 space-y-4 lg:mt-0 lg:sticky lg:top-24">
          <TotalsPanel totals={totals} className="hidden lg:block shadow-sm" />
          <MessageBox />
          <DocumentScanner onLoadItems={loadItems} />
        </aside>
      </main>

      {/* Totales fijos en pantallas chicas */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.06)] dark:shadow-none transition-colors">
        <div className="max-w-xl mx-auto">
          <TotalsPanel totals={totals} className="!p-0 !border-0 !bg-transparent" />
        </div>
      </footer>
    </div>
  );
}

export default App;