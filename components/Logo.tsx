// Logotipo de marca "afin srl" (solo wordmark, sin isotipo) recreado en vector.
// El texto usa la variable de fuente cargada en el layout (--font-nunito) para
// renderizar con la tipografía de marca incluso al inlinearse como SVG.
export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 14 186 58"
      role="img"
      aria-label="afin srl"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>afin srl</title>
      <text
        x="0"
        y="64"
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
