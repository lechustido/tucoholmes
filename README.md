# Tucoholmes

Tucoholmes es una extensión para Chrome que permite registrar todos los eventos importantes de una página web, incluyendo llamadas HTTP, mensajes de `console.log`, errores de `console.error`, y datos de `localStorage`. Esta herramienta es útil para desarrolladores que necesitan depurar y analizar el comportamiento de sus aplicaciones web.

## Características

- Registro de llamadas HTTP.
- Captura de mensajes de `console.log` y `console.error`.
- Almacenamiento de datos de `localStorage`.
- Grabación de la pantalla del navegador.
- Interfaz de usuario para iniciar y detener la grabación.

## Instalación

1. Clona este repositorio.
2. Abre Chrome y navega a `chrome://extensions/`.
3. Activa el "Modo de desarrollador" en la esquina superior derecha.
4. Haz clic en "Cargar descomprimida" y selecciona la carpeta del repositorio clonado.

## Uso

1. Haz clic en el icono de la extensión en la barra de herramientas de Chrome.
2. La primera vez que instalas la extensión, deberás reiniciar la página en la que te encuentres para que se inyecten correctamente los ficheros necesarios.
2. Utiliza los botones "Comenzar a grabar" y "Terminar de grabar" para controlar la grabación de eventos.

## Archivos Principales

### `manifest.json`
Define la configuración de la extensión, incluyendo permisos y scripts utilizados.

## Otras características
Actualmente la extensión no posee una interfaz gráfica maquetada, por lo que comienza a grabar  cuando se le indica y para de la misma manera. Como resultado devuelve un Objeto con todos los elementos por la consola.