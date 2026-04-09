// @ts-ignore - esc-pos-encoder no tiene tipos TypeScript
import EscPosEncoder from "esc-pos-encoder";
import { Order } from "@/lib/types";
import { generateThermalReceiptHTML } from "./thermal-receipt";

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

  // Notas — separar nota del cliente del cambio
  if (order.notes) {
    const cambioMatch = order.notes.match(/\[CAMBIO:\s*([^\]]+)\]/);
    const cleanNotes = order.notes.replace(/\[CAMBIO:[^\]]*\]/g, "").trim();

    encoder.text("================================").newline();

    if (cleanNotes) {
      encoder.bold(true).text("NOTAS:").bold(false).newline();
      encoder.text(cleanNotes).newline();
    }

    if (cambioMatch) {
      encoder.newline();
      encoder.bold(true).text("CAMBIO A ENTREGAR:").bold(false).newline();
      encoder.bold(true).text(cambioMatch[1].trim()).bold(false).newline();
    }

    encoder.newline();
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
    // Fallback: generar HTML y abrir en ventana nueva
    const html = generateThermalReceiptHTML(order);
    const printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 100);
      };
    }
  }
}

