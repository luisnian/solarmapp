# solarm.app — macOS (Tauri)

App nativa de macOS generada con Tauri a partir del proyecto web `solarm.app`.

---

## Requisitos previos

Ejecuta esto una sola vez en tu Mac:

### 1. Xcode Command Line Tools
```bash
xcode-select --install
```

### 2. Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Cuando pregunte, elige opción 1 (instalación por defecto)
source "$HOME/.cargo/env"
```

### 3. Node.js (si no lo tienes)
```bash
# Con Homebrew:
brew install node

# O descarga el instalador desde https://nodejs.org
```

### 4. ImageMagick (para generar iconos)
```bash
brew install imagemagick
```

---

## Instalación del proyecto

```bash
# Entra en la carpeta del proyecto
cd solarm-tauri

# Instala dependencias JS
npm install

# Genera los iconos macOS (.icns, .ico, .png)
chmod +x generate-icons.sh
./generate-icons.sh
```

---

## Modo desarrollo (previsualización)

```bash
npm run dev
```

Abre la app en una ventana nativa con recarga automática al editar `src/index.html`.

---

## Compilar la app final

```bash
npm run build
```

Cuando termine (5-10 min la primera vez, luego ~1 min) encontrarás:

```
src-tauri/target/release/bundle/macos/solarm.app.app   ← la app
src-tauri/target/release/bundle/dmg/solarm.app_1.0.0_aarch64.dmg  ← instalador
```

Arrastra `solarm.app.app` a tu carpeta `/Applications` o comparte el `.dmg`.

---

## Estructura del proyecto

```
solarm-tauri/
├── src/                    ← Tu web app (index.html, sw.js, peakfinder.html...)
│   ├── index.html          ← Archivo principal (no tocar la ruta)
│   ├── peakfinder.html
│   ├── sw.js
│   ├── manifest.json
│   └── icons/
├── src-tauri/              ← Backend Rust (no necesitas tocarlo)
│   ├── tauri.conf.json     ← Configuración de la app (nombre, tamaño ventana...)
│   ├── Cargo.toml
│   ├── build.rs
│   ├── icons/              ← Iconos generados por generate-icons.sh
│   └── src/
│       └── main.rs
├── generate-icons.sh       ← Script de generación de iconos
├── package.json
└── README.md
```

---

## Personalizar la ventana

Edita `src-tauri/tauri.conf.json`, sección `"windows"`:

```json
"windows": [{
  "title": "solarm.app — Simulador Solar",
  "width": 1280,
  "height": 800,
  "minWidth": 800,
  "minHeight": 600,
  "center": true
}]
```

---

## Actualizar la app

Solo tienes que editar los archivos en `src/` (HTML, JS, CSS) y volver a ejecutar `npm run build`. No hay que tocar Rust.

---

## Notas

- La app usa **WKWebView** (el mismo motor que Safari) — misma compatibilidad
- El service worker (`sw.js`) funciona en Tauri con el protocolo `tauri://`
- PeakFinder se abre en el navegador del sistema (`shell.open`)
- Mínimo macOS 10.15 Catalina (configurado en `tauri.conf.json`)
