import { useState, useEffect, useRef } from 'react'

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?<>[]{}|/\\'

function randomChar() {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)]
}

/**
 * GlitchText
 * Props:
 *   text      — the text to display
 *   as        — element tag (default 'span')
 *   scramble  — enable scramble effect on hover/random intervals (default true)
 *   style     — extra styles
 *   className — extra classnames
 */
export default function GlitchText({ text, as: Tag = 'span', scramble = true, style, className }) {
  const [display, setDisplay] = useState(text)
  const intervalRef = useRef(null)

  const doScramble = () => {
    let iter = 0
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' '
            if (i < iter) return text[i]
            return randomChar()
          })
          .join('')
      )
      iter += 0.5
      if (iter >= text.length) {
        clearInterval(intervalRef.current)
        setDisplay(text)
      }
    }, 40)
  }

  // Random scramble on interval
  useEffect(() => {
    if (!scramble) return
    const t = setInterval(() => {
      if (Math.random() > 0.7) doScramble()
    }, 3000 + Math.random() * 4000)
    return () => clearInterval(t)
  }, [text, scramble])

  // Update display when text prop changes
  useEffect(() => { setDisplay(text) }, [text])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  return (
    <Tag
      className={`glitch ${className || ''}`}
      style={{
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.1em',
        cursor: scramble ? 'default' : undefined,
        ...style,
      }}
      onMouseEnter={scramble ? doScramble : undefined}
    >
      {display}
    </Tag>
  )
}
