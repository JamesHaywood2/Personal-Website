import { useEffect, useRef, useState } from 'react'
import './App.css'

const useDotsBackground = (canvasRef) => {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // ============================================
    // SHOOTING STAR CONFIGURATION - EDIT HERE!
    // ============================================
    const STAR_CONFIG = {
      spawnRateMs: 1500,        // Time between spawn attempts (milliseconds)
      spawnChance: 0.5,         // Probability to spawn (0-1)
      trailLength: 150,         // Length of the star tail (pixels)
      lineWidth: 8,             // Thickness of the trail line (pixels)
      coreRadius: 8,            // Size of the bright core (pixels)
      lifespan: 2,              // How long star lasts (seconds)
      minSpeed: 10,             // Minimum speed
      maxSpeed: 15,             // Maximum speed
      // Color options (RGB arrays) - randomly selected per star
      trailStartColors: [
        [100, 200, 255],  // Cyan
        [255, 200, 100],  // Orange
        [200, 100, 255],  // Purple
      ],
      trailEndColors: [
        [100, 200, 255],  // Cyan
        [255, 200, 100],  // Orange
        [200, 100, 255],  // Purple
      ],
      coreColors: [
        [150, 220, 255],  // Light cyan
        [255, 220, 150],  // Light orange
        [220, 150, 255],  // Light purple
      ],
    }
    // ============================================

    // ============================================
    // DOTS CONFIGURATION - EDIT HERE!
    // ============================================
    const DOTS_CONFIG = {
      count: 500,               // Number of dots
      minSpeed: 0.05,            // Minimum movement speed
      maxSpeed: 0.2,            // Maximum movement speed
      minRadius: 1,             // Minimum dot size (pixels)
      maxRadius: 2.5,           // Maximum dot size (pixels)
      colors: ['white', '#fffdc5', 'lightblue']  // Dot color options (randomly selected per dot)
    }
    // =============================================

    // Function to create dots - called on init and on resize
    const createDots = () => {
      return Array.from({ length: DOTS_CONFIG.count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (DOTS_CONFIG.maxSpeed - DOTS_CONFIG.minSpeed) + DOTS_CONFIG.minSpeed - (DOTS_CONFIG.maxSpeed - DOTS_CONFIG.minSpeed) / 2,
        vy: (Math.random() - 0.5) * (DOTS_CONFIG.maxSpeed - DOTS_CONFIG.minSpeed) + DOTS_CONFIG.minSpeed - (DOTS_CONFIG.maxSpeed - DOTS_CONFIG.minSpeed) / 2,
        radius: Math.random() * (DOTS_CONFIG.maxRadius - DOTS_CONFIG.minRadius) + DOTS_CONFIG.minRadius,
        color: DOTS_CONFIG.colors[Math.floor(Math.random() * DOTS_CONFIG.colors.length)],
      }))
    }

    let dots = createDots()

    // Shooting stars array
    let shootingStars = []
    let lastStarTime = Date.now()

    // Function to create a shooting star
    const createShootingStar = () => {
      const startX = Math.random() * canvas.width
      const startY = Math.random() * (canvas.height * 0.5) // Appear in top half
      const angle = (Math.random() * 0.5 + 0.3) * Math.PI // 54-90 degrees down
      const speed = Math.random() * (STAR_CONFIG.maxSpeed - STAR_CONFIG.minSpeed) + STAR_CONFIG.minSpeed

      return {
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        trailLength: STAR_CONFIG.trailLength,
        trailStartColor: STAR_CONFIG.trailStartColors[Math.floor(Math.random() * STAR_CONFIG.trailStartColors.length)],
        trailEndColor: STAR_CONFIG.trailEndColors[Math.floor(Math.random() * STAR_CONFIG.trailEndColors.length)],
        coreColor: STAR_CONFIG.coreColors[Math.floor(Math.random() * STAR_CONFIG.coreColors.length)],
      }
    }

    // Animation loop
    const animate = () => {
      // Clear canvas with semi-transparent background for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Spawn new shooting star occasionally
      const now = Date.now()
      if (now - lastStarTime > STAR_CONFIG.spawnRateMs && Math.random() < STAR_CONFIG.spawnChance) {
        shootingStars.push(createShootingStar())
        lastStarTime = now
      }

      // Update and draw shooting stars
      shootingStars = shootingStars.filter((star) => {
        star.x += star.vx
        star.y += star.vy
        star.life -= 1 / (STAR_CONFIG.lifespan * 60) // Decrement based on 60 FPS

        // Draw shooting star with trail
        const gradient = ctx.createLinearGradient(
          star.x - star.vx * 5,
          star.y - star.vy * 5,
          star.x,
          star.y
        )
        gradient.addColorStop(0, `rgba(${star.trailStartColor[0]}, ${star.trailStartColor[1]}, ${star.trailStartColor[2]}, 0)`)
        gradient.addColorStop(1, `rgba(${star.trailEndColor[0]}, ${star.trailEndColor[1]}, ${star.trailEndColor[2]}, ${star.life})`)

        ctx.strokeStyle = gradient
        ctx.lineWidth = STAR_CONFIG.lineWidth
        ctx.beginPath()
        ctx.moveTo(star.x - star.vx * star.trailLength, star.y - star.vy * star.trailLength)
        ctx.lineTo(star.x, star.y)
        ctx.stroke()

        // Draw bright core
        ctx.fillStyle = `rgba(${star.coreColor[0]}, ${star.coreColor[1]}, ${star.coreColor[2]}, ${star.life})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, STAR_CONFIG.coreRadius, 0, Math.PI * 2)
        ctx.fill()

        return star.life > 0 && star.x < canvas.width && star.y < canvas.height
      })

      // Update and draw dots
      dots.forEach((dot) => {
        // Update position
        dot.x += dot.vx
        dot.y += dot.vy

        // Bounce off walls
        if (dot.x - dot.radius < 0 || dot.x + dot.radius > canvas.width) {
          dot.vx *= -1
          dot.x = Math.max(dot.radius, Math.min(canvas.width - dot.radius, dot.x))
        }
        if (dot.y - dot.radius < 0 || dot.y + dot.radius > canvas.height) {
          dot.vy *= -1
          dot.y = Math.max(dot.radius, Math.min(canvas.height - dot.radius, dot.y))
        }

        // Draw dot
        ctx.fillStyle = dot.color
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      dots = createDots()
      shootingStars = []
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [canvasRef])
}

const useOrientation = () => {
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return isPortrait
}

function NavMenu({ onSelectSection, onClose }) {
  return (
    <div className="Nav-Menu">
      <button className="nav-close-btn" onClick={onClose}>×</button>
      <h1>James Haywood</h1>
      <button onClick={() => onSelectSection('about')}>About Me</button>
      <button onClick={() => onSelectSection('contact')}>Contact Me</button>
      <button onClick={() => onSelectSection('projects')}>Projects</button>
    </div>
  )
}

function InfoSection({ onClose, activeSection }) {
  const renderContent = () => {
    switch(activeSection) {
      case 'about':
        return <AboutMe />
      case 'contact':
        return <ContactMe />
      case 'projects':
        return <Projects />
      default:
        return null
    }
  }

  return (
    <div className="Info-Section">
      <button className="close-btn" onClick={onClose}>×</button>
      {renderContent()}
    </div>
  )
}

function AboutMe() {
  return (
    <div className="About-Me">
      <h1>About Me</h1>
    </div>
  )
}

function ContactMe() {
  return (
    <div className="Contact-Me">
      <h1>Contact Me</h1>
    </div>
  )
}

function Projects() {
  return (
    <div className="Projects">
      <h1>Projects</h1>
    </div>
  )
}

function App() {
  const canvasRef = useRef(null)
  const [showInfo, setShowInfo] = useState(false)
  const [activeSection, setActiveSection] = useState(null)
  const [showNavMenu, setShowNavMenu] = useState(true)
  const isPortrait = useOrientation()
  useDotsBackground(canvasRef)

  const handleSelectSection = (section) => {
    setActiveSection(section)
    setShowInfo(true)
  }

  const handleCloseInfo = () => {
    setShowInfo(false)
  }

  return (
    <div className="app-container">
      <canvas ref={canvasRef} className="background-canvas" />

      <div className="content">
        <div className="Header">
          <div className="name-section">
          <h1>IDK maybe a clock?</h1>
          </div>
          
          <div className="nav-section">
            <h1>TEMP EVENTUALLY LOGO BUTTONS HERE</h1>
          </div>

        </div>

        <div className="main-content">
          {/* Menu toggle button - only show when menu is hidden */}
          {!showNavMenu && (
            <button className="nav-menu-btn" onClick={() => setShowNavMenu(true)}>⋯</button>
          )}
          
          {/* Landscape: Show both. Portrait: Show only NavMenu if not viewing info */}
          {showNavMenu && (!isPortrait || !showInfo) && <NavMenu onSelectSection={handleSelectSection} onClose={() => setShowNavMenu(false)} />}
          
          {/* Show InfoSection if open, and auto-close it in portrait mode when user closes it */}
          {showInfo && (
            <InfoSection 
              onClose={() => {
                setShowInfo(false)
              }} 
              activeSection={activeSection} 
            />
          )}
        </div>
      </div>
        

    </div>

  )
}


export default App
