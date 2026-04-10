import { useEffect, useRef } from 'react'

const NORMAL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>?/\\|{}[]'
const BEAST_CHARS  = '💪🔥⚡🏋️💥🎯🧠🩸⚔️🔱💯🦾🚀🌊🔥GAINZ'

export default function MatrixRain({ beastMode }) {
  const canvasRef = useRef(null)
  const beastRef  = useRef(beastMode)

  useEffect(() => { beastRef.current = beastMode }, [beastMode])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const fontSize = 14
    let columns = Math.floor(canvas.width / fontSize)
    let drops   = Array.from({ length: columns }, () => Math.random() * -100)

    let frameId
    const draw = () => {
      const beast  = beastRef.current
      const chars  = beast ? BEAST_CHARS : NORMAL_CHARS
      const speed  = beast ? 1.6 : 1.0
      const alpha  = beast ? 0.07 : 0.05

      ctx.fillStyle = `rgba(5,5,8,${alpha})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // recalculate columns on resize
      columns = Math.floor(canvas.width / fontSize)
      while (drops.length < columns) drops.push(Math.random() * -50)
      if (drops.length > columns) drops.length = columns

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)]
        // Leading char is brighter
        const isBright = y * fontSize > 0 && drops[i] > drops[i] - 1
        const alpha2 = isBright ? 1 : Math.random() * 0.5 + 0.15

        if (beast) {
          ctx.fillStyle = `hsla(${(i * 7 + Date.now() * 0.05) % 360}, 100%, 65%, ${alpha2})`
        } else {
          ctx.fillStyle = `rgba(0,255,136,${alpha2})`
        }

        ctx.font = `${fontSize}px monospace`
        ctx.fillText(char, i * fontSize, y * fontSize)

        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i] += speed
      })

      frameId = requestAnimationFrame(draw)
    }

    frameId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.22,
        pointerEvents: 'none',
      }}
    />
  )
}
