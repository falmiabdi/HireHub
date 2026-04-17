import React, { useEffect, useState } from 'react'
import { motivationalImages } from '../../assets/images'

interface Quote {
  id: number
  text: string
  author: string
  image: string
}

const quotes: Quote[] = [
  {
    id: 1,
    text: 'If you can dream it, you can do it.',
    author: 'Walt Disney',
    image: motivationalImages.neverGiveUp,
  },
  {
    id: 2,
    text: 'Rise above doubts to achieve success.',
    author: 'Tom Stories',
    image: motivationalImages.riseAbove,
  },
  {
    id: 3,
    text: 'Slow progress is better than no progress.',
    author: 'Anonymous',
    image: motivationalImages.stayProgress,
  },
  {
    id: 4,
    text: "Your effort today shapes tomorrow's success.",
    author: 'Motivation',
    image: motivationalImages.effortSuccess,
  },
  {
    id: 5,
    text: 'Keep thinking, keep doing, try again until success.',
    author: 'Persistence',
    image: motivationalImages.tryAgain,
  },
]

const MotivationalQuote: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote>(quotes[0])
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFadeIn(false)
      window.setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * quotes.length)
        setCurrentQuote(quotes[randomIndex])
        setFadeIn(true)
      }, 500)
    }, 8000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        height: '400px',
        overflow: 'hidden',
        borderRadius: '20px',
        margin: '2rem auto',
        maxWidth: '1200px',
      }}
    >
      <img
        src={currentQuote.image}
        alt="Motivational"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.6)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 0.5s ease',
          width: '80%',
        }}
      >
        <h2
          style={{
            fontSize: '2rem',
            marginBottom: '1rem',
            fontStyle: 'italic',
          }}
        >
          "{currentQuote.text}"
        </h2>
        <p style={{ fontSize: '1.2rem' }}>— {currentQuote.author}</p>
      </div>
    </div>
  )
}

export default MotivationalQuote
