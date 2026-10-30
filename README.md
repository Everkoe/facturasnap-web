# FacturaSnap

Calculadora para facturar con IGV (18 %) en Perú. Escribes lo que cobraste y te da el precio unitario sin IGV listo para copiar en SUNAT, con los céntimos cuadrados. También lee fotos de notas de venta para no tipear las filas a mano.

**Pruébala:** [facturasnap-web.vercel.app](https://facturasnap-web.vercel.app)

## Qué hace

- **Precio unitario exacto.** SUNAT calcula el IGV sobre el valor de venta y redondea a dos decimales, así que dividir entre 1.18 a veces descuadra un céntimo. FacturaSnap busca la base que reproduce tu total exacto y usa los decimales que hagan falta en el precio unitario (de 2 a 10). Si ningún valor puede dar ese total, te avisa.
- **Varias filas.** Cada fila acepta el monto total o el precio unitario (con IGV). Abajo siempre ves subtotal, IGV y total a cobrar, sumados en céntimos para que no se descuadren.
- **Copiar con un clic.** Cada valor que necesitas en SUNAT tiene su botón de copiar.
- **Leer una nota de venta.** Subes o pegas (Ctrl+V) la foto de una nota escrita a mano o impresa. Gemini lee las filas, el RUC o DNI del cliente y su celular, y puedes cargar esas filas en la calculadora.
- **Revisa lo que lee.** El RUC se valida con su dígito verificador, el DNI por su longitud y el celular por su formato. Si algo no cuadra, te pide revisarlo en la foto.
- **Mensaje para el cliente.** Arma un saludo según la hora de Lima para enviar junto con la factura.
- **No pierdes nada.** Las filas y el tema claro u oscuro se guardan en el navegador.

## Cómo está hecha

- React 19, Vite y Tailwind CSS 4.
- `api/scan.js`: función serverless de Vercel que envía la imagen a Gemini y devuelve un JSON con esquema fijo. La clave vive solo en el servidor (`GEMINI_API_KEY`), la función solo acepta peticiones del mismo origen y limpia lo que responde el modelo antes de devolverlo. Si un modelo está saturado o sin cuota, prueba con el siguiente.
- `src/utils/calculations.js`: el cálculo de base, IGV y precio unitario en céntimos.
- `src/utils/documents.js`: validación de RUC, DNI y celular.

## Correrla en local

```bash
git clone https://github.com/Everkoe/facturasnap-web.git
cd facturasnap-web
npm install
npm run dev
```

La calculadora funciona sin configurar nada. Leer notas de venta necesita la función de Vercel con `GEMINI_API_KEY` (y, si quieres, `GEMINI_MODEL` para elegir el modelo), así que en local se prueba con `vercel dev` o en la página publicada.
