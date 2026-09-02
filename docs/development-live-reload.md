# T1GER Fast Development Loop

Esta guía cubre el flujo diario de diseño y pruebas sin abrir el emulador de
Android Studio.

## 1. Navegador con Hot Reload

Ejecuta:

```bash
npm run dev:web
```

El comando abre automáticamente:

```text
http://127.0.0.1:3000/?previewApp=1&view=learn
```

En Chrome o Brave, usa `Ctrl+Shift+M` dentro de DevTools para seleccionar un
viewport de iPhone, Pixel u otro dispositivo. La app ya limita su superficie al
ancho móvil, por lo que también puede probarse sin abrir DevTools.

Vite mantiene un WebSocket con el navegador. Guardar un archivo React, CSS o de
contenido actualiza la interfaz sin reconstruir Android.

### Datos nativos simulados

En desarrollo Web, Screen Time arranca automáticamente con un día saludable de
30 minutos. La simulación usa las mismas seis apps y el mismo motor matemático
que Android. Las notificaciones de prueba se guardan en el Notification Center
local y no se envían a usuarios reales.

El botón flotante `DEV` permite alternar:

- `30 min`: T1GER dentro del presupuesto de distracción.
- `5 horas`: T1GER crítico y apertura inmediata de la confrontación.
- `Racha activa` o `Medianoche`: estado seguro o alerta de pérdida.
- `Free` o `Pro`: paywall y permisos de producto sin cambiar Firebase.
- Una notificación local de coste de oportunidad.

Los overrides viven únicamente en `localStorage` de desarrollo. No escriben
planes, rachas ni vitales simuladas en Firestore. Para ocultar el panel durante
una captura, añade `&devHarness=0` a la URL.

## 2. Emulador Android estable con un comando

En este equipo ya está creado `T1GER_API_36`, basado en Android 16 / API 36 y
Google Play. No hace falta abrir Android Studio para el flujo diario:

```bash
npm run dev:android:emulator
```

El lanzador abre el emulador, espera hasta que Android termine de arrancar,
inicia Vite, instala T1GER y abre la app con live reload. También selecciona
automáticamente el JDK 21 compatible con Gradle; no usa el JDK 25 incluido en
la instalación actual de Android Studio.

Para usar otro dispositivo virtual ya instalado:

```bash
npm run dev:android:emulator -- --avd=NOMBRE_DEL_AVD
```

## 3. Teléfono Android por USB

### Preparación única

1. Activa **Developer options → USB debugging** en Android.
2. Conecta el teléfono por USB y acepta la huella RSA.
3. Instala Android SDK Platform-Tools. El lanzador detecta automáticamente la
   instalación estándar en `%LOCALAPPDATA%\Android\Sdk`.

### Comando diario

```bash
npm run dev:android
```

El lanzador realiza todo el flujo:

1. Detecta un teléfono físico autorizado.
2. Ejecuta `adb reverse tcp:3000 tcp:3000`.
3. Inicia Vite en `0.0.0.0:3000` con HMR.
4. Sincroniza, instala y abre el contenedor Capacitor una vez.
5. Mantiene Vite activo; los siguientes cambios llegan al WebView sin recompilar.

Detén el proceso con `Ctrl+C`. El script retira automáticamente el port
forwarding.

Si hay varios teléfonos conectados:

```bash
npm run dev:android -- --target=DEVICE_ID
```

Consulta los identificadores con el `adb devices` incluido en Android SDK
Platform-Tools.

## 4. Teléfono Android por Wi-Fi

Primero empareja el teléfono una sola vez usando **Android Studio → Pair Devices
Using Wi-Fi** o `adb pair`. Cuando el dispositivo ya aparezca en `adb devices`,
ejecuta:

```bash
npm run dev:android:wifi
```

El lanzador selecciona automáticamente la primera IPv4 de la red local. Si el
equipo tiene VPN, Ethernet y Wi-Fi simultáneamente, especifica la dirección:

```bash
npm run dev:android:wifi -- --host=192.168.1.42
```

El computador y el teléfono deben estar en la misma red y Windows Firewall debe
permitir conexiones privadas a Node/Vite en el puerto `3000`.

## Comportamiento Web vs. Android

| Superficie | Screen Time predeterminado | Notificaciones | HMR |
|---|---|---|---|
| Navegador | Simulación de 30 min | Notification Center local | Sí |
| Android USB/Wi-Fi | `UsageStatsManager` real | OneSignal/WebView + pruebas locales | Sí |
| Build de producción | Datos reales o fallback manual | Configuración real | No panel DEV |

En un teléfono real, selecciona `Auto` en el harness para volver al bridge
nativo. Android requiere que el usuario conceda **Usage access**; si no existe
el permiso, T1GER conserva el fallback manual y nunca bloquea la navegación.

## Solución rápida de problemas

### El puerto 3000 ya está ocupado

Detén el proceso anterior con `Ctrl+C`. Los scripts usan `--strictPort` para no
mover silenciosamente la app a otro puerto y romper el WebView.

### El teléfono aparece como `unauthorized`

Desconecta el cable, revoca autorizaciones USB en Developer options, vuelve a
conectar y acepta la huella RSA.

### La app abre pero no actualiza

- USB: confirma que `adb reverse --list` contiene `tcp:3000`.
- Wi-Fi: abre `http://IP_DEL_PC:3000` en el navegador del teléfono.
- Revisa que una VPN o el firewall no bloquee HTTP/WebSocket en el puerto 3000.

### Necesito regenerar el contenedor nativo

Los cambios en Java, Kotlin, el manifiesto o plugins sí requieren una
recompilación:

```bash
npm run android:sync
npm run android:build
```

El live reload está diseñado para React, TypeScript, estilos, animaciones,
contenido y lógica Web. No puede recargar bytecode nativo ya instalado.
