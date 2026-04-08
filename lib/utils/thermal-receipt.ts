import { Order } from "@/lib/types";

/**
 * Genera HTML formateado para imprimir en impresora térmica de 58mm
 * Aproximadamente 32 caracteres por línea
 * Optimizado para cocina: énfasis en productos y detalles
 */
export function generateThermalReceiptHTML(order: Order): string {
  const lineLength = 32;
  const divider = "=".repeat(lineLength);
  const subDivider = "-".repeat(lineLength);

  // Helper para centrar texto
  const center = (text: string): string => {
    const padding = Math.max(0, Math.floor((lineLength - text.length) / 2));
    return " ".repeat(padding) + text;
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
      font-size: 14px;
      line-height: 1.3;
      width: 58mm;
      padding: 2mm;
      background: white;
      color: black;
    }

    .receipt {
      width: 100%;
      text-align: left;
    }

    .header {
      text-align: center;
      margin-bottom: 3mm;
      font-weight: bold;
      font-size: 16px;
    }

    .order-number {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 3mm 0;
      border: 2px solid black;
      padding: 2mm;
      letter-spacing: 2px;
    }

    .divider {
      text-align: center;
      margin: 2mm 0;
      letter-spacing: 0.5px;
      font-weight: bold;
    }

    .customer-info {
      font-size: 12px;
      margin: 2mm 0;
      padding: 2mm;
      border: 1px solid black;
    }

    .customer-line {
      margin: 1mm 0;
    }

    .section-title {
      font-weight: bold;
      font-size: 13px;
      margin: 3mm 0 2mm 0;
      text-decoration: underline;
      text-align: center;
    }

    .items-container {
      margin: 2mm 0;
    }

    .item-block {
      margin: 3mm 0;
      padding: 2mm;
      border: 1px solid black;
      page-break-inside: avoid;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1mm;
    }

    .item-name {
      font-weight: bold;
      font-size: 13px;
      flex: 1;
    }

    .item-qty {
      font-size: 18px;
      font-weight: bold;
      margin-left: 5mm;
      padding: 1mm 3mm;
      border: 1px solid black;
      min-width: 20mm;
      text-align: center;
    }

    .item-options {
      font-size: 11px;
      margin: 1mm 0 0 0;
      padding: 1mm 0;
      background-color: #f5f5f5;
      padding-left: 2mm;
    }

    .option-line {
      margin: 0.5mm 0;
    }

    .notes-section {
      margin: 2mm 0;
      padding: 2mm;
      background-color: #fff9e6;
      border: 1px dashed black;
    }

    .notes-title {
      font-weight: bold;
      font-size: 11px;
      margin-bottom: 1mm;
    }

    .notes-text {
      font-size: 11px;
      font-weight: bold;
      color: #cc0000;
    }

    .footer {
      text-align: center;
      font-size: 10px;
      margin-top: 3mm;
      padding-top: 2mm;
      border-top: 1px solid black;
    }

    .total-info {
      text-align: center;
      font-size: 11px;
      margin: 2mm 0;
    }

    @media print {
      body {
        width: 58mm;
        margin: 0;
        padding: 2mm;
        background: white;
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

    <div class="order-number">PEDIDO #${order.order_number}</div>

    <div class="divider">${divider}</div>

    <div class="customer-info">
      <div class="customer-line"><strong>${order.customer_name}</strong></div>
      <div class="customer-line">📱 ${order.customer_phone}</div>
  `;

  if (order.mesa_number) {
    html += `<div class="customer-line">🪑 <strong>MESA ${order.mesa_number}</strong></div>`;
  } else if (order.delivery_address) {
    const addressLines = wrapText(order.delivery_address);
    html += `<div class="customer-line">📍 ${addressLines.join("<br>")}</div>`;
  }

  html += `</div>`;

  html += `<div class="divider">${divider}</div>`;
  html += `<div class="section-title">▶ PREPARA ESTO ◀</div>`;

  // Productos - Sección principal y prominente
  const items = order.items || [];

  if (items.length > 0) {
    html += `<div class="items-container">`;

    items.forEach((item) => {
      html += `
      <div class="item-block">
        <div class="item-header">
          <div class="item-name">${item.menu_item_name}</div>
          <div class="item-qty">x${item.quantity}</div>
        </div>
      `;

      // Opciones de barra libre
      if (item.barra_libre_selected && item.barra_libre_selected.length > 0) {
        html += `<div class="item-options">`;
        item.barra_libre_selected.forEach((opt: string) => {
          html += `<div class="option-line">✓ ${opt}</div>`;
        });
        html += `</div>`;
      }

      html += `</div>`;
    });

    html += `</div>`;
  }

  // Notas especiales
  if (order.notes) {
    html += `
    <div class="divider">${divider}</div>
    <div class="notes-section">
      <div class="notes-title">⚠️ NOTAS ESPECIALES:</div>
      <div class="notes-text">${wrapText(order.notes).join("<br>")}</div>
    </div>
    `;
  }

  // Info de totales (más pequeño, menos importante)
  html += `
    <div class="divider">${divider}</div>
    <div class="total-info">
      <div style="margin: 1mm 0;"><strong>Subtotal:</strong> $${order.subtotal?.toLocaleString("es-CO") || "0"}</strong></div>
  `;

  if (order.delivery_fee > 0) {
    html += `<div style="margin: 1mm 0;"><strong>Domicilio:</strong> $${order.delivery_fee?.toLocaleString("es-CO") || "0"}</strong></div>`;
  }

  html += `
      <div style="margin: 2mm 0; font-size: 12px; font-weight: bold; border-top: 1px solid black; padding-top: 1mm;">
        <strong>TOTAL: $${order.total?.toLocaleString("es-CO") || "0"}</strong>
      </div>
    </div>
  `;

  // Método de pago
  let paymentMethod = "Desconocido";
  let paymentEmoji = "❓";
  if (order.wompi_transaction_id === "PAGAR_EN_CAJA") {
    paymentMethod = "Pagar en caja";
    paymentEmoji = "💵";
  } else if (order.wompi_transaction_id === null) {
    paymentMethod = "Contra entrega";
    paymentEmoji = "💰";
  } else if (order.payment_status === "paid") {
    paymentMethod = "Pagado en línea";
    paymentEmoji = "✓";
  }

  html += `
    <div class="divider">${divider}</div>
    <div class="total-info" style="font-size: 10px; color: #666;">
      ${paymentEmoji} ${paymentMethod}
    </div>
  `;

  // Footer
  const now = new Date();
  const timeStr = now.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Bogota"
  });

  html += `
    <div class="footer">
      <p>${timeStr}</p>
      <p style="margin-top: 1mm; font-weight: bold;">¡Buen provecho! 🍔</p>
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
