import React from 'react';
import { CopyValue } from './CopyValue';

export const TotalsPanel = ({ totals, className = '' }) => (
  <section className={`bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200/70 dark:border-gray-700 space-y-2 ${className}`}>
    <CopyValue label="Total a cobrar" value={totals.total.toFixed(2)} variant="primary" large />
    <div className="grid grid-cols-2 gap-2">
      <CopyValue label="Subtotal" value={totals.subtotal.toFixed(2)} />
      <CopyValue label="IGV 18%" value={totals.igv.toFixed(2)} />
    </div>
  </section>
);
