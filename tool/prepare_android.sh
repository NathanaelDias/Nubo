#!/usr/bin/env bash
# Genera la carpeta android/ (si no existe) y la deja lista para Nubo.
# Se ejecuta en Codemagic antes de compilar; también sirve en un ordenador con Flutter.
set -euo pipefail

if [ ! -d android ]; then
  flutter create --platforms=android --org com.nubo --project-name nubo .
  rm -f test/widget_test.dart
fi

M=android/app/src/main/AndroidManifest.xml

# Permisos: el servidor local usa la red interna del móvil; vibración para los juegos.
if ! grep -q 'android.permission.INTERNET' "$M"; then
  perl -0pi -e 's/<application/<uses-permission android:name="android.permission.INTERNET"\/>\n    <uses-permission android:name="android.permission.VIBRATE"\/>\n    <application/' "$M"
fi
# Permitir http://localhost (los juegos se sirven desde dentro del móvil).
if ! grep -q 'usesCleartextTraffic' "$M"; then
  perl -0pi -e 's/<application/<application android:usesCleartextTraffic="true"/' "$M"
fi
# Nombre visible y orientación vertical.
perl -pi -e 's/android:label="[^"]*"/android:label="Nubo"/' "$M"
if ! grep -q 'screenOrientation' "$M"; then
  perl -0pi -e 's/<activity/<activity android:screenOrientation="portrait"/' "$M"
fi

echo "Android listo:"
grep -E 'permission|usesCleartextTraffic|android:label|screenOrientation' "$M" || true
