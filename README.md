# Perfil Profesional — Portafolio Web

Página web profesional de una sola página con **HTML, CSS y JavaScript puro** (sin frameworks). Incluye CV, certificados, artículos, proyecto de investigación, perfiles profesionales y música de fondo.

## 📁 Estructura de archivos

```
.
├── index.html              ← Página principal
├── styles.css              ← Estilos
├── script.js               ← Lógica (modales, música, PDF viewer)
├── README.md               ← Este archivo
└── assets/
    ├── cv/cv.pdf                          ← Tu CV (reemplazar)
    ├── certificates/
    │   ├── certificado-1.pdf              ← Certificados (reemplazar)
    │   ├── certificado-2.pdf
    │   └── certificado-3.pdf
    ├── articles/
    │   ├── articulo-1.pdf                 ← Artículos (reemplazar)
    │   ├── articulo-2.pdf
    │   └── articulo-3.pdf
    └── research/proyecto.pdf              ← Proyecto de investigación (reemplazar)
└── audio/                                  ← (Opcional) tu MP3 si usas archivo local
```

## ▶️ Cómo abrir la página

La forma más sencilla:

1. **Doble clic en `index.html`** — se abre en tu navegador.
2. Si la música no suena automáticamente (los navegadores bloquean el autoplay hasta que el usuario interactúe), haz **un solo clic en cualquier parte** de la página y arrancará.
3. Para que los botones "Descargar" funcionen, lo ideal es servir los archivos con un servidor local. Si tienes Python:

```bash
# Desde esta carpeta
python3 -m http.server 8000
# luego abre http://localhost:8000 en el navegador
```

O si tienes Node:

```bash
npx serve .
```

## 🎨 Personalizar el contenido

### Cambiar datos personales
Edita `index.html` y reemplaza:
- `Tu Nombre Aquí` → tu nombre
- `[Tu área disciplinar]`, `[Cargo / Título profesional]`, `[Tu grado académico]`, `Ciudad, País`, `tu.correo@ejemplo.com`
- Las iniciales del avatar (`YN` por defecto)

### Cambiar/CV, certificados, artículos, investigación
**Solo reemplaza los archivos PDF** en las carpetas correspondientes. Conserva el mismo nombre y ruta, y la página los mostrará automáticamente.

Para **agregar más certificados o artículos**:
1. Copia tu PDF dentro de `assets/certificates/` o `assets/articles/`
2. En `index.html`, duplica el bloque `<li>` correspondiente y actualiza:
   - `data-pdf="..."` con la ruta de tu nuevo PDF
   - El título y la descripción dentro del bloque

### Cambiar perfiles profesionales
En `index.html`, busca el modal `#modal-perfiles` y reemplaza los `href="#"` por tus URLs reales (LinkedIn, ORCID, Google Scholar, etc.).

## 🎵 Música de fondo

Por defecto la página carga un track **instrumental libre de derechos de SoundHelix** desde una URL pública.

### Ajustar el volumen
En `script.js` busca:
```js
audio.volume = (slider?.value ?? 15) / 100;
```
Y en `index.html` el slider tiene `value="15"` (15%). Cambia ese número entre `0` y `100` para ajustar el volumen por defecto.

**Recomendación**: 10–20% es un buen rango — se oye de fondo sin ser molesto.

### Usar tu propia canción
Tienes 2 opciones:

**Opción A — Archivo local (recomendado):**
1. Descarga un MP3/OGG de música libre de derechos (ej. [Pixabay Music](https://pixabay.com/music/), [Free Music Archive](https://freemusicarchive.org/)).
2. Ponlo en la carpeta `audio/` (ej. `audio/mi-cancion.mp3`).
3. En `index.html` cambia la línea del `<source>`:
   ```html
   <source src="audio/mi-cancion.mp3" type="audio/mpeg" />
   ```

**Opción B — Otra URL pública:**
Reemplaza la URL en el `<source>` por tu enlace. Asegúrate de que la pista sea libre de derechos y que el servidor permita el acceso (CORS no es problema para `<audio>` simple).

> 💡 **Tip sobre el autoplay**: Chrome, Safari y Firefox bloquean el sonido automático al cargar la página. Por eso la página reproduce música en el **primer clic, toque o tecla** que hagas. El botón flotante (esquina inferior derecha) te permite pausar y ajustar el volumen en cualquier momento.

## ⌨️ Atajos de teclado

- `Esc` — cierra la ventana modal activa
- `Click` en cualquier parte → activa la música (si el navegador la había bloqueado)

## 🛠️ Detalles técnicos

- **Sin dependencias** — todo es HTML/CSS/JS puro
- **Responsive** — se adapta a móvil, tablet y escritorio
- **Modales anidados** — desde Artículos puedes abrir el PDF de un artículo sobre la misma ventana de Artículos (cierra con Esc)
- **Fuentes**: Inter y Playfair Display desde Google Fonts (requieren conexión a internet la primera vez)
