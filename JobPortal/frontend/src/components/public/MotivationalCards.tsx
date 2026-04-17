import React from 'react'
import {
  neverGiveUpImage,
  riseAboveImage,
  stayProgressImage,
  effortSuccessImage,
  tryAgainImage,
  motivationImage,
} from '../../assets/images'

interface MotivationalCard {
  id: number
  image: string
  title: string
  quote: string
  color: string
}

const motivationalCards: MotivationalCard[] = [
  {
    id: 1,
    image: neverGiveUpImage,
    title: 'Never Give Up',
    quote: 'If you can dream it, you can do it.',
    color: '#FF6B35',
  },
  {
    id: 2,
    image: riseAboveImage,
    title: 'Rise Above Doubts',
    quote: 'Rise above doubts to achieve success.',
    color: '#4A90E2',
  },
  {
    id: 3,
    image: stayProgressImage,
    title: 'Stay Progressive',
    quote: "Slow progress is better than no progress. Stay positive and don't give up.",
    color: '#50C878',
  },
  {
    id: 4,
    image: effortSuccessImage,
    title: 'Effort Shapes Success',
    quote: "Your effort today shapes tomorrow's success.",
    color: '#9B59B6',
  },
  {
    id: 5,
    image: tryAgainImage,
    title: 'Try Again',
    quote: 'Keep thinking, keep doing, try again until success.',
    color: '#E74C3C',
  },
  {
    id: 6,
    image: motivationImage,
    title: "Let's Go!",
    quote: 'Start your journey today!',
    color: '#3498DB',
  },
]

const MotivationalCards: React.FC = () => {
  return (
    <section
      style={{
        padding: '4rem 2rem',
        backgroundColor: '#f8f9fa',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '3rem',
          color: '#333',
        }}
      >
        Stay Motivated on Your Journey
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {motivationalCards.map((card) => (
          <div
            key={card.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'
            }}
          >
            <div
              style={{
                height: '250px',
                overflow: 'hidden',
              }}
            >
              <img
                src={card.image}
                alt={card.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              />
            </div>
            <div
              style={{
                padding: '1.5rem',
              }}
            >
              <h3
                style={{
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  color: card.color,
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: '#666',
                }}
              >
                {card.quote}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default MotivationalCards
