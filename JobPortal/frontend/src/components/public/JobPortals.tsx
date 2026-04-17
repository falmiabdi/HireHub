import React from 'react'
import { jobPortalsImage } from '../../assets/images'

const JobPortals: React.FC = () => {
  return (
    <section
      style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <h2
            style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              color: '#fff',
            }}
          >
            Top Free Job Portals
          </h2>

          <div
            style={{
              display: 'flex',
              gap: '2rem',
              marginTop: '2rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3 style={{ color: '#FF6B35', fontSize: '2rem' }}>Indeed</h3>
              <p style={{ color: '#f7f7f7' }}>World's largest job site</p>
            </div>
            <div>
              <h3 style={{ color: '#00A8E8', fontSize: '2rem' }}>Glassdoor</h3>
              <p style={{ color: '#f7f7f7' }}>Jobs + Company reviews</p>
            </div>
            <div>
              <h3 style={{ color: '#4CAF50', fontSize: '2rem' }}>HireMee</h3>
              <p style={{ color: '#f7f7f7' }}>AI-powered matching</p>
            </div>
          </div>

          <div
            style={{
              marginTop: '2rem',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              placeholder="Search jobs..."
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '1rem',
                border: '2px solid #ddd',
                borderRadius: '10px',
                fontSize: '1rem',
              }}
            />
            <button
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#FF6B35',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Filter
            </button>
          </div>
        </div>

        <div>
          <img
            src={jobPortalsImage}
            alt="Job Portals"
            style={{
              width: '100%',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      </div>
    </section>
  )
}

export default JobPortals
