# Investing journey / Apply — auditoría y entrega

Fecha: 2026-09-05. Base: `c2bc582`, respaldada en `codex/backup-before-investing-journey-20260904` antes de modificarla.

## Decisión de producto

La especificación más reciente sustituye el requisito anterior de subir pruebas: aprender lleva a una acción práctica autodeclarada con reflexión opcional. Esa acción aporta XP personal, racha y recuperación de la mascota, pero **no** XP de ligas. El lanzamiento muestra solo Investing; se mantienen los otros currículos y artefactos anteriores para compatibilidad.

## Auditoría de los cinco sistemas

| Sistema | Estado y límites |
| --- | --- |
| Identidad | Auth/perfiles existentes. Se corrigió acceso Pro ficticio; compras deshabilitadas hasta validación de servidor. OAuth nativo y proveedor de correo requieren aceptación en dispositivo/servicio real. |
| Contenido | Cinco lecciones Investing conectadas en tres secciones: fundamentos, estrategia y riesgo. Otros currículos conservados pero fuera del camino de lanzamiento. No es una biblioteca exhaustiva. |
| Progreso | Camino ordenado y revisión FSRS; quiz solo no desbloquea. Transacciones personales idempotentes y distinción de XP competitivo. FSRS sigue en el estado de aprendizaje del cliente, no es un sistema de integridad académica autoritativo. |
| Acción | Instrucciones, motivo, criterio de finalización, reflexión opcional, recompensa e historial conectados. Se preservan pruebas verificadas anteriores. El simulador local no verifica operaciones reales ni da XP competitivo. |
| Engagement | Mascota, racha y estructuras sociales existentes. No se ha certificado push real ni salas semanales cerradas y ascensos/descensos completos. |

Pantallas revisadas: Learn, Apply/Build, reproductor, onboarding/acceso y paywall; navegación y tamaños de Compete/Profile comprobados. Mentor, ajustes y sistemas nativos no tienen una aceptación exhaustiva de todos sus estados en esta entrega. Este informe no afirma haber certificado cada archivo o servicio de la aplicación.

## Problemas corregidos

- Catálogo multitópico sin camino de lanzamiento claro: ahora hay cinco nodos secuenciales, estados completado/actual/repaso/bloqueado y landmarks localizados.
- Quiz sin ejecución y puntuación siempre perfecta: el resultado registra errores; Apply es necesario y los repasos pendientes restauran la preparación del prerrequisito.
- Doble premio entre métodos o reintentos: un mismo evento canónico de recompensa, transacción y preservación del registro anterior.
- Fricción de prueba obligatoria: acciones de campo con pasos concretos y botón de finalización, sin obligar a escribir ni subir imágenes.
- Simulación presentada como mercado vivo y XP verificado: corregidos los textos y eliminado el premio competitivo ficticio.
- `verifyStripeAccess` concedía privilegios sin comprobar pagos: falla de forma cerrada. RevenueCat no inventa compras ni entitlements; acceso gratuito honesto mientras falta el backend de cobros.
- Exportación local podía incluir claves de otras cuentas: ahora usa una lista explícita del usuario actual. Artefactos del reproductor separados por usuario.
- Navegación de rescate podía abrir una misión ajena al camino: lleva a Learn. Se corrigió la posibilidad de retroceder y saltar un desafío sin responder.

Diseño: jerarquía única de próximo paso, historial de victorias separado de tareas activas, modales nativos con foco/Escape, botones táctiles, carga diferida de 3D y simulador, y respeto por movimiento reducido. El criterio de ingeniería fue implementar en incrementos y exigir regresiones, no usar compilación como prueba de producto terminado.

## Evidencia reproducible

- `npm run test:all`: tipos, economía/progreso, currículo, social, cálculo de oportunidad, reglas y funciones en emuladores aprobados.
- `npm run test:journey`: orden, prerequisitos, FSRS vencido, repaso, aislamiento de exportación y seguridad de pagos aprobados; repetido después del último cambio de privacidad.
- `npm run test:apply`: cinco lecciones completas en navegador aislado, Apply sin reflexión, cinco acciones persistidas tras recargar, 1060 XP personales incluyendo los 100 iniciales de la fixture y cero XP verificado; sin errores de página.
- `npm run test:shell`: navegación de pestañas y ausencia de desbordamiento horizontal a 320, 390, 768 y 1440 px.
- `npm run build:production` y `npm run release:check`: aprobados después del último cambio de código. El preflight no certifica cumplimiento legal ni servicios desplegados.
- `npm run android:build -- --skip-web`: sincronización de los assets de producción, cinco pruebas unitarias sin fallos y APK debug generado correctamente. Compilación Gradle de 6 min 47 s; no es una medida de arranque de la app. Persisten avisos de flatDir, carga múltiple del plugin Kotlin, deprecaciones Gradle y tablas de pila de la dependencia Amazon incluida en compras. No se ocultaron ni se verificó su efecto en un dispositivo físico.
- `npm audit --omit=dev` en app y funciones: cero vulnerabilidades reportadas en esta revisión; no garantiza ausencia de vulnerabilidades desconocidas.

La navegación local medida varió aproximadamente entre 274 y 2132 ms bajo carga de desarrollo. No representa latencia de producción ni de Android físico. El bundle principal es 293 KB (97 KB gzip); Firebase y Three.js permanecen en chunks separados grandes. No se promete rendimiento de 60 FPS sin medir un dispositivo real.

## Despliegue y aceptación pendientes

1. Verificar el proyecto Firebase y la autorización de facturación. El bloqueo Spark consta en la revisión anterior; no se volvió a comprobar aquí. No se ha cambiado facturación.
2. Desplegar reglas y backend compatible, incluyendo `completeApplyMission` y el cierre de `verifyStripeAccess`, antes del frontend. Las pruebas usaron emuladores, no modificaron cuentas reales.
3. Auditar privilegios históricos concedidos por el endpoint de pagos anterior. Implementar eventos de cobro/entitlements autenticados e idempotentes antes de reactivar checkout.
4. Aceptación con cuenta real y segundo dispositivo: onboarding, Apply, reintentos, desconexión, recuperación de historial, racha y separación de XP.
5. Android físico: permisos, Atrás, restauración de proceso, teclado, push, red lenta y rendimiento 3D. Firma/Play Console, textos legales y pruebas exigidas por la cuenta dependen del propietario.
6. Integración real de paper trading y motor completo de ligas son trabajo futuro, no capacidades verificadas de esta entrega.

No se publicó en Play ni se desplegó Hosting/Functions en esta entrega. Una copia del frontend anterior no es un rollback seguro del backend: conservar el cierre de pagos y la protección de registros `completed`.

## Continuidad con Antigravity

Trabajar desde `main`, hacer `git status` y `git pull --ff-only` antes de editar y conservar cambios ajenos. Ejecutar `test:all`, `test:apply`, `build:production` y `release:check` antes de publicar cambios de este bucle. El catálogo canónico del servidor sigue en `functions/src/fieldMissionCatalog.ts`; no confiar en premios enviados por el cliente.
