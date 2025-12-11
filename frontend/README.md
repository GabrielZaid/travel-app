# Frontend — travel-app

Descripción
-
Aplicación frontend construida con Angular 21 que consume el backend (endpoints en `http://localhost:3000`) para mostrar búsquedas de vuelos, resultados e inventario de disponibilidad (cupos).

Contenido del repositorio
-
- `src/`: código fuente de la aplicación Angular
	- `app/features`: componentes principales (search, results, availability)
	- `app/core/services`: servicios HTTP (ajusta `baseUrl` en `flight-availability.service.ts` si tu backend corre en otra URL)
	- `public/`: activos estáticos

Tecnologías
-
- Angular 21
- TypeScript
- Tailwind CSS (integra estilos globales)
- RxJS
- Vitest (tests)

Cómo usar (desarrollo)
-
1. Entra a la carpeta `frontend` e instala dependencias:

```powershell
cd frontend
pnpm install
```

2. Inicia el servidor de desarrollo:

```powershell
pnpm run start
```

3. Abre `http://localhost:4200/` en tu navegador. La app se recargará automáticamente en cambios.

Notas de configuración
-
- El servicio que hace la petición a la API de disponibilidades usa por defecto `http://localhost:3000` como `baseUrl`. Si tu backend corre en otra URL, modifica `src/app/core/services/flight-availability.service.ts` y actualiza `baseUrl`.

Interacción con el backend
-
- La página de `Flight Availability` hace un `POST /flights/availability` con el payload:

```json
{
	"origin":"MAD",
	"destination":"JFK",
	"date":"2025-12-20",
	"time":"08:00:00",
	"page":1,
	"limit":5,
	"sortBy":"closestDeparture"
}
```

El backend devuelve la lista paginada y metadata `{ data, total, page, pageSize }`.

Comandos útiles
-
- `pnpm run start` — arranca la app en modo desarrollo
- `pnpm run build` — genera el build de producción
- `pnpm run test` — ejecuta tests (Vitest)

Consejos de estilo
-
- Se utiliza Tailwind para utilidades; los estilos del componente están en `app/features/*`.

Contribuciones
-
- Abre issues o PRs. Para cambios grandes, comenta antes para acordar la implementación.

Contacto
-
Para dudas o soporte, contacta al autor del repositorio.
