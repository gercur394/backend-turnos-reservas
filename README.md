# Backend Turnos y Reservas

Administrador de servicios para un sistema de turnos y reservas, construido con Node.js (ESM). Incluye una clase `ServiceManager` que gestiona los servicios guardándolos en un archivo JSON.

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

## Variables de entorno

| Variable   | Descripción                              | Ejemplo       |
|------------|------------------------------------------|---------------|
| `PORT`     | Puerto de la aplicación                  | `8080`        |
| `NODE_ENV` | Entorno de ejecución                     | `development` |

Si falta alguna, la aplicación no inicia y muestra un mensaje indicando cuáles faltan.

## Recurso `services`

Cada servicio tiene la siguiente forma:

| Campo         | Tipo    | Descripción                               |
|---------------|---------|-------------------------------------------|
| `id`          | number  | Identificador, generado automáticamente   |
| `name`        | string  | Nombre del servicio                       |
| `description` | string  | Descripción del servicio                  |
| `duration`    | number  | Duración en minutos                       |
| `price`       | number  | Precio                                    |
| `category`    | string  | Categoría                                 |
| `available`   | boolean | Si el servicio está disponible            |

Los datos se guardan en `src/data/services.json`.

## Uso de `ServiceManager`

```js
import ServiceManager from './managers/ServiceManager.js';

const manager = new ServiceManager();

// Obtener todos los servicios
await manager.getServices();

// Obtener un servicio por id (devuelve null si no existe)
await manager.getServiceById(2);

// Agregar un servicio (el id se genera solo; lanza un error si faltan campos)
await manager.addService({
  name: 'Barba',
  description: 'Perfilado y recorte de barba',
  duration: 20,
  price: 5000,
  category: 'Peluquería',
  available: true,
});

// Actualizar un servicio (el id no se puede modificar; devuelve null si no existe)
await manager.updateService(2, { price: 27000 });

// Eliminar un servicio (devuelve el servicio eliminado, o null si no existe)
await manager.deleteService(2);
```