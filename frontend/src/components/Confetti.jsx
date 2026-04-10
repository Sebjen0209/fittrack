import { useEffect, useState } from 'react'

const COLORS = ['#FF4500','#FFB800','#10D48E','#0A84FF','#FF2D55','#BF5AF2','#FF9F0A','#FFFFFF']
const SHAPES = ['circle', 'rect', 'triangle']

function ConfettiPiece({ x, color, delay, shape }) {
  const size  = 6 + Math.random() * 8
  const drift = (Math.random() - 0.5) * 300
  const rot   = Math.random() * 720

  const style = {
    position: 'fixed',
    left: x,
    top: -20,
    width: shape === 'rect' ? size * 1.8 : size,
    height: size,
    background: color,
    borderRadius: shape === 'circle' ? '50%' : shape === 'triangle' ? 0 : 2,
    clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
    zIndex: 9998,
    pointerEvents: 'none',
    animation: `confetti-fall ${1.8 + Math.random() * 1.4}s ${delay}s ease-in forwards`,
    transform: `translateX(${drift}px) rotate(${rot}deg)`,
  }
  return <div style={style} />
}

export default function Confetti({ active, count = 80 }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!active) return
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: `${Math.random() * 100}vw`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.8,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      }))
    )
    const t = setTimeout(() => setPieces([]), 4000)
    return () => clearTimeout(t)
  }, [active, count])

  return (
    <>
      {pieces.map(p => (
        <ConfettiPiece key={p.id} {...p} />
      ))}
    </>
  )
}
