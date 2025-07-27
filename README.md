# 💰 Lyra - Asistente Personal de Gastos

**Lyra** es una aplicación web moderna desarrollada en Angular que te permite registrar y gestionar tus gastos personales de manera intuitiva mediante una interfaz de chat. Puedes enviar tus gastos por texto o nota de voz, y Lyra los procesará automáticamente usando inteligencia artificial.

## 🚀 Características Principales

- **💬 Interfaz de Chat Intuitiva**: Registra gastos como si estuvieras conversando
- **🎤 Grabación de Voz**: Envía notas de voz para registrar gastos rápidamente
- **📱 Diseño Responsivo**: Funciona perfectamente en desktop y móvil
- **🌙 Tema Oscuro**: Interfaz moderna con colores inspirados en Trae AI
- **🤖 IA Integrada**: Procesamiento automático de gastos con n8n y AI Agent
- **⚡ Tiempo Real**: Respuestas instantáneas del asistente

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Angular 20.1.0
- **Estilos**: Tailwind CSS 4.1.11
- **Iconos**: SVG inline personalizados
- **Audio**: Web Audio API para grabación de voz
- **Backend**: n8n con AI Agent para procesamiento
- **TypeScript**: Para tipado estático y mejor desarrollo

## 📋 Requisitos Previos

- Node.js (versión 18 o superior)
- npm (viene con Node.js)
- n8n configurado con webhook y AI Agent

## 🔧 Instalación

1. **Clona el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd finflowia
   ```
2. **Instala las dependencias**:
   ```bash
   npm install
   ```
3. **Configura las variables de entorno**:
   - Crea un archivo `.env` en la raíz del proyecto.
   - Añade las siguientes variables:
    ```bash
    export const environment = {
      production: false, // true para production
      n8nWebhookUrl: 'TU_URL_DE_WEBHOOK_DE_N8N_AQUI'
    };
    ```
  4. **Inicia la aplicación**:
     ```bash
     ng serve
     ```
  5. **Abre la aplicación**:
     - Visita `http://localhost:4200` en tu navegador.
     - Interactúa con Lyra para registrar tus gastos.
