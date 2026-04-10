import { Order } from "@/lib/types";

/**
 * Genera HTML para ticket de cocina en impresora térmica de 58mm
 * SOLO productos, cantidades, opciones y notas
 * Sin precios ni información de caja
 */
export function generateThermalReceiptHTML(order: Order): string {
  const lineLength = 32;
  const divider = "=".repeat(lineLength);

  // Helper para partir línea si es muy larga
  const wrapText = (text: string, maxLen: number = lineLength): string[] => {
    if (text.length <= maxLen) return [text];
    const lines: string[] = [];
    let current = text;
    while (current.length > maxLen) {
      lines.push(current.substring(0, maxLen));
      current = current.substring(maxLen);
    }
    if (current) lines.push(current);
    return lines;
  };

  let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pedido ${order.order_number}</title>
  <style>
    @page {
      size: 58mm auto;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: 58mm;
      background: white;
      color: black;
    }

    body {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.3;
      padding: 2mm 3mm 4mm 3mm;
    }

    .order-number {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 3mm 0;
      border: 2px solid black;
      padding: 2mm;
      letter-spacing: 1px;
    }

    .tipo {
      font-size: 11px;
      text-align: center;
      margin: 1.5mm 0;
      font-weight: bold;
    }

    .divider {
      text-align: center;
      margin: 2mm 0;
      font-size: 10px;
    }

    .items-container {
      margin: 2mm 0;
    }

    .item {
      margin: 1.5mm 0;
      padding: 1.5mm 0;
      border-bottom: 1px dashed black;
    }

    .item:last-child {
      border-bottom: none;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1mm;
    }

    .item-name {
      font-weight: bold;
      font-size: 11px;
      flex: 1;
      line-height: 1.3;
    }

    .item-qty {
      font-size: 13px;
      font-weight: bold;
      margin-left: 2mm;
      padding: 0.5mm 2mm;
      border: 1px solid black;
      text-align: center;
      min-width: 12mm;
      flex-shrink: 0;
    }

    .item-price {
      font-size: 10px;
      text-align: right;
      margin-top: 1mm;
      color: #333;
    }

    .totals {
      margin: 2mm 0 0 0;
      font-size: 10px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5mm 0;
    }

    .totals-row.total {
      font-size: 13px;
      font-weight: bold;
      border-top: 2px solid black;
      margin-top: 1mm;
      padding-top: 1.5mm;
    }

    .item-options {
      font-size: 10px;
      margin: 1mm 0 0 2mm;
      line-height: 1.3;
    }

    .option {
      margin: 0.5mm 0;
    }

    .address {
      font-size: 10px;
      text-align: center;
      margin: 1mm 0 2mm 0;
      line-height: 1.4;
    }

    .notes {
      margin: 2mm 0 0 0;
      padding: 2mm;
      border: 1px solid black;
      font-size: 10px;
      font-weight: bold;
    }

    .notes-title {
      margin-bottom: 1mm;
      text-decoration: underline;
    }

    .notes-text {
      color: #cc0000;
    }

    .footer {
      text-align: center;
      font-size: 9px;
      margin-top: 3mm;
      color: #666;
    }

    @media print {
      html, body {
        width: 58mm;
        margin: 0;
        padding: 2mm 3mm 4mm 3mm;
        background: white;
      }
    }
  </style>
</head>
<body>
  <div class="order-number">PEDIDO #${order.order_number}</div>

  <div class="tipo">
    ${order.mesa_number
      ? `🪑 MESA ${order.mesa_number}`
      : order.delivery_address
        ? '🏠 DOMICILIO'
        : '🛍️ PARA RECOGER'}
  </div>

  <div class="tipo" style="font-size:10px; font-weight:normal; margin-top:0.5mm; border:1px solid black; display:inline-block; padding:0.5mm 2mm; border-radius:2mm;">
    ${order.wompi_transaction_id === 'CONTRA_ENTREGA' ? '💵 CONTRA ENTREGA' : order.wompi_transaction_id === 'PAGAR_EN_CAJA' ? '💵 PAGO EN TIENDA' : order.payment_status === 'paid' ? '💳 PAGADO EN LÍNEA' : '💵 PAGO EN TIENDA'}
  </div>

  ${!order.mesa_number ? `<div class="tipo" style="font-size: 11px; font-weight: normal; margin-top: 1mm;">${order.customer_name}</div>` : ''}

  ${!order.mesa_number && order.delivery_address ? `<div class="address">${wrapText(order.delivery_address).join("<br>")}</div>` : ''}

  <div class="divider">${divider}</div>

  <div class="items-container">
`;

  // Productos
  const items = order.items || [];
  items.forEach((item) => {
    html += `
    <div class="item">
      <div class="item-header">
        <div class="item-name">${item.menu_item_name}</div>
        <div class="item-qty">x${item.quantity}</div>
      </div>
    `;

    // Opciones
    if (item.barra_libre_selected && item.barra_libre_selected.length > 0) {
      html += `<div class="item-options">`;
      item.barra_libre_selected.forEach((opt: string) => {
        html += `<div class="option">• ${opt}</div>`;
      });
      html += `</div>`;
    }

    // Precio
    const lineTotal = item.unit_price * item.quantity;
    html += `<div class="item-price">${item.quantity} x $${item.unit_price.toLocaleString("es-CO")} = $${lineTotal.toLocaleString("es-CO")}</div>`;

    html += `</div>`;
  });

  html += `
  </div>

  <div class="divider">${divider}</div>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal</span>
      <span>$${order.subtotal.toLocaleString("es-CO")}</span>
    </div>
    ${order.delivery_fee > 0 ? `
    <div class="totals-row">
      <span>Domicilio</span>
      <span>$${order.delivery_fee.toLocaleString("es-CO")}</span>
    </div>` : ''}
    <div class="totals-row total">
      <span>TOTAL</span>
      <span>$${order.total.toLocaleString("es-CO")}</span>
    </div>
  </div>

  <div class="divider" style="margin-top:2mm;">${divider}</div>
`;

  // Notas — si hay [CAMBIO:...] es contra entrega
  const cambioMatch = (order.notes || "").match(/\[CAMBIO:\s*\$?([\d.]+)\]/);
  const cleanNotes = (order.notes || "").replace(/\[CAMBIO:[^\]]*\]/g, "").trim();

  if (cleanNotes || cambioMatch) {
    html += `<div class="notes">`;

    if (cleanNotes) {
      html += `
      <div class="notes-title">NOTAS DEL CLIENTE:</div>
      <div class="notes-text">${wrapText(cleanNotes).join("<br>")}</div>
      `;
    }

    if (cambioMatch) {
      const cambioNum = Number(cambioMatch[1].replace(/\./g, ""));
      const pagaCon = (order.total || 0) + cambioNum;
      html += `
      ${cleanNotes ? '<div style="margin-top:2mm;border-top:1px dashed black;padding-top:2mm;"></div>' : ''}
      <div class="notes-title">PAGA CON:</div>
      <div class="notes-text" style="font-size:14px;">$${pagaCon.toLocaleString("es-CO")}</div>
      <div class="notes-title" style="margin-top:1mm;">CAMBIO A ENTREGAR:</div>
      <div class="notes-text" style="font-size:14px;">$${cambioNum.toLocaleString("es-CO")}</div>
      `;
    }

    html += `</div>`;
  }

  html += `
  <div class="footer">
    <p>Pedido #${order.order_number}</p>
  </div>
</body>
</html>
`;

  return html;
}

/**
 * Abre el recibo en una nueva ventana y lo imprime
 */
export function printThermalReceipt(order: Order): void {
  const html = generateThermalReceiptHTML(order);
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("No se pudo abrir la ventana de impresión. Verifica la configuración de pop-ups del navegador.");
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Cerrar ventana automáticamente después de imprimir
  printWindow.onafterprint = () => {
    printWindow.close();
  };

  // Esperar a que cargue el DOM antes de imprimir
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}
