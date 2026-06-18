// Logotipo de marca "afin srl" recreado en vector (isotipo de 4 pétalos en
// molinete, SIN la estrella central) + wordmark en Nunito 900. El texto usa la
// variable de fuente cargada en el layout (--font-nunito) para renderizar con la
// tipografía de marca incluso al inlinearse como SVG.
const PETAL = 'M2,5 C-20,2 -30,-20 -19,-36 C-12,-47 10,-48 18,-35 C25,-23 17,-2 2,5 Z'

export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 340 100"
      role="img"
      aria-label="afin srl"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>afin srl</title>
      <g transform="translate(48,50)">
        <path d={PETAL} fill="#FCCC9C" transform="rotate(0)" />
        <path d={PETAL} fill="#FCE4CC" transform="rotate(90)" />
        <path d={PETAL} fill="#FC7800" transform="rotate(180)" />
        <path d={PETAL} fill="#FCB46C" transform="rotate(270)" />
      </g>
      <text
        x="108"
        y="68"
        fontSize="56"
        fontWeight="900"
        style={{ fontFamily: 'var(--font-nunito), Nunito, sans-serif' }}
      >
        <tspan fill="#FD8204">afin</tspan>
        <tspan dx="8" fill="#6D6E71">srl</tspan>
      </text>
    </svg>
  )
}
