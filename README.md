# Travel App — Buscador de Vuelos con Amadeus

Resumen
-------
Travel App es una aplicación full‑stack (Angular + NestJS) que consume las APIs de Amadeus (Self‑Service) para proporcionar búsqueda de vuelos, sugerencias de destinos, fechas más económicas y consulta de disponibilidad por clase (inventario de asientos). Está diseñada como proyecto de referencia para desarrolladores y para facilitar pruebas de integración con Amadeus.

Tabla de contenidos
------------------
- [Descripción general](#descripción-general)
- [Tecnologías principales](#tecnologías-principales)
- [APIs de Amadeus usadas](#apis-de-amadeus-usadas)
- [Backend — estructura e implementación](#backend--estructura-e-implementación)
- [Frontend — estructura e implementación](#frontend--estructura-e-implementación)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Estructura del proyecto (tree)](#estructura-del-proyecto-tree)
- [Flujo general de la aplicación](#flujo-general-de-la-aplicación)
- [Licencia](#licencia)


Descripción general
--------------------
- Arquitectura: aplicación full‑stack con frontend en Angular y backend en NestJS.
- Propósito: permitir buscar vuelos, mostrar resultados paginados, ordenar resultados (p. ej. por fecha de salida cercana, duración, disponibilidad de asientos) y consultar la disponibilidad por clase (F, J, Y, etc.) en tiempo real usando Amadeus.
- Integraciones: la comunicación con Amadeus se realiza desde el backend, que obtiene token OAuth2 y ejecuta las llamadas a los endpoints oficiales.


Tecnologías principales
----------------------

Frontend
- Angular 21 (según `frontend/package.json`)
- Tailwind CSS (utilidades de diseño)
- RxJS
- Angular Signals (uso de signals para estado reactivo en componentes)

Backend
- NestJS (v11, según `backend/package.json`)
- Axios / `@nestjs/axios` (cliente HTTP para consumir Amadeus)
- TypeScript, DTOs (`class-validator` / `class-transformer`), módulos y pipes

Infraestructura / Servicios externos
- Amadeus Self‑Service API (OAuth2)
- Variables de entorno para credenciales y endpoints


APIs de Amadeus usadas
----------------------

| Nombre | Método | Endpoint (base path relativo) | Uso |
|---|---:|---|---|
| Flight Offers Search | GET | `/v2/shopping/flight-offers` | Búsqueda principal de ofertas: rutas, tiempos y precios. |
| Flight Destinations | GET | `/v1/shopping/flight-destinations` | Inspiración: destinos baratos desde un origen. |
| Flight Cheapest Dates | GET | `/v1/shopping/flight-dates` | Obtener fechas alternativas con precio más bajo. |
| Flight Availability | POST | `/v1/shopping/availability/flight-availabilities` | Consultar disponibilidad por clase y número de asientos. |

Todas las llamadas a estas APIs se realizan a través del `AmadeusService` en el backend, que centraliza la obtención del token OAuth2, las cabeceras, la serialización y el manejo de errores.


Backend — estructura e implementación
-----------------------------------

Estructura principal (resumen):

```
backend/
├─ src/
│  ├─ amadeus/        # Cliente Amadeus (token OAuth2, helpers)
│  ├─ flights/        # Controller, service, DTOs y endpoints relacionados
│  ├─ constants/      # Constantes de configuración y mensajes de error
│  ├─ utils/          # Parsers, paginación y ordenamiento (separados por responsabilidad)
│  └─ main.ts
```

Componentes clave
- `AmadeusService`: encapsula la autenticación OAuth2 (token caching/refresh) y métodos `get`/`post` genéricos para llamar a Amadeus.
- `FlightsService`: implementa lógica de negocio y orquestación:
	- `searchFlights(searchDto)` — usa Flight Offers Search y parsea a modelos internos.
	- `searchFlightsInspiration(searchDto)` — usa Flight Destinations.
	- `findCheapestDates(searchDto)` — usa Flight Cheapest Dates.
	- `searchAvailability(searchDto)` — llama a Flight Availability, parsea la respuesta, y soporta paginación y ordenamiento a través de utilidades en `src/utils`.

Parsers / Normalización
- `parseFlights`, `parseInspiration`, `parseCheapestDates`, `parseAvailability` — funciones que normalizan la estructura de Amadeus hacia los tipos internos usados por la API.

Buenas prácticas aplicadas
- Separación de responsabilidades: parsing y utilidades fuera del servicio principal para mantener el código testeable y modular.
- Validación de DTOs con `class-validator` y pipes de NestJS.


Frontend — estructura e implementación
------------------------------------

Estructura principal (resumen):

```
frontend/
├─ src/
│  ├─ app/
│  │  ├─ core/
│  │  │  ├─ services/   # Servicios HTTP (ej. flight-availability.service.ts)
│  │  │  └─ models/     # Interfaces y tipos compartidos
│  │  └─ features/      # Páginas/Componentes por feature
│  │     ├─ flight-search/
│  │     ├─ flight-results/
│  │     ├─ cheapest-dates/
│  │     └─ flight-availability/
```

Páginas y componentes relevantes
- `flight-search` — formulario con validación (IATA codes, fecha, hora).
- `flight-results` — lista de resultados paginada y ordenable.
- `cheapest-dates` — muestra fechas alternativas con precios.
- `flight-availability` — nueva pantalla que consulta `POST /flights/availability` y muestra por segmento las clases disponibles en un diseño tipo cards; incluye paginación y control de ordenamiento (frontend solo envía `sortBy` y el backend realiza la ordenación).

UX / UI
- Diseño basado en cards, con paleta principal:
	- Primario: `#4E63D9` (azul)
	- Secundario: `#4ED9A6` (verde)
	- Neutro / fondo: `#F2F2F2`
- Comportamientos implementados:
	- Paginación controlada por backend (frontend solicita `page`/`limit`).
	- Ordenamiento: frontend envía `sortBy` y backend aplica sort antes de paginar.
	- Estados: loading, empty, error con retry.
	- Formulario con validación y normalización (ej. `time` → `HH:MM:SS`).


Variables de entorno
--------------------

Backend (`backend/.env`)
- `AMADEUS_CLIENT_ID=` — cliente Amadeus
- `AMADEUS_CLIENT_SECRET=` — secret Amadeus
- `AUTH_URL_AMADEUS=` — URL de OAuth2
- `AMADEUS_API_URL=` — base URL de Amadeus
- `ENDPOINT_FLIGHT_OFFERS`, `ENDPOINT_FLIGHT_DESTINATIONS`, `ENDPOINT_FLIGHT_DATES`, `ENDPOINT_FLIGHT_AVAILABILITY`
- `API_PORT=` — puerto donde corre el backend (por defecto 3000)

Frontend (environments)
- `src/environments/environment.ts` o similar: configurar la `apiBaseUrl` (por defecto `http://localhost:3000`).

Cómo configurar
1. Copiar `backend/.env.example` → `backend/.env` y completar credenciales.
2. Verificar `frontend/src/app/core/services/flight-availability.service.ts` y actualizar `baseUrl` si es necesario.


Instalación y ejecución
----------------------

Backend

```powershell
cd backend
pnpm install
cp .env.example .env
# editar .env y agregar AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET
pnpm run start:dev
```

Frontend

```powershell
cd frontend
pnpm install
pnpm run start
```


Estructura del proyecto (tree)
-----------------------------

```
./
├─ backend/
├─ frontend/
├─ README.md
```


Flujo general de la aplicación
-----------------------------
1. El usuario en el frontend completa el formulario (origen, destino, fecha, hora) y solicita búsqueda.
2. El frontend realiza una petición al backend (`/flights` o `/flights/availability`) enviando `page`, `limit`, `sortBy` cuando aplica.
3. El backend, mediante `AmadeusService`, obtiene/renueva token OAuth2 y realiza la llamada correspondiente a Amadeus.
4. La respuesta de Amadeus se parsea por los parsers (`parseFlights`, `parseAvailability`, etc.) a tipos internos.
5. Si aplica, el backend ordena y pagina los resultados y devuelve `{ data, total, page, pageSize }`.
6. El frontend renderiza cards, controla paginación, ordenamiento y estados (loading / empty / error).
<img width="1851" height="972" alt="image" src="https://github.com/user-attachments/assets/477eec3d-463f-42cf-87c9-f7bcbdb51c34" />
<img width="1867" height="935" alt="image" src="https://github.com/user-attachments/assets/6bef3208-36d0-498f-aab4-1f16d18599bc" />
<img width="1811" height="924" alt="image" src="https://github.com/user-attachments/assets/ad909fdc-8556-4bb1-b121-419e39154050" />





Licencia
--------
Este proyecto se publica bajo la licencia MIT.

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

