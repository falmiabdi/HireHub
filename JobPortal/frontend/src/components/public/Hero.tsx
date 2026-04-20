import React from 'react'
import { heroImage } from '../../assets/images'

const Hero: React.FC = () => {
  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}
      >
        <img
          src={heroImage}
          alt="HireHub Hero"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.7)',
          }}
        />
      </div>

      <div
        className="hero-content"
        style={{
          maxWidth: '800px',
          padding: '2rem',
          zIndex: 1,
        }}
      >
   <h1
  style={{
    fontSize: '3.5rem',
    marginBottom: '1rem',
    animation: 'fadeInUp 1s ease',
  }}
>
  Build the Future of Hiring:{' '}
  <span
    style={{
      color: '#4CAF50',
      padding: '2rem 3rem',
      display: 'inline-block',
    }}
  >
    Smart, Scalable 
  </span>
</h1>
        <div
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            animation: 'fadeInUp 1s ease 0.2s both',
          }}
        >
          <span style={{ color: '#FF6B35' }}>AI   HIREHUB  </span >
        </div>

        <button
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'transform 0.3s, background-color 0.3s',
            animation: 'fadeInUp 1s ease 0.4s both',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.backgroundColor = '#45a049'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.backgroundColor = '#4CAF50'
          }}
        >
          Apply Now →
        </button>
      </div>
    </section>
  )
}

export default Hero
