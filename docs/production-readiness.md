# T1GER — entrega técnica y publicación

Fecha de revisión: 2026-09-02. Rama de colaboración: `main`.

## Estado real

**Candidato de desarrollo/beta; NO aprobado todavía para producción pública.**
La compilación y los emuladores no sustituyen una prueba contra los servicios
desplegados y un teléfono real. No se ha publicado en Google Play.

- Firestore de `t1ger-69d6a`: reglas e índices de seguridad desplegados durante esta revisión.
- Cloud Functions y Storage: implementación y pruebas locales; despliegue bloqueado por el plan Spark.
- Mentor y verificación: Gemini del lado servidor, nunca claves privadas dentro del APK.
- Compras: desactivadas en producción. No existe todavía una integración de cobros verificados con Play Billing.
- Firma: no se encontró `android/key.properties`; no se generó ni reemplazó una clave de subida sin saber si ya existe una registrada.
- OneSignal: faltan las credenciales de configuración/despliegue.
- Hosting público no se ha actualizado en esta revisión.

## Cambios entregados

1. Catálogo canónico compartido de las 15 misiones de campo: el cliente ya no puede cambiar el criterio que audita la IA.
2. Recompensas transaccionales e idempotentes en servidor; separación entre reflexión autodeclarada y artefacto revisado por IA. Solo este último aporta XP a ligas/retos. Una imagen revisada por IA NO equivale a verificación independiente de una operación real.
3. Inmutabilidad de las imágenes aprobadas, almacenamiento privado y recuperación de artefactos entre dispositivos. Las URLs con token son enlaces de acceso: solo deben compartirse explícitamente con el Squad.
4. Bloqueo de XP, monedas, roles, Pro y resultados manipulados desde el cliente. Nuevas cuentas empiezan a cero; premio único de onboarding: 100 XP + 50 monedas.
5. Escrow de retos, puntuación basada en entregas canónicas, liquidación recalculada, reacciones idempotentes y límites de nudges/IA.
6. Borrado de cuenta y datos de Firebase mediante función autenticada; ruta web `/delete-account`. Una confirmación de éxito exige que el backend termine.
7. Dev Harness fuera del bundle de producción, HTTP solo en Android debug, firma obligatoria para release, fuentes locales y carga diferida del 3D.
8. Vite y TypeScript ya no recorren los bundles generados de Android/iOS como código fuente. Se evitan errores de dependencias y trabajo innecesario.
9. Screen Time Android recorta eventos de primer plano a la ventana de 24 horas. Se detiene al apagar pantalla; es una estimación y puede diferir de fabricantes, multiventana o historiales incompletos.
10. CI actualizado a Node 22/JDK 21: tipos, progresión, currículo, coste de oportunidad, seguridad/backend emulados, navegación móvil y pruebas nativas.
11. Racha y rescate local requieren ejecución, no solo quiz; racha visible autenticada deriva del servidor y caduca según la zona horaria de la cuenta, con pruebas de medianoche/cambio de horario.
12. Parche reproducible de OneSignal 5.5.2: no reescribir el manifiesto Android cuando no hay cambios. Evita una carrera con lectores de archivos de Windows. `postinstall` comprueba el código esperado; revisar el parche al actualizar OneSignal.

## Comandos reproducibles

Evidencia de esta revisión:

- TypeScript de app y funciones: sin errores.
- Regresiones de progresión, currículo (3 árboles/15 lecciones), social y coste de oportunidad: correctas.
- Firestore/Storage y funciones en emuladores: correctas, incluida concurrencia de pruebas y limpieza del upload duplicado. Una repetición tuvo timeout de arranque de Java bajo carga; la ejecución posterior separada pasó.
- Navegación móvil Learn → Apply → Compete → Profile → Learn: sin errores de JavaScript ni contenido residual. Dos pasadas locales midieron entre 199 y 1144 ms; no es un benchmark de teléfono real.
- Android: cuatro pruebas de cálculo de uso y la prueba base existentes, cero fallos. APK debug compilado.
- Preflight de secretos/panel dev: correcto. AAB sin firma: rechazado como se esperaba.
- `npm audit --omit=dev` en raíz y funciones: cero vulnerabilidades reportadas al revisar. Auditoría completa: siete avisos moderados de dependencias de tooling.
- Políticas públicas y `/delete-account`: cargan sin obligar a completar onboarding. El borrado real queda pendiente del despliegue del backend.

