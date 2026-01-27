# Patient Flow Optimizer

Aplicación web para gestionar el flujo de pacientes, disponibilidad y turnos en una interfaz clara y rápida.

## Requisitos

- Node.js 18+
- npm

## Inicio rápido

```sh
# Instalar dependencias
npm i

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa del build
npm run preview
```

## Supabase (base de datos)

1. Crea un proyecto en Supabase.
2. En el SQL Editor, ejecuta el archivo `supabase/schema.sql`.
3. Crea un archivo `.env` en la raíz con:

```
VITE_SUPABASE_URL=TU_URL
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

## Accesos

- Admin inicial: `admin@subell.com / subel123`
- El admin crea usuarios y asigna color.

## Tecnologías

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
