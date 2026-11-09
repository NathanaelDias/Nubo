#!/usr/bin/env bash
# Arreglo para Android Gradle Plugin 9: algunos plugins antiguos (p. ej.
# flutter_inappwebview_android 1.1.3) usan 'proguard-android.txt', que AGP 9
# ya no acepta. Se cambia por 'proguard-android-optimize.txt' en la caché.
# Se ejecuta después de 'flutter pub get'.
set -euo pipefail
CACHE="${PUB_CACHE:-$HOME/.pub-cache}/hosted/pub.dev"
n=0
while IFS= read -r f; do
  if grep -q "proguard-android.txt" "$f"; then
    perl -pi -e 's/proguard-android\.txt/proguard-android-optimize.txt/g' "$f"
    echo "Arreglado: $f"; n=$((n+1))
  fi
done < <(find "$CACHE" -path '*/android/build.gradle*' -type f 2>/dev/null)
echo "Plugins arreglados: $n"

# Compatibilidad con plugins que aún no usan el nuevo DSL de AGP 9.
P=android/gradle.properties
if [ -f "$P" ] && ! grep -q 'android.newDsl' "$P"; then
  echo 'android.newDsl=false' >> "$P"
  echo "Añadido android.newDsl=false"
fi
