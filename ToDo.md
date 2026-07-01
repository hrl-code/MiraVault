# MiraVault ToDo

Roadmap de trabajo para proximas actualizaciones. Separado entre tareas necesarias, mejoras posibles y criterios para considerar cada version lista.

## `0.5.x` - WebTorrent interno basico

### Necesario

- Hecho: crear `electron/torrentEngine.js` como fachada comun para motores torrent.
- Hecho: mantener qBittorrent funcionando detras de la fachada comun.
- Hecho: instalar e integrar `webtorrent` en el proceso principal de Electron.
- Hecho: crear `electron/torrentWebtorrent.js`.
- Hecho: exponer IPC generico para torrents: `status`, `config`, `add`, `list`, `pause`, `resume`, `remove`, `openContent`.
- Hecho: permitir anadir magnet links con WebTorrent.
- Hecho: permitir anadir archivos `.torrent` desde selector de archivos.
- Hecho: mostrar descargas WebTorrent en `src/pages/Downloads.jsx`.
- Hecho: mostrar progreso, velocidad, peers, estado y ruta de guardado.
- Hecho: evitar duplicados por info hash.
- Hecho: mantener qBittorrent externo como fallback avanzado.
- Pendiente: probar con torrents reales pequenos y legales.
- Pendiente: mejorar mensajes cuando un magnet tarda en obtener metadata.
- Pendiente: revisar comportamiento de WebTorrent en Electron empaquetado.

### Posible

- Hecho: selector visual de motor: WebTorrent interno / qBittorrent externo.
- Diagnostico rapido del motor activo.
- Configuracion de carpeta temporal de descargas.
- Aviso legal y de privacidad en la seccion Torrents.
- Boton para copiar magnet o info hash.

### Listo cuando

- Se puede descargar un magnet desde la app sin qBittorrent instalado.
- Se puede pausar, reanudar y eliminar una descarga WebTorrent.
- qBittorrent externo sigue funcionando igual que antes.
- La app no se bloquea si un magnet no consigue metadata.

## `0.6.x` - Integracion descargas y biblioteca

### Necesario

- Persistir cola WebTorrent en `electron-store`.
- Restaurar descargas al reiniciar MiraVault.
- Detectar descargas completadas.
- Importar contenido completado a Biblioteca.
- Ejecutar organizador solo sobre archivos terminados.
- Impedir que archivos incompletos entren en Biblioteca.
- Sugerir ruta de descarga segun series existentes.
- Abrir carpeta de descarga desde la lista.
- Mejorar mensajes de error: sin peers, tracker caido, magnet sin metadata, ruta no disponible.

### Posible

- Importacion automatica configurable.
- Etiquetas de tipo detectado: serie, pelicula, mixto, desconocido.
- Boton "ordenar al completar".
- Historial de descargas completadas.
- Limpieza guiada de archivos residuales despues de importar.

### Listo cuando

- Una descarga completa puede pasar a Biblioteca sin pasos raros.
- El reinicio de la app no duplica torrents ni pierde estados importantes.
- Los incompletos no aparecen como peliculas o episodios.

## `0.7.x` - Control de archivos y cola

### Necesario

- Mostrar archivos internos de cada torrent.
- Permitir seleccionar que archivos descargar.
- Priorizar archivos de video frente a samples, nfo, txt, imagenes y residuos.
- Ordenar cola por progreso, tiempo restante, velocidad, tamano y fecha.
- Mejorar estados visuales de descargas.
- Anadir acciones por torrent: abrir carpeta, importar, eliminar, copiar magnet.

### Posible

- Prioridad alta/media/baja por descarga.
- Limites de velocidad globales.
- Limites de velocidad por torrent.
- Pausar automaticamente descargas con demasiados errores.
- Reintentar magnets sin metadata.

### Listo cuando

- El usuario puede controlar que baja y que no baja.
- La lista de torrents se puede ordenar de forma util.
- El sistema no importa basura a Biblioteca.

