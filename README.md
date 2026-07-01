# MiraVault

MiraVault es una app de escritorio para organizar, explorar y reproducir tu biblioteca multimedia local.
Nace como un gestor de torrents, pero evoluciona hacia un centro personal para series, peliculas, IPTV, descargas y progreso de visionado.

> Estado: proyecto en desarrollo activo.

## Funciones principales

- Biblioteca visual de series y peliculas locales con tarjetas, caratulas, calidad, idioma y progreso.
- Organizador de carpetas para detectar episodios, temporadas y archivos residuales.
- Reproductor externo con VLC para codecs, subtitulos y audio multicanal.
- Guardado automatico del progreso de visionado y marcado de episodios vistos.
- IPTV con listas M3U/M3U8, canales, grupos y reproductor integrado con fallback a VLC.
- Gestion de torrents mediante qBittorrent externo o portable cuando este disponible.
- Temas visuales claros y oscuros desde Configuracion.
- App Electron frameless con React, Tailwind CSS y almacenamiento local.

## Captura de concepto

MiraVault esta pensada como una biblioteca personal: abres la app, ves tus series y peliculas, sigues viendo desde donde lo dejaste, ordenas carpetas cuando metas nuevos archivos y puedes anadir IPTV o descargas sin convertir la app en un panel tecnico.

## Requisitos

- Windows 10/11.
- Node.js 20 o superior recomendado.
- npm.
- VLC recomendado para reproduccion robusta de MKV, subtitulos, audio multicanal e IPTV no compatible con Chromium.
- qBittorrent opcional si quieres usar la seccion de Torrents.

## Instalacion para desarrollo

```powershell
git clone <URL_DEL_REPOSITORIO>
cd MiraVault
npm install
```

## Ejecutar en modo desarrollo

```powershell
npm run dev
```

La app usa Vite en el puerto `5173` y Electron se abre automaticamente cuando el servidor esta listo.

## Build

```powershell
npm run build
```

Scripts disponibles:

- `npm run dev`: inicia Vite y Electron.
- `npm run build`: compila Vite y ejecuta electron-builder para Windows.
- `npm run build:portable`: genera build portable para Windows.
- `npm run build:installer`: genera instalador NSIS para Windows.
- `npm run preview`: previsualiza el build web de Vite.

## Uso basico

1. Abre `Carpetas`.
2. Anade o revisa las carpetas monitorizadas.
3. Mete tus archivos de series o peliculas dentro de la carpeta correspondiente.
4. Usa `Ordenar` para que MiraVault reescanee y coloque episodios por serie, temporada y capitulo.
5. Entra en `Biblioteca` para ver tus tarjetas.
6. Abre un episodio o pelicula para reproducirlo y guardar progreso automaticamente.

## IPTV

La seccion `IPTV` permite:

- Cargar listas desde URL M3U/M3U8.
- Pegar contenido M3U manualmente.
- Filtrar por grupo o buscar canales.
- Reproducir canales dentro de la app cuando el formato sea compatible.
- Abrir canales en VLC cuando Chromium no pueda reproducir el stream.

Nota: algunos canales IPTV usan formatos o codecs que Chromium no reproduce bien. En esos casos VLC suele ser la opcion mas fiable.

## Torrents

La seccion `Torrents` esta pensada para trabajar con qBittorrent:

- Conexion a qBittorrent externo.
- Envio de magnets o torrents.
- Seguimiento de progreso, velocidad, ETA y estado.
- Importacion del contenido terminado a la biblioteca local.
- Ruta de descarga sugerida segun series existentes cuando sea posible.

Para usar qBittorrent externo, configura la Web UI de qBittorrent y conecta MiraVault a su URL local.
Para usar motor interno portable, coloca `qbittorrent-nox.exe` en `portable/qbittorrent/`.
El ejecutable `qbittorrent.exe` normal abre la interfaz grafica y no sirve como motor interno fiable.

MiraVault no incluye contenido ni proveedores. El usuario es responsable de usar fuentes y archivos legales.

## Reproductor y progreso

MiraVault prioriza VLC como reproductor externo porque ofrece mejor compatibilidad con:

- MKV.
- HEVC/H.265.
- Audio multicanal.
- Subtitulos.
- IPTV y streams poco compatibles.

La app guarda el punto donde dejaste un episodio y permite continuar desde ese minuto. Si quedas cerca del final, puede marcarse como visto.

## Metadatos sin API key

MiraVault no necesita claves privadas para enriquecer la biblioteca. Usa proveedores publicos:

- TVmaze para series.
- Cinemeta/Stremio para peliculas y como fallback de series.
- Wikidata/Wikipedia como fallback general.
- OpenLibrary para libros.

Los resultados se guardan en cache local para reducir peticiones y mejorar la velocidad de reescaneos.

## Temas

Los temas se cambian desde `Configuracion > Apariencia`.

Incluye temas oscuros, claros y variantes visuales como:

- Oscuro.
- Claro.
- Dark Blue.
- Deep Ocean.
- Noir Gold.
- Arctic.
- Rosewood.
- Cyberpunk.

## Estructura del proyecto

```text
electron/        Proceso principal, IPC, biblioteca, qBittorrent, reproductor y metadata
src/             Interfaz React
src/pages/       Pantallas principales
src/components/  Componentes compartidos
src/store/       Estado Zustand
src/config/      Configuracion compartida, como temas
portable/        Binarios portables opcionales
public/          Recursos publicos e iconos
```

## Stack tecnico

- Electron.
- React 19.
- Vite.
- Tailwind CSS.
- Zustand.
- better-sqlite3.
- electron-store.
- hls.js.

## Notas legales

MiraVault es un organizador y reproductor de contenido local. No proporciona contenido, listas IPTV, trackers, torrents ni proveedores. Usa la app solo con contenido propio o contenido para el que tengas derechos de acceso.

## Roadmap cercano

- Integrar logo e iconos definitivos.
- Pulir experiencia de qBittorrent y descargas.
- Mejorar deteccion de metadata y caratulas.
- Anadir mas acciones de biblioteca.
- Preparar build portable estable.
