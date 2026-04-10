// @ts-ignore - esc-pos-encoder no tiene tipos TypeScript
import EscPosEncoder from "esc-pos-encoder";
import { Order } from "@/lib/types";

// Configuración de impresora
const PRINTER_VENDOR_ID = 0x0483; // STMicroelectronics (común en impresoras térmicas)
// Algunos vendedores comunes:
// 0x0483 - STMicroelectronics
// 0x0456 - Cherry GmbH
// 0x0416 - Winbond
// Si tu impresora no funciona, busca su vendor/product ID

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let selectedDevice: any = null;

/**
 * Busca y conecta a una impresora térmica USB
 */
export async function selectUSBPrinter(): Promise<boolean> {
  try {
    const nav = navigator as any;
    if (!nav.usb) {
      console.error("WebUSB no está disponible en este navegador");
      return false;
    }

    const devices = await nav.usb.requestDevice({
      filters: [
        { classCode: 0x07 }, // Clase de impresora
      ],
    });

    selectedDevice = devices;
    return true;
  } catch (error) {
    console.error("Error seleccionando impresora USB:", error);
    return false;
  }
}

/**
 * Genera los comandos ESC/POS para el recibo
 */
function generateESCPOS(order: Order): Uint8Array {
  const encoder = new EscPosEncoder();

  // Encabezado
  encoder
    .newline()
    .bold(true)
    .align("center")
    .text("PEDIDO")
    .newline()
    .fontSize(2, 2)
    .text(`#${order.order_number}`)
    .newline()
    .fontSize(1, 1)
    .bold(false)
    .newline();

  // Tipo
  encoder.align("center");
  if (order.mesa_number) {
    encoder.text(`MESA ${order.mesa_number}`);
  } else {
    encoder.text("DOMICILIO");
  }
  if (!order.mesa_number && order.customer_name) {
    encoder.newline().text(order.customer_name);
  }
  encoder.newline().newline();

  // Divisor
  encoder.align("left").text("================================").newline();

  // Productos
  const items = order.items || [];
  items.forEach((item) => {
    encoder
      .bold(true)
      .text(item.menu_item_name)
      .bold(false)
      .newline();

    // Cantidad
    encoder.text(`Cantidad: ${item.quantity}`).newline();

    // Opciones
    if (item.barra_libre_selected && item.barra_libre_selected.length > 0) {
      item.barra_libre_selected.forEach((opt: string) => {
        encoder.text(`  • ${opt}`).newline();
      });
    }

    encoder.newline();
  });

  // Notas
  if (order.notes) {
    encoder.text("================================").newline();
    encoder.bold(true).text("NOTAS:").bold(false).newline();
    encoder.text(order.notes).newline().newline();
  }

  // Footer
  encoder
    .text("================================")
    .newline()
    .align("center")
    .text(`Pedido #${order.order_number}`)
    .newline()
    .newline()
    .newline()
    .newline();

  // Cortar papel
  encoder.cut();

  return encoder.encode();
}

/**
 * Imprime directamente a la impresora USB
 */
export async function printUSB(order: Order): Promise<boolean> {
  try {
    const nav = navigator as any;
    if (!nav.usb) {
      throw new Error("WebUSB no disponible");
    }

    // Si no hay impresora seleccionada, solicitar
    if (!selectedDevice) {
      const success = await selectUSBPrinter();
      if (!success) {
        console.error("No se seleccionó impresora");
        return false;
      }
    }

    if (!selectedDevice) {
      throw new Error("No se seleccionó impresora");
    }

    // Conectar
    await selectedDevice.open();

    // Generar comandos ESC/POS
    const data = generateESCPOS(order);

    // Enviar datos
    await selectedDevice.controlTransferOut({
      requestType: "class",
      recipient: "interface",
      request: 0x09,
      value: 0x0200,
      index: 0,
    });

    // Enviar contenido
    await selectedDevice.bulkTransferOut(1, data);

    // Cerrar conexión
    await selectedDevice.close();

    return true;
  } catch (error) {
    console.error("Error imprimiendo a USB:", error);
    return false;
  }
}

/**
 * Imprime con fallback a window.print() si USB falla
 */
export async function printWithFallback(order: Order): Promise<void> {
  const success = await printUSB(order);

  if (!success) {
    console.log("Usando fallback a window.print()");
    const html = generateThermalReceiptHTML(order);
    const printWindow = window.open("", "_blank", "width=300,height=600");

    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      // Cerrar ventana automáticamente después de imprimir
      printWindow.onafterprint = () => {
        printWindow.close();
      };
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
  }
}

/**
 * Genera HTML para fallback (en caso de que USB no funcione)
 */
function generateThermalReceiptHTML(order: Order): string {
  const wrapText = (text: string, maxLen: number = 32): string[] => {
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
    * { margin: 0; padding: 0; box-sizing: border-box; }
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
    .items-container { margin: 2mm 0; }
    .item {
      margin: 1.5mm 0;
      padding: 1.5mm 0;
      border-bottom: 1px dashed black;
    }
    .item:last-child { border-bottom: none; }
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
    .item-options {
      font-size: 10px;
      margin: 1mm 0 0 2mm;
      line-height: 1.3;
    }
    .option { margin: 0.5mm 0; }
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
    .notes-text { color: #cc0000; }
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
    ${order.mesa_number ? `MESA ${order.mesa_number}` : 'DOMICILIO'}
  </div>
  ${order.mesa_number ? '' : `<div class="tipo" style="font-size: 11px; font-weight: normal; margin-top: 1mm;">${order.customer_name}</div>`}
  <div class="divider">================================</div>
  <div class="items-container">
`;

  const items = order.items || [];
  items.forEach((item) => {
    html += `
    <div class="item">
      <div class="item-header">
        <div class="item-name">${item.menu_item_name}</div>
        <div class="item-qty">x${item.quantity}</div>
      </div>
    `;

    if (item.barra_libre_selected && item.barra_libre_selected.length > 0) {
      html += `<div class="item-options">`;
      item.barra_libre_selected.forEach((opt: string) => {
        html += `<div class="option">• ${opt}</div>`;
      });
      html += `</div>`;
    }

    html += `</div>`;
  });

  html += `
  </div>
  <div class="divider">================================</div>
`;

  if (order.notes) {
    html += `
  <div class="notes">
    <div class="notes-title">NOTAS:</div>
    <div class="notes-text">${wrapText(order.notes).join("<br>")}</div>
  </div>
`;
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