## `0.8.x` - Reproductor, IPTV y experiencia multimedia

### Necesario

- Mejorar la pantalla de Biblioteca para bibliotecas grandes.
- Mejorar deteccion de progreso y visto/no visto.
- Mejorar continuidad: "seguir viendo" mas visible y fiable.
- Mejorar IPTV: favoritos, grupos e historial.
- Mejorar fallback a VLC con mensajes mas claros.
- Revisar accesibilidad basica: teclado, foco, contraste.

### Posible

- Busqueda global en Biblioteca.
- Filtros por visto/no visto, calidad, tipo y carpeta.
- Pagina de detalle mas completa para series.
- Edicion manual de metadata por item.
- Ocultar items no deseados.
- Fusionar duplicados desde la UI.

### Listo cuando

- Biblioteca, Player e IPTV se sienten coherentes.
- El usuario puede volver rapido a lo que estaba viendo.
- Los errores de reproduccion explican que hacer.

## `0.9.x` - Estabilizacion pre-1.0

### Necesario

- Probar bibliotecas grandes.
- Probar multiples descargas WebTorrent simultaneas.
- Medir consumo de CPU, memoria y disco.
- Revisar instalador Windows.
- Crear checklist de release.
- Documentar solucion de problemas.
- Revisar textos legales y limites de responsabilidad.
- Revisar errores no controlados en Electron.

### Posible

- Tests automatizados para parser de biblioteca.
- Tests unitarios para deteccion de episodios.
- Tests de smoke para IPC principal.
- GitHub Actions para build basico.
- Plantillas de issues para bugs y mejoras.

### Listo cuando

- La app puede usarse varios dias sin corromper biblioteca ni cola.
- El build se puede generar de forma repetible.
- La documentacion cubre instalacion, uso y problemas comunes.

## `1.0` - Primera version estable

### Necesario

- Build estable para Windows.
- Instalador descargable desde GitHub Releases.
- Biblioteca local estable.
- Progreso de visionado estable.
- IPTV suficientemente estable con fallback a VLC.
- Torrents con WebTorrent interno usable y qBittorrent externo como fallback.
- Importacion a Biblioteca fiable.
- README completo y actualizado.
- ToDo/Roadmap actualizado con siguientes objetivos.

### Posible

- Logo e iconos definitivos.
- Firma de instalador si el proyecto crece.
- Sistema de actualizaciones.
- Exportar/importar configuracion.
- Backup de biblioteca y progreso.

### Listo cuando

- Un usuario puede descargar MiraVault, configurarlo y usarlo sin leer el codigo.
- Las funciones principales no dependen de herramientas externas salvo VLC recomendado.
- Los limites conocidos estan documentados de forma honesta.

## Backlog general

### Biblioteca

- Mejorar parser de nombres raros.
- Detectar especiales y OVAs.
- Detectar anime con numeracion absoluta.
- Separar extras, trailers y samples.
- Permitir correccion manual de serie, temporada y episodio.

### Metadata

- Mejorar matching entre nombre local y proveedor publico.
- Cache con expiracion configurable.
- Fallback visual cuando no haya caratula.
- Selector manual de resultado si hay varias coincidencias.

### UI

- Mejorar empty states.
- Mejorar estados de carga.
- Mejorar mensajes de error.
- Mejorar responsive en ventanas pequenas.
- Revisar consistencia de iconos y botones.

### Seguridad y privacidad

- No subir ni registrar rutas personales en logs publicos.
- No incluir contenido, trackers, proveedores ni listas IPTV.
- Documentar que torrents/IPTV dependen de fuentes legales del usuario.
- Evitar guardar contrasenas sensibles en texto plano cuando sea posible.

### Packaging

- Revisar `electron-builder.yml`.
- Preparar builds reproducibles.
- Evitar incluir binarios grandes en Git.
- Documentar como configurar VLC/qBittorrent externos.
- Revisar native modules antes de releases.
