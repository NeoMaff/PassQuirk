# Errores y Observabilidad

## Manejo de Errores
- Capturar excepciones en `execute` de comandos y responder ephemeral.
- En eventos, envolver handlers en try/catch.

## Logs
- Nivel de logs configurable (`LOG_LEVEL`).
- Log de carga de comandos y errores de registro.
- Reporte de emojis inválidos y diálogos mal formateados.

## Alertas
- Errores de JSON de diálogos deben indicar archivo y posición para corrección.