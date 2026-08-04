# Alcance Victoria Barcelona Norte — Frontend

Frontend público y panel de gestión de eventos de Alcance Victoria Barcelona Norte. Está construido con React y Vite y está preparado para desplegarse como una SPA en Cloudflare Pages.

## Arquitectura prevista

- **Hosting:** Cloudflare Pages.
- **Datos y autenticación:** Supabase.
- **Eventos públicos:** lectura directa mediante `@supabase/supabase-js`.
- **Administración:** Supabase Auth y políticas Row Level Security (RLS).
- **Peticiones de oración:** Supabase Edge Function para validar, limitar y guardar los envíos.

La aplicación no debe contener secretos. La clave pública de Supabase puede utilizarse desde el navegador siempre que todas las tablas tengan políticas RLS correctas. La clave `service_role` nunca debe añadirse a este repositorio ni a una variable que empiece por `VITE_`.

## Requisitos

- Node.js 20 o superior.
- npm.
- Un proyecto de Supabase configurado.

## Desarrollo local

```bash
npm install
npm run dev
```

La aplicación estará disponible normalmente en `http://localhost:5173`.

## Variables de entorno

Crea un archivo `.env.local`:

```env
VITE_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
```

Durante la migración todavía puede utilizarse la API FastAPI existente:

```env
VITE_API_URL=http://localhost:8000/api
```

`VITE_API_URL` dejará de ser necesaria cuando `src/api.js` utilice Supabase directamente.

## Comandos

```bash
npm run dev      # Servidor local
npm run build    # Compilación de producción
npm run preview  # Previsualizar la compilación
npm run lint     # Comprobar el código
```

Antes de publicar cambios deben pasar, como mínimo:

```bash
npm run lint
npm run build
```

## Despliegue en Cloudflare Pages

Conecta este repositorio desde **Workers & Pages → Create application → Pages** y configura:

| Ajuste | Valor |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

Añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en las variables de producción y preview de Cloudflare Pages.

La aplicación utiliza rutas como `/gestion`. Cloudflare debe devolver `index.html` para las rutas de la SPA; comprueba que una visita directa a `/gestion` no produzca un 404 después del primer despliegue.

## Comunicación con Supabase

El navegador puede llamar a Supabase mediante HTTPS:

```text
Cloudflare Pages
      │
      ├── supabase-js ──> Database API ──> PostgreSQL
      │
      └── functions.invoke() ──> Edge Functions ──> PostgreSQL
```

Uso recomendado:

- Consultar eventos publicados directamente desde la Database API.
- Exigir sesión de administrador para crear, modificar o eliminar eventos.
- Enviar peticiones de oración a una Edge Function.
- No permitir que usuarios públicos consulten `prayer_requests`.

## Seguridad

- No subir archivos `.env` al repositorio.
- No usar nunca la clave `service_role` en React.
- Activar RLS en todas las tablas expuestas.
- Limitar las escrituras de eventos a usuarios administradores.
- Validar las peticiones de oración en servidor.
- Añadir protección anti-spam, por ejemplo Cloudflare Turnstile.
- Configurar CORS en las Edge Functions para el dominio público y los previews necesarios.

## Repositorio relacionado

El esquema SQL, las políticas RLS, las migraciones y las Edge Functions pertenecen al repositorio independiente del backend.

## Documentación

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Supabase con React](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

