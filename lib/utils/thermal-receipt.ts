import { Order } from "@/lib/types";

/**
 * Genera HTML formateado para imprimir en impresora térmica de 58mm
 * Aproximadamente 32 caracteres por línea
 */
export function generateThermalReceiptHTML(order: Order): string {
  const lineLength = 32;
  const divider = "=".repeat(lineLength);

  // Helper para centrar texto
  const center = (text: string): string => {
    const padding = Math.max(0, Math.floor((lineLength - text.length) / 2));
    return " ".repeat(padding) + text;
  };

  // Helper para alinear a la derecha
  const rightAlign = (left: string, right: string): string => {
    const totalSpace = lineLength - left.length - right.length;
    return left + " ".repeat(Math.max(1, totalSpace)) + right;
  };

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
  <title>Recibo ${order.order_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      width: 58mm;
      padding: 2mm;
    }

    .receipt {
      width: 100%;
      text-align: left;
    }

    .header {
      text-align: center;
      margin-bottom: 2mm;
      font-weight: bold;
    }

    .order-number {
      font-size: 14px;
      font-weight: bold;
      text-align: center;
      margin: 2mm 0;
    }

    .divider {
      text-align: center;
      margin: 2mm 0;
      letter-spacing: 0.5px;
    }

    .section {
      margin: 2mm 0;
    }

    .section-title {
      font-weight: bold;
      font-size: 11px;
      margin-bottom: 1mm;
      text-decoration: underline;
    }

    .customer-info {
      font-size: 11px;
      margin-bottom: 1mm;
    }

    .item {
      font-size: 11px;
      margin: 1mm 0;
    }

    .item-name {
      font-weight: bold;
    }

    .item-qty-price {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
    }

    .item-options {
      font-size: 10px;
      color: #666;
      margin-left: 2mm;
      margin-top: 0.5mm;
    }

    .totals {
      font-size: 11px;
      margin: 2mm 0;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 1mm 0;
    }

    .total-final {
      font-weight: bold;
      font-size: 13px;
      background-color: #f0f0f0;
      padding: 2mm;
      text-align: center;
      border: 1px solid #ccc;
    }

    .payment-info {
      font-size: 10px;
      text-align: center;
      margin: 2mm 0;
    }

    .footer {
      text-align: center;
      font-size: 10px;
      margin-top: 3mm;
      color: #666;
    }

    @media print {
      body {
        width: 58mm;
        margin: 0;
        padding: 2mm;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">🍔 PARILLA BURGERS</div>

    <div class="divider">${divider}</div>

    <div class="order-number">PEDIDO #${order.order_number}</div>

    <div class="divider">${divider}</div>
`;

  // Información del cliente
  html += `
    <div class="section">
      <div class="customer-info">
        <strong>${order.customer_name}</strong><br>
        📱 ${order.customer_phone}
      </div>
  `;

  if (order.mesa_number) {
    html += `<div class="customer-info">🪑 Mesa ${order.mesa_number}</div>`;
  } else if (order.delivery_address) {
    const addressLines = wrapText(order.delivery_address);
    html += `<div class="customer-info">📍 ${addressLines.join("<br>")}</div>`;
  }

  html += `</div>`;

  // Productos
  html += `
    <div class="divider">${divider}</div>
    <div class="section">
      <div class="section-title">PRODUCTOS</div>
  `;

  const items = order.items || [];
  items.forEach((item) => {
    html += `
      <div class="item">
        <div class="item-name">${item.menu_item_name}</div>
        <div class="item-qty-price">
          <span>x${item.quantity}</span>
          <span>$${item.subtotal?.toLocaleString("es-CO") || "0"}</span>
        </div>
    `;

    if (item.barra_libre_selected && item.barra_libre_selected.length > 0) {
      html += `<div class="item-options">${item.barra_libre_selected.join(", ")}</div>`;
    }

    html += `</div>`;
  });

  html += `</div>`;

  // Totales
  html += `
    <div class="divider">${divider}</div>
    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>$${order.subtotal?.toLocaleString("es-CO") || "0"}</span>
      </div>
  `;

  if (order.delivery_fee > 0) {
    html += `
      <div class="total-row">
        <span>Domicilio:</span>
        <span>$${order.delivery_fee?.toLocaleString("es-CO") || "0"}</span>
      </div>
    `;
  }

  html += `
      <div class="total-final">
        TOTAL: $${order.total?.toLocaleString("es-CO") || "0"}
      </div>
    </div>
  `;

  // Método de pago
  let paymentMethod = "Desconocido";
  if (order.wompi_transaction_id === "PAGAR_EN_CAJA") {
    paymentMethod = "💵 Pagar en caja";
  } else if (order.wompi_transaction_id === null) {
    paymentMethod = "💰 Contra entrega";
  } else if (order.payment_status === "paid") {
    paymentMethod = "✓ Pagado en línea";
  }

  html += `
    <div class="payment-info">
      ${paymentMethod}
    </div>
  `;

  // Notas
  if (order.notes) {
    html += `
    <div class="divider">${divider}</div>
    <div class="section">
      <div class="section-title">NOTAS</div>
      <div style="font-size: 11px;">${wrapText(order.notes).join("<br>")}</div>
    </div>
    `;
  }

  // Footer
  const now = new Date();
  const timeStr = now.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Bogota"
  });

  html += `
    <div class="divider">${divider}</div>
    <div class="footer">
      <p>${timeStr}</p>
      <p style="margin-top: 1mm;">¡Gracias por su orden!</p>
    </div>
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

  // Esperar a que cargue el DOM antes de imprimir
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 100);
  };
}
