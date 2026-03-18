# SincroData PRO 🚀

Herramienta avanzada de gestión e intercambio de datos empresariales que permite importar y exportar información en múltiples formatos (**CSV, XML y JSON**) con validación de datos en tiempo real.

## 📋 Características principales

*   **Importación Multiformato**: Carga de datos masiva desde archivos `.csv`, `.json` y `.xml`.
*   **Exportación Flexible**: Generación de archivos portátiles de las entidades de la base de datos.
*   **Validación de Datos**: Integración con **Zod** para asegurar que cada registro cumple con las reglas de negocio antes de ser persistido.
*   **Gestión de Errores**: Sistema de reportes automáticos que detalla fallos específicos de validación (índices, campos y razones).
*   **Dashboard Moderno**: Interfaz web fluida con soporte para **Drag & Drop** y notificaciones dinámicas.

## 🛠️ Requisitos previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

1.  [Node.js](https://nodejs.org/) (versión 20+)
2.  [Docker Desktop](https://www.docker.com/products/docker-desktop/) (El contenedor con PostgreSQL debe estar en ejecución)

## ⚙️ Instalación

1.  Clona el repositorio o descarga el código fuente.
2.  Instala las dependencias necesarias:
    ```bash
    npm install
    ```
3.  Asegúrate de que tus contenedores de Docker estén activos para que la base de datos sea accesible.

## 🚀 Cómo empezar

Para lanzar la herramienta visual (Dashboard) y habilitar la API, ejecuta:

```bash
npm run dashboard
```

Una vez ejecutado, abre tu navegador en:
👉 **[http://localhost:3000](http://localhost:3000)**

## 📂 Estructura del Proyecto

*   `src/services/dataExchange.service.ts`: Lógica centralizada de conversión y validación.
*   `src/server.ts`: Servidor Express y API REST.
*   `public/`: Interfaz de usuario (HTML, CSS y JavaScript moderno).
*   `reports/`: Almacén de informes generados tras cada operación de intercambio.
*   `data_temp/samples/`: Ejemplos prácticos listos para probar la herramienta.

## 🛡️ Seguridad y Tecnología

Este proyecto utiliza **Prisma ORM** para una comunicación segura y tipada con la base de datos, eliminando el riesgo de inyección SQL y optimizando las consultas mediante inserciones masivas (`createMany`).

---
Desarrollado para el módulo de Acceso a Datos como herramienta de gestión de ficheros persistentes.
