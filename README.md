# Backend Turnos y Reservas

**Pre-entrega 5:** refactor de la API con arquitectura en capas (routers, controllers, services, repositories y DAO), sin cambios en los endpoints.

La API está organizada en capas, cada una con una responsabilidad distinta: los **routers** definen los endpoints, los **controllers** manejan la petición y la respuesta, los **services** contienen las reglas de negocio, los **repositories** ofrecen el acceso a los datos y los **DAO** leen y escriben los archivos JSON.

## Instalación

1. Clonar el repositorio
2. Instalar las dependencias:

```bash
npm install
```

3. Crear un archivo `.env` en la raíz a partir de `.env.example` y completar los valores (ver sección siguiente).

## Ejecución

```bash
npm start
```

Para desarrollo, con reinicio automático al guardar cambios:

```bash
npm run dev
```

El servidor queda disponible en `http://localhost:8080` (o en el puerto configurado en `.env`).

## Variables de entorno

| Variable   | Descripción              | Ejemplo       |
|------------|--------------------------|---------------|
| `PORT`     | Puerto del servidor      | `8080`        |
| `NODE_ENV` | Entorno de ejecución     | `development` |

Si falta alguna, la aplicación no inicia y muestra un mensaje indicando cuáles faltan.

## Estructura del proyecto

```

src/
  config/env.config.js                  # Lectura y validación de variables de entorno
  routes/services.router.js             # Endpoints de /api/services
  routes/bookings.router.js             # Endpoints de /api/bookings
  controllers/services.controller.js    # Controllers de services
  controllers/bookings.controller.js    # Controllers de bookings
  services/services.service.js          # Reglas de negocio de services
  services/bookings.service.js          # Reglas de negocio de bookings
  repositories/services.repository.js   # Acceso a datos de services
  repositories/bookings.repository.js   # Acceso a datos de bookings
  dao/services.dao.js                   # Lectura/escritura de services.json
  dao/bookings.dao.js                   # Lectura/escritura de bookings.json
  data/services.json                    # Persistencia de servicios
  data/bookings.json                    # Persistencia de reservas
  app.js                                # Configuración de Express
  server.js                             # Arranque del servidor

```

## Arquitectura en capas

Cada petición recorre las capas en este orden:

```
router → controller → service → repository → DAO → archivo JSON
```

| Capa       | Responsabilidad                                                                 | Lo que NO hace                       |
|------------|---------------------------------------------------------------------------------|--------------------------------------|
| Router     | Define los endpoints y los conecta con su controller                            | No contiene lógica                   |
| Controller | Lee `req.params`, `req.query` y `req.body`, llama al service y responde con `res.status().json()` | No contiene reglas de negocio |
| Service    | Contiene las reglas de negocio (validaciones, valores por defecto, filtros)     | No conoce `req`/`res` ni accede a archivos |
| Repository | Ofrece métodos de acceso a datos (`getAll`, `getById`, `create`, `update`, `delete`) | No contiene reglas de negocio   |
| DAO        | Lee y escribe directamente en el archivo JSON                                   | No contiene reglas de negocio        |

### Ejemplo: agregar un servicio a una reserva

`POST /api/bookings/:bid/services/:sid`

1. El **router** deriva el pedido a `addServiceToBooking` del controller.
2. El **controller** lee `bid` y `sid` de `req.params` y llama al service.
3. El **service** comprueba que existan la reserva y el servicio, y aplica la regla de negocio: si el servicio ya estaba en la reserva, incrementa su `quantity`; si no, lo agrega con cantidad 1.
4. El **repository** recibe el pedido de guardar la reserva actualizada y se lo pasa al DAO.
5. El **DAO** escribe el resultado en `bookings.json`.

### Manejo de resultados y errores

Los services no conocen HTTP: avisan lo que pasó y el controller lo traduce a un código de estado.

- Si algo no existe, el service devuelve `null` (o lanza un error con el código `NOT_FOUND`) y el controller responde `404`.
- Si el pedido es inválido (por ejemplo, faltan campos), el service lanza un error y el controller responde `400`.

### Por qué esta organización

Separar el acceso a los datos (repository y DAO) de las reglas de negocio (service) permite cambiar la forma de persistencia, por ejemplo pasar de archivos JSON a una base de datos, modificando solo el DAO, sin tocar las capas superiores.


### Endpoints de services

| Método | Ruta                 | Descripción                                          | Respuestas |
|--------|----------------------|------------------------------------------------------|------------|
| GET    | `/api/services`      | Lista los servicios (filtros opcionales)             | 200        |
| GET    | `/api/services/:sid` | Devuelve un servicio por id                          | 200, 404   |
| POST   | `/api/services`      | Crea un servicio con los datos del body              | 201, 400   |
| PUT    | `/api/services/:sid` | Actualiza un servicio (el id no se puede modificar)  | 200, 404   |
| DELETE | `/api/services/:sid` | Elimina un servicio                                  | 200, 404   |

Filtros de `GET /api/services`:

- `category`: por categoría (no distingue mayúsculas). Ejemplo: `/api/services?category=spa`
- `available`: por disponibilidad. Ejemplo: `/api/services?available=true`

## Recurso `bookings`

| Campo         | Tipo   | Descripción                                                              |
|---------------|--------|--------------------------------------------------------------------------|
| `id`          | number | Identificador, generado automáticamente                                  |
| `clientName`  | string | Nombre del cliente                                                       |
| `clientEmail` | string | Email del cliente                                                        |
| `date`        | string | Fecha de la reserva                                                      |
| `time`        | string | Hora de la reserva                                                       |
| `status`      | string | Estado de la reserva (por defecto `pending`)                             |
| `services`    | array  | Servicios de la reserva, con la forma `{ "service": id, "quantity": n }` |

### Endpoints de bookings

| Método | Ruta                                  | Descripción                                    | Respuestas |
|--------|---------------------------------------|------------------------------------------------|------------|
| POST   | `/api/bookings`                       | Crea una reserva con `services` vacío          | 201, 400   |
| GET    | `/api/bookings/:bid`                  | Devuelve una reserva por id                    | 200, 404   |
| POST   | `/api/bookings/:bid/services/:sid`    | Agrega un servicio a una reserva existente     | 200, 404   |

Detalles:

- Al crear una reserva, `id` y `services` se generan internamente: si se envían en el body, se ignoran. Si no se envía `status`, queda como `pending`.
- Al agregar un servicio, se valida que existan tanto la reserva como el servicio. Si el servicio ya estaba en la reserva, no se duplica: se incrementa su `quantity`.

### Ejemplo de body para `POST /api/bookings`

```json
{
  "clientName": "Ana Pérez",
  "clientEmail": "ana@mail.com",
  "date": "2026-11-20",
  "time": "15:30"
}
```

### Ejemplo de body para `POST /api/services`

```json
{
  "name": "Barba",
  "description": "Perfilado y recorte de barba",
  "duration": 20,
  "price": 5000,
  "category": "Peluquería",
  "available": true
}
```

## Pruebas

El archivo `pruebas.http` contiene pedidos de ejemplo para probar todos los endpoints. Se puede usar con la extensión REST Client de VS Code.