```bash
npm ci
npm --prefix functions ci
npm run test:all
npm run build:production
npm run release:check
npm run dev:web
# En otra terminal, con localhost activo:
npm run test:shell
# Android, con SDK + JDK 21:
npm run android:build
# Solo después de configurar la clave de subida existente:
npm run android:bundle
```

`test:rules` usa exclusivamente `demo-t1ger` en emuladores de Auth, Firestore y
Storage. La respuesta de Gemini se simula: demuestra la lógica del backend,
no la calidad real del modelo ni sus credenciales. Cubre solicitudes concurrentes,
doble premio, rechazo por baja confianza, escrow y eliminación.

`release:check` comprueba patrones de secretos, exclusión de claves locales de IA,
ausencia del panel de desarrollo y configuración de red. No certifica que no exista
ningún secreto imaginable, ni sustituye la revisión legal o la aceptación móvil.

APK: `android/app/build/outputs/apk/debug/app-debug.apk`.
AAB firmado: `android/app/build/outputs/bundle/release/app-release.aab`.
Los dos son salidas ignoradas por Git; CI los adjunta como artifacts.

## Desbloqueos que necesita el propietario

### 1. Activar Firebase Blaze y presupuesto

Abrir [uso y facturación de T1GER](https://console.firebase.google.com/project/t1ger-69d6a/usage/details).
Activar Blaze con la cuenta de facturación elegida y configurar alertas de presupuesto.
No se hizo automáticamente: supone una decisión de gasto. Las alertas no son un límite duro.
Referencia: [planes de Firebase](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

Después, habilitar Storage en la región elegida y confirmar que el bucket coincide
con `firebase-applet-config.json`. Configurar `GEMINI_API_KEY` en Secret Manager;
OneSignal usa `ONESIGNAL_APP_ID` y `ONESIGNAL_REST_API_KEY`. No pegar claves en
GitHub, mensajes de chat ni variables `VITE_` de producción.

```bash
npx firebase functions:secrets:set GEMINI_API_KEY --project t1ger-69d6a
npx firebase deploy --only firestore,storage --project t1ger-69d6a
npx firebase deploy --only functions:verifyFieldMissionProof,functions:claimOnboardingReward,functions:askT1gerMentor,functions:deleteMyAccount,functions:acceptDirectChallenge,functions:interactWithSquadActivity,functions:queueSquadNudge,functions:countVerifiedChallengeMission,functions:settleExpiredChallenges --project t1ger-69d6a
# Una vez configurado OneSignal/FCM:
npx firebase functions:secrets:set ONESIGNAL_APP_ID --project t1ger-69d6a
npx firebase functions:secrets:set ONESIGNAL_REST_API_KEY --project t1ger-69d6a
npx firebase deploy --only functions:dispatchSquadNudge --project t1ger-69d6a
```

Configurar también el ID público de OneSignal usado por el cliente. Los endpoints
de IA tienen cuotas por cuenta y maxInstances; activar App Check con proveedores
de producción requiere configurar las aplicaciones antes de exigirlo en servidor.

### 2. Confirmar la identidad de firma y OAuth

Indicar si ya se subió un AAB de `com.dddavet.tiger` a Play. Si existe, usar la clave
de subida registrada; no generar otra arbitrariamente. Si nunca se subió, generar
la clave y guardar una copia segura fuera del repositorio.

Registrar las huellas SHA de debug, upload y Play App Signing donde corresponda.
El login Google actual es web redirect/popup; debe sustituirse o validarse mediante
un flujo nativo compatible antes de prometer Google Sign-In en Android WebView.
Mientras tanto, el flujo de correo/contraseña requiere tener ese proveedor activo.
Publicar `assetlinks.json` de `t1ger.app` solo con el certificado real de Play.

### 3. Alcance y Estado de las Tareas Técnicas Resueltas

- **Cobros y Stripe**: Conectado el enlace real de Early Adopter / Fundador (`https://buy.stripe.com/fZueVeaebe5T5pvdpQaZi01`) con `client_reference_id`, `prefilled_email`, función en servidor `verifyStripeAccess` y feedback de confirmación.
- **Moderación UGC (Google Play Compliance)**: Implementado sistema completo de denuncia (`/reports`) con motivos estructurados (contenido inapropiado, acoso, spam, etc.) y bloqueo de usuarios (`/users/{uid}/blockedUsers/{blockedId}`) en `firestore.rules`, `socialService.ts` y `SquadTab.tsx`, filtrando en tiempo real las publicaciones, retos y ligas.
- **Ligas Semanales**: Cohortes de 30 miembros delimitadas con división estricta de Zona de Ascenso (Top 5) y Zona de Descenso (Puestos 26–30), con protección en Liga Bronce (sin descenso) y separadores visuales claros.
- **Seguridad OAuth Android**: Flujo de Google/Apple Sign-In protegido en WebView de Capacitor para evitar `disallowed_useragent: 403`, guiando a los usuarios de la app nativa al acceso por correo y contraseña.

### 4. Datos legales y Play Console

Confirmar responsable legal real, email de soporte, conservación de datos,
condiciones de Gemini/OneSignal y derechos/licencias de recursos. Las páginas
legales se identifican como beta y no inventan una sociedad ni certifican GDPR.
Completar Data Safety, clasificación de contenido, ficha, capturas y acceso para
revisores con datos reales. Verificar también la eliminación en proveedores de push,
retención de logs y copias de seguridad; la cascada actual cubre Firebase de la app.

[Requisito vigente de API objetivo](https://support.google.com/googleplay/android-developer/answer/11926878):
el proyecto apunta a API 36. Para cuentas personales nuevas sujetas al requisito,
Google exige [12 testers inscritos durante 14 días continuos](https://support.google.com/googleplay/android-developer/answer/14151465)
antes de solicitar acceso a producción. No se puede reemplazar con tests automáticos.

## Aceptación pendiente después del despliegue

- Cuenta nueva real → onboarding → lección → evidencia rechazada/aprobada → misma recompensa tras reintento.
- Segundo dispositivo: progreso, vitrina de artefactos y XP recuperados del servidor.
- Dos cuentas reales: solicitud, aceptación, reacción, reto, saldo, notificación y cancelación.
- Android físico: permiso de uso denegado/otorgado, cámara, selector de fotos, proceso restaurado, teclado, botón Atrás, red lenta/sin red y rotación.
- Gemini real: corpus de pruebas correctas/incorrectas y ataques de prompt; ajustar criterio sin tratar una captura como confirmación bancaria.
- Borrado reciente, reautenticación y verificación de ausencia de datos en todos los proveedores.
- Revisar/migrar cuentas de prueba anteriores: endurecer reglas no elimina automáticamente XP o roles históricos que antes podían modificarse desde cliente.

## Antigravity y Git

Usar `main` como punto común. Antes de editar, ejecutar `git status` y
`git pull --ff-only`; no pisar cambios sin commit de otra herramienta. No usar force
push ni introducir claves de `.env.local`. El catálogo compartido vive en
`functions/src/fieldMissionCatalog.ts`: no duplicar criterios en el cliente.
Una modificación de reglas/catálogo/recompensas debe pasar `npm run test:all`.
Una publicación web requiere primero desplegar un backend compatible: no subir
un frontend que llame funciones inexistentes y llamarlo producción.

Hay avisos moderados de herramientas de desarrollo transitivas (Firebase CLI y
Xcode parser de Capacitor). No se forzó una actualización mayor incompatible para
ocultarlos. Las auditorías de dependencias de producción se comprueban aparte.
