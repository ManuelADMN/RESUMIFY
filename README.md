# Resumify / Constructor de CV

Un moderno constructor de currículums de código abierto creado con React, Vite y Tailwind CSS, diseñado para ser rápido, personalizable y ATS-friendly.

## Características

- 📄 **Exportación a PDF**: Genera tu CV al instante con un diseño limpio.
- 💾 **Exportación a JSON y PDF enriquecido**: Los datos de tu CV se incrustan en el PDF resultante. Puedes volver a cargar el mismo PDF en la aplicación y retomará todos tus datos. También puedes descargar e importar en formato `.json` crudo.
- 🌍 **Soporte Bilingüe**: Cambia la interfaz entre Español e Inglés con un clic.
- 🤖 **Integración con IA**: Usa la herramienta de "Prompting" para extraer datos de LinkedIn o texto libre usando modelos como Gemini o ChatGPT.
- ✨ **Mejora con IA**: Mejora los textos, viñetas y descripciones de tus experiencias utilizando la API de Gemini integrada.
- 🔄 **Arrastrar y Soltar**: Ordena las secciones y elementos de tu CV directamente desde el panel lateral de forma fluida.

## Instalación y Uso (Desarrollo Local)

Asegúrate de tener Node.js instalado.

\`\`\`bash
# 1. Clona el repositorio e instala las dependencias
npm install o yarn install

# 2. Configura las variables de entorno
# Copia el archivo .env.example a .env
# Añade tu clave de API de Gemini si deseas utilizar las funciones de IA
cp .env.example .env

# 3. Inicia el servidor de desarrollo
npm run dev
\`\`\`

## Construcción para Producción

Para compilar la aplicación para producción:

\`\`\`bash
npm run build
\`\`\`

El resultado se generará en la carpeta \`dist\`. Esta carpeta está lista para ser desplegada en Vercel, Netlify, Cloudflare Pages o el host estático de tu preferencia.

## Estructura de Datos Abierta (Resumify JSON)

El proyecto utiliza un esquema de datos abierto en formato JSON. Esta estructura garantiza que siempre seas el dueño de tus datos profesionales sin estar anclado a formatos propietarios.

## Soporte

Si te gusta el proyecto, siéntete libre de contribuir mediante Pull Requests o abriendo Issues para reporte de fallos.
