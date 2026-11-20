#!/usr/bin/env python3
"""Pasa los ítems pendientes de «Sólo vos» de un PR mergeado a stg al issue
fijado «Para probar en stg» (convención en AGENTS.md).

Entrada: el número de PR en PR_NUMBER y el repo en GITHUB_REPOSITORY; lee el
PR y el issue con `gh`. El cuerpo del PR es texto de terceros: nunca se pasa
por el shell, sólo por archivos y argumentos.
"""
import json
import os
import re
import subprocess
import sys
import tempfile
from datetime import date

STG = "https://stg.afinsrl.com.ar"
TITULO_SECCION = re.compile(r"s[óo]lo vos", re.IGNORECASE)
PREVIEW = re.compile(r"https://afin-[a-z0-9-]+\.vercel\.app")
ETIQUETA = "para-probar-stg"
TITULO = "Para probar en stg"
CABECERA = (
    "Lista viva de lo que espera tu prueba en stg. La alimenta el workflow "
    "`para-probar-stg.yml` con los ítems de **Sólo vos** de cada PR mergeado.\n\n"
    f"Todo se prueba en **{STG}**. Cada PR mergeado agrega un comentario con sus ítems: tildá lo que te cierra; lo que no, respondelo acá.\n"
)


def gh(*args: str) -> str:
    return subprocess.run(["gh", *args], check=True, capture_output=True, text=True).stdout


def items_pendientes(cuerpo: str) -> list[str]:
    """Los `- [ ]` de la sección cuyo título contiene «Sólo vos» (con o sin tilde, sin distinguir mayúsculas), hasta el próximo título."""
    items, dentro = [], False
    for linea in cuerpo.splitlines():
        if re.match(r"^#{1,6}\s", linea):
            dentro = bool(TITULO_SECCION.search(linea))
            continue
        if dentro and re.match(r"^\s*- \[ \]", linea):
            items.append(PREVIEW.sub(STG, linea.strip()))
    return items


def main() -> int:
    repo, numero = os.environ["GITHUB_REPOSITORY"], os.environ["PR_NUMBER"]
    pr = json.loads(gh("pr", "view", numero, "-R", repo, "--json", "title,body,url"))
    items = items_pendientes(pr["body"] or "")
    if not items:
        print(f"#{numero}: sin ítems pendientes en «Sólo vos».")
        return 0

    marca = f"<!-- para-probar-stg:#{numero} -->"
    bloque = (f"{marca}\n### [#{numero}]({pr['url']}) {pr['title']} · {date.today():%d/%m}\n"
              + "\n".join(items) + "\n")

    abiertos = json.loads(gh("issue", "list", "-R", repo, "--label", ETIQUETA, "--state", "open",
                             "--json", "number", "--limit", "1"))
    if abiertos:
        issue = str(abiertos[0]["number"])
    else:
        gh("label", "create", ETIQUETA, "-R", repo, "--color", "FBCA04",
           "--description", "Lista viva de lo que el operador prueba en stg", "--force")
        with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False) as f:
            f.write(CABECERA)
        url = gh("issue", "create", "-R", repo, "--title", TITULO, "--label", ETIQUETA,
                 "--body-file", f.name).strip()
        issue = url.rsplit("/", 1)[-1]

    # Un comentario por PR, nunca una reescritura del cuerpo: así no se pisa lo
    # que el operador tilda o edita mientras tanto, y las casillas de un
    # comentario también se tildan. La marca evita duplicar si el workflow
    # vuelve a correr (re-run, o un PR mergeado que se reabre y se cierra).
    comentarios = gh("issue", "view", issue, "-R", repo, "--json", "comments",
                     "--jq", ".comments[].body")
    if marca in comentarios:
        print(f"#{numero}: ya estaba en el issue #{issue}.")
        return 0
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False) as f:
        f.write(bloque)
    gh("issue", "comment", issue, "-R", repo, "--body-file", f.name)
    print(f"#{numero}: {len(items)} ítem(s) agregados al issue #{issue}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
