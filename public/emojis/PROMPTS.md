# Prompts para generar los emojis de ParillaBurgers

Genera cada emoji por separado con este prompt base en **Midjourney** o **DALL-E 3**.

---

## Prompt base (pegar antes de cada descripción)

```
illustrated food emoji sticker, dark black background, orange and gold flame effects, gray smoke wisps, glossy 3D cartoon style, high detail, isolated on black, orange-gold color palette, no text, square format --ar 1:1 --v 6 --style raw
```

---

## Emojis a generar → nombre del archivo

| Descripción del sujeto | Guardar como |
|------------------------|--------------|
| juicy double cheeseburger with sesame bun, melted cheese, flames and smoke surrounding it | `burger.png` |
| golden french fries in a dark black cup/box with flame logo, smoke rising | `fries.png` |
| hot dog with mustard zigzag, flames shooting from both sides | `hotdog.png` |
| soda drink cup with straw, ice cubes, flames on the cup | `soda.png` |
| round charcoal grill with thick meat patties on it, big orange flames underneath | `grill.png` |
| thick dripping melted yellow-orange cheese, oozing and glossy | `cheese.png` |
| black delivery scooter going fast, motion blur lines, flame logo on delivery box | `scooter.png` |
| round cartoon face emoji with big eyes with fire pupils, tongue out drooling, craving expression | `face.png` |
| cheeseburger with a bold orange % symbol next to it, flames | `coupon.png` |
| cheeseburger engulfed in orange flames, dramatic fire effect | `flame.png` |
| cheeseburger next to a silver stopwatch/timer, flames | `timer.png` |

---

## Instrucciones

1. Genera cada emoji por separado
2. Guarda los archivos PNG en esta carpeta (`/public/emojis/`)
3. El tamaño mínimo recomendado es **256x256px**
4. Fondo negro o transparente (PNG con transparencia = mejor)
5. Una vez guardados, la app los usa automáticamente

---

## Dónde aparece cada emoji en la app

| Archivo | Dónde se usa |
|---------|-------------|
| `flame.png` | Título "Lo más pedido" en el menú |
| `burger.png` | Título "¿Qué quieres comer?", strip de puntos |
| `face.png` | Carrito vacío (pantalla de antojo) |
| `coupon.png` | Label "Cupón de descuento" en checkout |
| `scooter.png` | Botón "Contra entrega" en checkout |
| `timer.png` | (disponible para tiempo de entrega) |
| `fries.png`, `hotdog.png`, `soda.png`, `grill.png`, `cheese.png` | Disponibles para categorías del menú |
