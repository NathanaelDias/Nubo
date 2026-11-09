# Nubo · app de Android (Flutter)

Contenedor nativo de Flutter que lleva dentro la plataforma Nubo y sus juegos (`assets/www`).
Los juegos se sirven desde un servidor local dentro del móvil, así que **funcionan sin conexión**.
Las fuentes (Lilita One, Nunito) se cargan de Google Fonts si hay internet; si no, se usan las del sistema.

## Estructura

- `lib/main.dart` — la app nativa: pantalla completa, botón «atrás», vibración y el puente para los eventos (Firebase más adelante).
- `assets/www/` — la plataforma (`index.html`), `kit.js` y los 19 juegos.
- `assets/icon/` — icono de la app (la nube de Nubo).
- `tool/prepare_android.sh` — genera y configura la carpeta `android/` (permisos, nombre, orientación).
- `codemagic.yaml` — compila el APK en la nube y lo envía por correo.

## Probar en el móvil

1. Sube esta carpeta a un repositorio privado de GitHub (`NathanaelDias/nubo`).
2. En Codemagic: añade el repositorio. Detecta `codemagic.yaml` y, con cada cambio en `main`, compila el APK.
3. Te llega un correo con el enlace al APK. Ábrelo en el móvil, permite «Instalar apps de origen desconocido» y listo.
   Las siguientes versiones se instalan encima sin perder el progreso.

## Siguientes pasos

- Firebase: Analytics (eventos `game_start` y `level_complete`, ya preparados), Remote Config (juegos en descanso) y Auth.
- Anuncios (AdMob) y compras (RevenueCat: sin anuncios, pase de temporada, monedas).
- Flujo de Codemagic para Google Play con la clave de firma propia y `.aab`.
- Incluir las fuentes dentro de la app para que se vean igual sin conexión.
