# MiraVault

**Version actual: `0.4.0-beta`**

MiraVault es una app de escritorio para organizar, explorar y reproducir una biblioteca multimedia local. Nacio como un gestor de torrents, pero ahora apunta a ser un centro personal para series, peliculas, IPTV, descargas y progreso de visionado.

> Estado: beta temprana. La app es instalable y ejecutable en desarrollo, pero todavia no debe considerarse una version estable `1.0`.

## Que hace

- Muestra una biblioteca visual de series y peliculas locales con tarjetas, caratulas, calidad, idioma y progreso.
- Ordena carpetas de series detectando temporadas, episodios, archivos incompletos y residuos comunes.
- Guarda automaticamente el punto de visionado y permite continuar desde donde lo dejaste.
- Marca episodios como vistos cuando se completan o quedan cerca del final.
- Usa VLC como reproductor externo recomendado para MKV, HEVC/H.265, subtitulos y audio multicanal.
- Permite cargar IPTV desde listas M3U/M3U8 y reproducir dentro de la app cuando Chromium lo soporte.
- Incluye fallback a VLC para streams IPTV o videos que el reproductor integrado no pueda manejar.
- Integra una seccion de Torrents mediante qBittorrent externo o motor interno portable si se aporta `qbittorrent-nox.exe`.
- Enriquece la biblioteca con metadatos sin API key usando proveedores publicos.
- Incluye temas claros, oscuros y variantes visuales desde Configuracion.

## Version

Esta release es **`0.4.0-beta`**.

Significa:

- La base de la app ya existe y se puede clonar, instalar y ejecutar.
- La biblioteca local, el progreso, IPTV, temas y la capa de qBittorrent estan integrados.
- Aun puede haber cambios grandes de arquitectura, interfaz y flujo de torrents antes de `1.0`.
- No se incluyen binarios de VLC ni qBittorrent en el repositorio.
- No se incluyen proveedores de contenido, listas IPTV, trackers ni torrents.

## Requisitos

- Windows 10/11.
- Node.js 20 o superior recomendado.
- npm.
- VLC recomendado para reproduccion robusta.
- qBittorrent opcional si quieres usar la seccion de Torrents.

## Instalacion para desarrollo

```powershell
git clone https://github.com/hrl-code/MiraVault.git
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

Nota: el build de instalador/portable puede requerir revisar dependencias nativas y configuracion de Windows en cada equipo. La ruta principal validada para esta beta es `npm install` + `npm run dev`.

## Uso basico

1. Abre `Carpetas`.
2. Selecciona o revisa la carpeta de biblioteca.
3. Mete tus archivos de series o peliculas dentro de las carpetas correspondientes.
4. Usa `Ordenar` para que MiraVault reescanee y coloque episodios por serie, temporada y capitulo.
5. Entra en `Biblioteca` para ver las tarjetas detectadas.
6. Abre una serie, episodio o pelicula para reproducir y guardar progreso automaticamente.

## Biblioteca y organizador

El organizador intenta detectar archivos de video terminados, series, temporadas y episodios usando nombres de archivo y carpetas. Tambien intenta separar archivos residuales o incompletos para evitar que aparezcan como contenido real.

La deteccion es best-effort: los nombres muy raros, archivos sin temporada/capitulo o carpetas mezcladas pueden requerir ajustes manuales.

## Reproductor y progreso

MiraVault prioriza VLC como reproductor externo porque ofrece mejor compatibilidad con:

- MKV.
- HEVC/H.265.
- Audio multicanal.
- Subtitulos.
- IPTV y streams poco compatibles.

La app guarda automaticamente el punto donde dejaste un episodio. Si quedas cerca del final, puede marcarse como visto.

Para que VLC se detecte automaticamente:

- Instala VLC en `C:\Program Files\VideoLAN\VLC\vlc.exe`, o
- Coloca `vlc.exe` en `portable/vlc/vlc.exe`.

## IPTV

La seccion `IPTV` permite:

- Cargar listas desde URL M3U/M3U8.
- Pegar contenido M3U manualmente.
- Filtrar por grupo o buscar canales.
- Reproducir canales dentro de la app cuando el formato sea compatible.
- Abrir canales en VLC cuando Chromium no pueda reproducir el stream.

Algunos canales IPTV usan formatos, codecs o protecciones que Chromium no reproduce bien. En esos casos VLC suele ser la opcion mas fiable.

## Torrents

La seccion `Torrents` trabaja con qBittorrent:

- Conexion a qBittorrent externo mediante Web UI.
- Envio de magnets o archivos `.torrent`.
- Seguimiento de progreso, velocidad, ETA y estado.
- Importacion del contenido terminado a la biblioteca local.
- Ruta de descarga sugerida segun series existentes cuando sea posible.

Para usar qBittorrent externo:

1. Activa la Web UI de qBittorrent.
2. Configura URL, usuario y contrasena en MiraVault.
3. Comprueba la conexion desde la seccion `Torrents`.

Para usar motor interno portable:

1. Coloca `qbittorrent-nox.exe` en `portable/qbittorrent/`.
2. Activa el modo interno desde `Torrents`.

Importante: `qbittorrent.exe` abre interfaz grafica y no sirve como motor interno fiable. Para modo interno se necesita `qbittorrent-nox.exe`.

## Metadatos sin API key

MiraVault no necesita claves privadas para enriquecer la biblioteca. Usa proveedores publicos:

- TVmaze para series.
- Cinemeta/Stremio para peliculas y fallback de series.
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
portable/        Binarios portables opcionales, no incluidos en Git
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

## Limitaciones conocidas en `0.4.0-beta`

- No hay binarios oficiales publicados todavia para usuario final.
- El build portable/instalador puede necesitar ajustes por equipo.
- La reproduccion IPTV integrada depende de los codecs soportados por Chromium.
- VLC es la opcion recomendada para codecs complejos.
- La deteccion de series y peliculas es best-effort y puede fallar con nombres poco estandar.
- El motor interno de torrents requiere `qbittorrent-nox.exe`; no se incluye en el repositorio.
- La interfaz y los flujos aun pueden cambiar antes de `1.0`.

## Roadmap

### `0.5.x`

- Mejorar el organizador con mas reglas de deteccion y vista previa mas clara.
- Pulir la experiencia de torrents con qBittorrent externo e interno.
- Mejorar estados vacios, errores y mensajes de recuperacion.
- Anadir configuracion mas completa para rutas, reproductor y conexion qBittorrent.

### `0.6.x`

- Publicar builds portables e instalador Windows de forma mas estable.
- Mejorar metadata, caratulas y cache local.
- Anadir acciones mas completas de biblioteca: editar, fusionar, ocultar y reparar items.
- Mejorar IPTV: favoritos, grupos, historial y fallback mas claro.

### `0.7.x` - `0.9.x`

- Endurecer rendimiento en bibliotecas grandes.
- Mejorar accesibilidad y navegacion por teclado.
- Preparar pruebas automatizadas y checks de release.
- Congelar arquitectura previa a `1.0`.

### `1.0`

- Build estable para usuario final.
- Flujo de biblioteca, reproduccion, progreso e IPTV suficientemente estable.
- Documentacion completa de instalacion, configuracion y solucion de problemas.
- Politica clara de compatibilidad y actualizaciones.

## Notas legales

MiraVault es un organizador y reproductor de contenido local. No proporciona contenido, listas IPTV, trackers, torrents ni proveedores. Usa la app solo con contenido propio o contenido para el que tengas derechos de acceso.
