# Alcance Victoria Barcelona Norte — Frontend

Web pública y panel administrativo de Alcance Victoria Barcelona Norte, construidos con React y Vite.

## Funcionalidad

- Página pública responsive.
- Próximos eventos obtenidos desde la API, con ficha pública e inscripción al pulsar cada tarjeta.
- Eventos con menú/precio único o precios separados para adultos y niños.
- Formulario privado de peticiones de oración.
- Suscripción pública a newsletter con consentimiento.
- Ruta administrativa `/gestion` sin enlaces públicos visibles.
- Login para usuarios autorizados.
- Panel responsive con resumen, eventos, inscripciones, fotos, usuarios, newsletter y auditoría.
- Gestión privada de campañas: borrador, edición, vista previa, prueba y envío/programación.
- Interfaz adaptada a los permisos del rol autenticado.

## Requisitos

- Node.js 20 o superior.
- npm.
- Backend FastAPI iniciado en el puerto 8000.

## Instalación y desarrollo

```bash
npm install
npm run dev
```

La web estará normalmente en `http://localhost:5173`.

## Variables de entorno

Copia `.env.example` a `.env.local`:

```env
VITE_API_URL=http://localhost:8000/api
```

No añadas secretos al frontend. Todas las variables `VITE_*` quedan visibles en el navegador.

## Acceso administrativo

Visita directamente:

```text
http://localhost:5173/gestion
```

No existe un enlace público hacia esta ruta. La ausencia del enlace no es la protección de seguridad: el backend valida sesión, rol y CSRF en cada operación.

El primer usuario se crea desde el repositorio del backend mediante `scripts/create_admin.py`.

## Newsletter

El formulario de la web pública es para las personas que quieren suscribirse. El editor de campañas vive únicamente en `/gestion` y solo permite escribir o enviar a los roles `developer`, `admin` y `communications`; el rol `viewer` es de consulta.

La clave de Resend y la identidad del remitente se configuran siempre en el backend. Nunca deben añadirse como variables `VITE_*` ni incluirse en este repositorio.

## Comandos

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Despliegue en Cloudflare Pages

Configuración prevista:

| Ajuste | Valor |
| --- | --- |
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Variable | `VITE_API_URL=https://URL-DE-LA-API/api` |

La ruta `/gestion` ya incluye el fallback SPA en `public/_redirects`. Las cabeceras de seguridad se publican desde `public/_headers`.

La guía conjunta de Cloudflare Pages, Render y Neon está en [`../backend/DESPLIEGUE_DEMO_GRATUITO.md`](../backend/DESPLIEGUE_DEMO_GRATUITO.md).
