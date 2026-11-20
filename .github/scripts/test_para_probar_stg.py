import unittest

from para_probar_stg import items_pendientes


class ItemsPendientes(unittest.TestCase):
    def test_titulo_con_o_sin_tilde_y_mayusculas(self):
        for titulo in ("Sólo vos", "Solo vos", "SOLO VOS", "sólo vos"):
            cuerpo = f"## {titulo}\n- [ ] uno\n- [x] hecho\n## Otro\n- [ ] no"
            self.assertEqual(items_pendientes(cuerpo.replace("\\\n", "\n")), ["- [ ] uno"], titulo)

    def test_otra_seccion_no_cuenta(self):
        self.assertEqual(items_pendientes("## Otro\n- [ ] x"), [])


if __name__ == "__main__":
    unittest.main()
