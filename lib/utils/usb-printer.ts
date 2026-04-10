import { Order } from "@/lib/types";
import { generateThermalReceiptHTML } from "./thermal-receipt";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let selectedDevice: any = null;

/**
 * Intenta obtener una impresora ya autorizada, o pide seleccionar una nueva
 */
async function getOrSelectDevice(): Promise<any | null> {
  const nav = navigator as any;
  if (!nav.usb) return null;

  // Si ya tenemos una referencia en memoria, usarla
  if (selectedDevice) return selectedDevice;

  // Buscar entre impresoras ya autorizadas previamente
  try {
    const paired = await nav.usb.getDevices();
    const printer = paired.find((d: any) =>
      d.deviceClass === 0x07 ||
      d.configurations?.some((c: any) =>
        c.interfaces?.some((i: any) =>
          i.alternates?.some((a: any) => a.interfaceClass === 0x07)
        )
      )
    );
    if (printer) {
      selectedDevice = printer;
      return printer;
    }
  } catch { /* continuar */ }

  return null;
}

/**
 * Muestra el selector de impresoras USB (solo la primera vez)
 */
export async function selectUSBPrinter(): Promise<boolean> {
  try {
    const nav = navigator as any;
    if (!nav.usb) {
      console.error("WebUSB no disponible — usa Chrome/Edge");
      return false;
    }

    const device = await nav.usb.requestDevice({
      filters: [{ classCode: 0x07 }], // clase impresora
    });

    selectedDevice = device;
    return true;
  } catch (error) {
    console.error("Error seleccionando impresora USB:", error);
    return false;
  }
}

/**
 * Genera los comandos ESC/POS para el recibo
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadEncoder(): Promise<any> {
  const mod = await import("esc-pos-encoder");
  return mod.default ?? mod;
}

async function generateESCPOS(order: Order): Promise<Uint8Array> {
  const EscPosEncoder = await loadEncoder();
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

  // Tipo de pedido
  encoder.align("center");
  if (order.mesa_number) {
    encoder.text(`MESA ${order.mesa_number}`);
  } else if (order.delivery_address) {
    encoder.text("DOMICILIO");
  } else {
    encoder.text("PARA RECOGER");
  }
  encoder.newline();

  // Forma de pago
  const tipoPago = order.wompi_transaction_id === "CONTRA_ENTREGA"
    ? "CONTRA ENTREGA"
    : order.wompi_transaction_id === "PAGAR_EN_CAJA"
      ? "PAGO EN TIENDA"
      : order.payment_status === "paid"
        ? "PAGADO EN LINEA"
        : "PAGO EN TIENDA";
  encoder.text(`[${tipoPago}]`).newline();

  if (!order.mesa_number && order.customer_name) {
    encoder.text(order.customer_name).newline();
  }
  encoder.newline();

  // Divisor
  encoder.align("left").text("================================").newline();

  const fmt = (n: number) => `$${Number(n || 0).toLocaleString("es-CO")}`;

  // Productos
  const items = order.items || [];
  items.forEach((item) => {
    encoder.bold(true).text(item.menu_item_name).bold(false).newline();
    const lineTotal = (item.unit_price || 0) * (item.quantity || 1);
    encoder.text(`${item.quantity} x ${fmt(item.unit_price)} = ${fmt(lineTotal)}`).newline();

    if (item.barra_libre_selected && item.barra_libre_selected.length > 0) {
      item.barra_libre_selected.forEach((opt: string) => {
        encoder.text(`  * ${opt}`).newline();
      });
    }
    encoder.newline();
  });

  // Totales
  encoder.text("================================").newline();
  encoder.align("left");
  encoder.text(`Subtotal:  ${fmt(order.subtotal)}`).newline();
  if ((order.delivery_fee || 0) > 0) {
    encoder.text(`Domicilio: ${fmt(order.delivery_fee)}`).newline();
  }
  encoder.bold(true).text(`TOTAL:     ${fmt(order.total)}`).bold(false).newline();
  encoder.text("================================").newline();

  // Notas y pago contra entrega
  // Si hay [CAMBIO:...] en las notas, es contra entrega
  const cambioMatch = (order.notes || "").match(/\[CAMBIO:\s*\$?([\d.]+)\]/);
  const cleanNotes = (order.notes || "").replace(/\[CAMBIO:[^\]]*\]/g, "").trim();

  if (cleanNotes) {
    encoder.bold(true).text("NOTAS:").bold(false).newline();
    encoder.text(cleanNotes).newline();
    encoder.newline();
  }

  if (cambioMatch) {
    const cambioNum = Number(cambioMatch[1].replace(/\./g, ""));
    const pagaCon = (order.total || 0) + cambioNum;
    encoder.bold(true).text(`PAGA CON:  ${fmt(pagaCon)}`).bold(false).newline();
    encoder.bold(true).text(`CAMBIO:    ${fmt(cambioNum)}`).bold(false).newline();
    encoder.newline();
  }

  // Footer
  encoder
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
 * Imprime directamente a la impresora USB via WebUSB + ESC/POS
 */
export async function printUSB(order: Order): Promise<boolean> {
  let device: any = null;
  try {
    const nav = navigator as any;
    if (!nav.usb) return false;

    // Obtener impresora ya pareada o pedir seleccionar
    device = await getOrSelectDevice();
    if (!device) {
      const ok = await selectUSBPrinter();
      if (!ok) return false;
      device = selectedDevice;
    }
    if (!device) return false;

    // Abrir dispositivo
    await device.open();

    // Seleccionar configuración si no está seleccionada
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    // Reclamar interfaz 0 (interfaz de impresora)
    await device.claimInterface(0);

    // Detectar automáticamente el endpoint bulk OUT
    let endpointNumber = 1; // fallback
    try {
      const iface = device.configuration?.interfaces[0];
      if (iface) {
        const alt = iface.alternates[0];
        const ep = alt.endpoints.find(
          (e: any) => e.direction === "out" && e.type === "bulk"
        );
        if (ep) endpointNumber = ep.endpointNumber;
      }
    } catch { /* usar endpoint 1 por defecto */ }

    // Generar y enviar comandos ESC/POS
    const data = await generateESCPOS(order);
    await device.transferOut(endpointNumber, data);

    // Liberar interfaz y cerrar
    await device.releaseInterface(0);
    await device.close();

    return true;
  } catch (error) {
    console.error("Error imprimiendo a USB:", error);
    // Intentar cerrar si quedó abierto
    try { await device?.close(); } catch { /* ignorar */ }
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

