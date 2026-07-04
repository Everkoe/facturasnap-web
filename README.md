# FacturaSnap Web

Este es FacturaSnap Web, una herramienta que cree para hacer los cálculos de impuestos (IGV 18% en Perú) mucho más rápidos y fáciles. La idea es que puedas usarla en el día a día, especialmente si estás en un punto de venta y necesitas agilizar la facturación.

## ¿Qué hace?

*   **Calculadora por líneas**: Puedes añadir varios productos o servicios, poner la cantidad y el monto total (con IGV).
*   **Cálculos al instante**: Mientras escribes, la app te muestra el subtotal, el IGV y el precio unitario de cada línea.
*   **Copiar rápido**: Lo más útil es que puedes copiar el precio unitario (sin IGV) de cada producto con un solo clic. ¡Perfecto para cuando tienes que meter esos datos en el sistema de SUNAT!
*   **Siempre sabes cuánto es**: Abajo, en el footer, siempre verás el resumen total: subtotal, IGV y el gran total a cobrar.
*   **Guarda tu trabajo**: Si cierras la página, no pasa nada. La app recuerda lo que estabas haciendo.
*   **Modo claro/oscuro**: Para que la uses cómoda, de día o de noche.
*   **Funciona en cualquier lado**: Se adapta bien a tu celular o a tu computadora.

## ¿Cómo la uso?

1.  Dale a "+ Nueva Fila" para empezar.
2.  Pon la `Cantidad` y el `Monto Total (Inc. IGV)` de tu producto.
3.  La app hace la magia y te muestra los detalles.
4.  Usa el botón "COPIAR PRECIO UNITARIO (SIN IGV)" para llevarte el dato que necesitas.
5.  Y listo, el total general siempre estará a la vista.

## Para los que quieren probarla 

Está hecha con React y Tailwind CSS, usando Vite.

### Para ponerla a andar:

1.  Clona el proyecto:
    ```bash
    git clone https://github.com/Everkoe/facturasnap-web.git
    cd facturasnap-web
    ```
2.  Instala lo que necesita:
    ```bash
    npm install
    # o yarn install
    # o pnpm install
    ```
3.  Y a correr:
    ```bash
    npm run dev
    ```
