import { useEffect, useRef, useState } from 'react'
import './App.css'
import profileImage from './assets/James_Haywood.jpg'
import uahLogo from './assets/UAH_White.png'

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

function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')
  const timezone = time.toLocaleString('en-US', { timeZoneName: 'short' }).split(' ').pop()

  return (
    <div className="Clock">
      <div className="time-display">
        {hours}:{minutes}:{seconds}  {timezone}
      </div>
    </div>
  )
}

function NavMenu({ onSelectSection, onClose }) {
  return (
    <div className="Nav-Menu">
      <button className="close-btn" onClick={onClose}>×</button>
      <div className="nav-menu-content">
        <h1>James Haywood</h1>
        <button onClick={() => onSelectSection('about')}>About Me</button>
        <button onClick={() => onSelectSection('contact')}>Contact Me</button>
        <button onClick={() => onSelectSection('projects')}>Projects</button>
      </div>
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
      
      <div className="about-bio-section">
        <div className="about-images-container">
          <img src={profileImage} alt="James Haywood" className="profile-photo" />
          <img src={uahLogo} alt="UAH Logo" className="uah-logo" />
        </div>

        <p>
          Hello, my name is James Haywood and I am an aspiring software developer with a passion for learning new technologies and creating solutions to real problems.
          I graduated from University of Alabama in Huntsville in 2024 with a bachelor's degree in Computer Science (data science concentration), minors in Mathematics and entertainment computing, and a 3.71 GPA.
        </p>
        <p>During my time at UAH, I gained experience in various programming languages and technologies, including Java, Python, C++, SQL, etc. I am currently seeking to expand my skillset into networking
          and cloud computing, and am actively pursuing certifications in these areas. I believe that I am a quick learner and a hard worker, and I am excited to apply my skills and knowledge to real-world projects and challenges.
        </p>

        <p>Please read my resume <a href="/James_Haywood_Resume.pdf" target="_blank" rel="noopener noreferrer">here</a> and consider reaching out if you are interested in working with me.</p>

      </div>
    </div>
  )
}

function ContactMe() {
  return (
    <div className="Contact-Me">
      <h1>Contact Me</h1>
      <h1>Phone: (205)-873-9327</h1>
      <h1>Email: Haywoodjames2@gmail.com</h1>
      <h1>LinkedIn: <a href="https://www.linkedin.com/in/james-haywood-305763263/" target="_blank" rel="noopener noreferrer">View Profile</a></h1>
      <h1>GitHub: <a href="https://github.com/JamesHaywood2" target="_blank" rel="noopener noreferrer">View Profile</a></h1>
      <h1>Resume: <a href="/James_Haywood_Resume.pdf" target="_blank" rel="noopener noreferrer">View Resume</a></h1>
      <h1>Feel free to reach out to me with any questions!</h1>
    </div>
  )
}

function SocialLinks() {
  return (
    <div className="social-links">
      <a href="https://github.com/JamesHaywood2" target="_blank" rel="noopener noreferrer" className="social-button github" title="GitHub">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
      <a href="https://www.linkedin.com/in/james-haywood-305763263/" target="_blank" rel="noopener noreferrer" className="social-button linkedin" title="LinkedIn">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
        </svg>
      </a>
      <a href="mailto:Haywoodjames2@gmail.com" className="social-button email" title="Email">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      </a>
    </div>
  )
}

function Projects() {
  return (
    <div className="Projects">
      <h1>Projects</h1>
      <h1>WIP</h1>
      <h1>GitHub: <a href="https://github.com/JamesHaywood2?tab=repositories" target="_blank" rel="noopener noreferrer">View Github Repository</a></h1>
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
          <Clock />
          </div>
          
          <div className="nav-section">
            <SocialLinks />
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
