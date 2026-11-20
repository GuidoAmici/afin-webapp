#!/usr/bin/env bash
# Aplica la config de auth de supabase/config.toml a UN proyecto remoto (ADR-0007).
#
# Uso: scripts/auth-config-push.sh <stg|prod>
#
# `supabase config push` aplica el archivo ENTERO y resuelve env() desde el entorno:
# con una variable vacía, site_url queda como el literal "env(...)" en el proyecto.
# Este guard carga los valores de Doppler (afin-webapp / <config>), corta si falta
# alguno y recién entonces hace el push. El push es un paso manual con la
# confirmación de Guido: nada lo corre en CI.
set -euo pipefail

env_name="${1:-}"
case "$env_name" in
  stg)  ref="wbsvxdquzvsawmjoiwat" ;;
  prod) ref="myzngskhjnrmnonrksmj" ;;
  *) echo "uso: $0 <stg|prod>" >&2; exit 2 ;;
esac

# Ruta absoluta antes del cd: el re-exec dentro de doppler no depende del cwd.
script="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
cd "$(dirname "$script")/.."

# Corre dentro de `doppler run`, donde las variables ya están en el entorno.
if [ "${AUTH_CONFIG_PUSH_INNER:-}" != "1" ]; then
  exec env AUTH_CONFIG_PUSH_INNER=1 AUTH_CONFIG_PUSH_REF="$ref" \
    doppler run -p afin-webapp -c "$env_name" -- "$script" "$env_name"
fi

# Adentro, el ref sale otra vez del argumento (arriba), no del entorno: un
# AUTH_CONFIG_PUSH_REF heredado o seteado a mano con INNER=1 no puede mandar la
# config de un entorno al proyecto del otro.
if [ "${AUTH_CONFIG_PUSH_REF:-}" != "$ref" ]; then
  echo "AUTH_CONFIG_PUSH_REF (${AUTH_CONFIG_PUSH_REF:-vacío}) no es el proyecto de $env_name ($ref): no se pushea" >&2
  exit 1
fi

missing=0
for v in SUPABASE_AUTH_SITE_URL SUPABASE_AUTH_ADDITIONAL_REDIRECT_URLS SUPABASE_AUTH_ENABLE_SIGNUP; do
  if [ -z "${!v:-}" ]; then
    echo "falta $v en Doppler afin-webapp/$env_name: no se pushea" >&2
    missing=1
  fi
done
[ "$missing" -eq 0 ] || exit 1

# Un valor que todavía contiene env( es un literal sin resolver: no se pushea.
for v in SUPABASE_AUTH_SITE_URL SUPABASE_AUTH_ADDITIONAL_REDIRECT_URLS SUPABASE_AUTH_ENABLE_SIGNUP; do
  case "${!v}" in
    *"env("*) echo "$v contiene env( en Doppler afin-webapp/$env_name: no se pushea" >&2; exit 1 ;;
  esac
done

case "$SUPABASE_AUTH_ENABLE_SIGNUP" in
  true|false) ;;
  *) echo "SUPABASE_AUTH_ENABLE_SIGNUP debe ser true o false" >&2; exit 1 ;;
esac

if [ -z "${AFIN_SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "falta AFIN_SUPABASE_ACCESS_TOKEN en Doppler afin-webapp/$env_name" >&2
  exit 1
fi
export SUPABASE_ACCESS_TOKEN="$AFIN_SUPABASE_ACCESS_TOKEN"

echo "Pusheando la config de auth a $env_name ($ref); el CLI muestra el diff y pide confirmación."
# Sin --yes a propósito: el CLI muestra su propio diff y la persona confirma a mano.
exec supabase config push --project-ref "$ref"
