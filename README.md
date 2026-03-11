# Frontend Mentor - Aplicación del clima

![Vista previa del diseño para el desafío de codificación de la aplicación del clima](./preview.jpg)

## ¡Bienvenido! 👋

**Para hacer este desafío, necesitas un buen conocimiento de HTML, CSS y JavaScript.**

## El desafío

Construye una aplicación del clima usando la [API de Open-Meteo](https://open-meteo.com/) y haz que se vea lo más parecido posible al diseño.

Puedes usar cualquier herramienta que te guste para completar el desafío. Así que si tienes algo que te gustaría practicar, siéntete libre de intentarlo.

Tus usuarios deberían poder:

- Buscar información del clima ingresando una ubicación en la barra de búsqueda
- Ver las condiciones climáticas actuales incluyendo temperatura, icono del clima y detalles de ubicación
- Ver métricas climáticas adicionales como temperatura de "sensación térmica", porcentaje de humedad, velocidad del viento y cantidades de precipitación
- Explorar un pronóstico del clima de 7 días con temperaturas máximas/mínimas diarias e iconos del clima
- Ver un pronóstico por hora que muestre los cambios de temperatura a lo largo del día
- Cambiar entre diferentes días de la semana usando el selector de días en la sección de pronóstico por hora
- Alternar entre unidades de medida Imperial y Métrica a través del menú desplegable de unidades
- Ver el diseño óptimo para la interfaz dependiendo del tamaño de pantalla de su dispositivo
- Ver los estados de hover y focus para todos los elementos interactivos en la página

## Empezando

### Qué se incluye

Tu tarea es construir el proyecto siguiendo los diseños dentro de la carpeta `/design`. Encontrarás tanto una versión móvil como de escritorio del diseño.

**En tu descarga:**
- Diseños móvil y de escritorio (formato JPG)
- Todos los recursos necesarios en la carpeta `/assets`
- Archivos de fuentes variables y estáticas (o enlace a Google Fonts)
- `style-guide.md` con colores, fuentes y otras especificaciones de diseño

**¿Quieres construcciones más precisas?** Los diseños están en formato JPG estático, lo que significa que necesitarás usar tu mejor criterio para estilos como `font-size`, `padding` y `margin`.

### Configuración de la API

Este proyecto usa la [API de Open-Meteo](https://open-meteo.com/) para obtener datos del clima.

**Buenas noticias:** ¡Open-Meteo es completamente gratuito y no requiere una clave API! Puedes comenzar a hacer solicitudes de inmediato.

- **Documentación de la API:** [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
- **Sin límites de tasa** para uso personal razonable
- Ejemplo de endpoint: `https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true`

Consulta su documentación para todos los parámetros climáticos disponibles y capacidades de búsqueda de ubicación.

## Construyendo tu proyecto

Siéntete libre de usar cualquier flujo de trabajo con el que te sientas cómodo. A continuación hay un proceso sugerido, pero no sientas que necesitas seguir estos pasos:

1. Inicializa tu proyecto como un repositorio público en [GitHub](https://github.com/). Crear un repo hará más fácil compartir tu código con la comunidad si necesitas ayuda. Si no estás seguro de cómo hacer esto, [lee este recurso Try Git](https://try.github.io/).
2. Configura tu repositorio para publicar tu código en una dirección web. Esto también será útil si necesitas ayuda durante un desafío, ya que puedes compartir la URL de tu proyecto con la URL de tu repositorio. Hay varias formas de hacer esto, y proporcionamos algunas recomendaciones a continuación.
3. Revisa los diseños para comenzar a planificar cómo abordarás el proyecto. Este paso es crucial para ayudarte a pensar con anticipación en las clases CSS para crear estilos reutilizables.
4. Antes de agregar cualquier estilo, estructura tu contenido con HTML. Escribir tu HTML primero puede ayudar a enfocar tu atención en crear contenido bien estructurado.
5. Crea un archivo CSS separado (por ejemplo, `styles.css`) y vincúlalo en el `<head>` de tu HTML usando `<link rel="stylesheet" href="styles.css">`.
6. Define en el CSS los tokens de diseño definidos en el archivo style-guide.md, usando `:root` para colores y tipografías. Ejemplo:
   ```css
   :root {
     /* Colores */
     --color-primary: #3b82f6;
     --color-background: #0f172a;
     --color-text: #f1f5f9;
     
     /* Tipografías */
     --font-primary: 'DM Sans', sans-serif;
     --font-secondary: 'Bricolage Grotesque', sans-serif;
     --font-size-base: 16px;
     --font-size-heading: 2rem;
   }
   ```
7. Escribe los estilos base para tu proyecto utilizando las variables CSS que definiste, aplicando estilos de contenido general.
8. Comienza agregando estilos en la parte superior de la página y trabaja hacia abajo. Solo pasa a la siguiente sección una vez que estés satisfecho con el área en la que has estado trabajando.
9. Crea un archivo JavaScript separado (por ejemplo, `app.js`) e impórtalo al final del HTML, justo antes de cerrar la etiqueta `</body>` usando `<script src="app.js"></script>`.
