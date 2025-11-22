# Despliegue y Registro de Comandos

## Desarrollo
- Establecer `NODE_ENV=development` y `GUILD_ID`.
- Registro por-gremio: rápido y aislado.

## Producción
- `NODE_ENV=production`.
- Registro global: puede tardar hasta 1 hora en propagarse.

## Pasos
- Configurar `.env`.
- `npm install`.
- `npm run start`.
- Verificar logs de registro y disponibilidad de comandos.