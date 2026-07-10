import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Heart, Menu, Pause, Play, Search, ShoppingBag, Volume2, X } from 'lucide-react'

const records = [
  { id: 1, title: 'Nocturne for Glass', artist: 'Mara Vale', year: '2026', genre: 'Ambient / Modern Classical', price: '£32', duration: '06:42', palette: ['#9ba39e', '#d5d1c5'], art: 'orb', number: 'AS—041' },
  { id: 2, title: 'Solitude, Refracted', artist: 'Aster North', year: '2025', genre: 'Experimental Jazz', price: '£38', duration: '08:17', palette: ['#ad5a40', '#d9ad87'], art: 'split', number: 'AS—036' },
  { id: 3, title: 'A Certain Blue', artist: 'Leonie Hart', year: '2026', genre: 'Soul / Downtempo', price: '£29', duration: '04:53', palette: ['#31586b', '#b8c3bd'], art: 'type', number: 'AS—044' },
  { id: 4, title: 'Soft Architecture', artist: 'Bastien Rue', year: '2024', genre: 'Minimal / Electronic', price: '£34', duration: '07:21', palette: ['#b9b2a3', '#efe9dc'], art: 'grid', number: 'AS—019' },
  { id: 5, title: 'The Hours Between', artist: 'Onda', year: '2025', genre: 'Dream Pop', price: '£31', duration: '05:36', palette: ['#7f8174', '#d2bea0'], art: 'sun', number: 'AS—032' },
  { id: 6, title: 'Forms of Silence', artist: 'Kenji Sato', year: '2026', genre: 'Ambient / Field Recording', price: '£36', duration: '09:08', palette: ['#262722', '#aca99e'], art: 'line', number: 'AS—047' },
]

function Logo() {
  return <a href="#top" className="logo" aria-label="Atelier Sillon home"><span>ATELIER</span><i /><span>SILLON</span></a>
}

function SleeveArt({ record }) {
  return (
    <div className={`sleeve-art art-${record.art}`} style={{ '--a': record.palette[0], '--b': record.palette[1] }}>
      <span className="catalogue">{record.number}</span>
      {record.art === 'orb' && <><i className="orb" /><b>MV</b></>}
      {record.art === 'split' && <><i className="split-circle" /><b>SOLITUDE<br />REFRACTED</b></>}
      {record.art === 'type' && <><strong>CERTAIN<br />BLUE</strong><i /></>}
      {record.art === 'grid' && <><div className="arch-grid" /><b>SOFT<br />ARCHITECTURE</b></>}
      {record.art === 'sun' && <><i className="half-sun" /><b>ONDA</b></>}
      {record.art === 'line' && <><div className="contour" /><b>静寂</b></>}
      <small>{record.artist}</small>
    </div>
  )
}

function Vinyl({ record, active, onDrop, onPlay, reducedMotion }) {
  const [dragging, setDragging] = useState(false)
  return (
    <motion.div
      className={`vinyl ${active ? 'vinyl-active' : ''}`}
      drag
      dragSnapToOrigin
      dragElastic={0.08}
      dragMomentum={false}
      whileDrag={{ scale: 1.06, cursor: 'grabbing' }}
      animate={{ x: active ? '54%' : '0%', rotate: active ? 10 : 0 }}
      transition={{ type: 'spring', stiffness: 165, damping: 20 }}
      onDragStart={() => setDragging(true)}
      onDragEnd={(event, info) => { setDragging(false); onDrop(event, info, record) }}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onPlay(record) } }}
      tabIndex={0}
      role="button"
      aria-label={`Play ${record.title} by ${record.artist}`}
      style={{ zIndex: dragging ? 60 : 5 }}
    >
      <div className="vinyl-grooves" />
      <div className="vinyl-shine" />
      <motion.div className="vinyl-label" style={{ background: record.palette[0] }} animate={dragging && !reducedMotion ? { rotate: 360 } : { rotate: 0 }} transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}>
        <span>{record.artist}</span><i /><small>33⅓</small>
      </motion.div>
      <div className="drag-cue">DRAG</div>
    </motion.div>
  )
}

function RecordCard({ record, onDrop, onPlay, reducedMotion }) {
  const [hovered, setHovered] = useState(false)
  const [liked, setLiked] = useState(false)
  return (
    <motion.article
      className="record-card"
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHovered(false) }}
    >
      <div className="record-object">
        <Vinyl record={record} active={hovered} onDrop={onDrop} onPlay={onPlay} reducedMotion={reducedMotion} />
        <motion.div className="sleeve" animate={{ y: hovered ? -3 : 0 }} transition={{ duration: 0.35 }}>
          <SleeveArt record={record} />
          <div className="sleeve-sheen" />
        </motion.div>
      </div>
      <div className="record-meta">
        <div>
          <p>{record.artist}</p>
          <h3>{record.title}</h3>
        </div>
        <button className={`heart ${liked ? 'liked' : ''}`} onClick={() => setLiked(!liked)} aria-label={liked ? `Remove ${record.title} from wishlist` : `Add ${record.title} to wishlist`}>
          <Heart size={17} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="record-detail"><span>{record.year} · {record.genre}</span><strong>{record.price}</strong></div>
    </motion.article>
  )
}

function Turntable({ current, playing, setPlaying, playerRef, progress }) {
  return (
    <motion.aside ref={playerRef} className={`turntable ${current ? 'is-loaded' : ''}`} layout>
      <div className="drop-message" aria-live="polite">
        <span>{current ? 'NOW SPINNING' : 'DROP A RECORD'}</span>
        <i className={current ? 'live' : ''} />
      </div>
      <div className="deck">
        <div className="platter-wrap">
          <motion.div className="platter" animate={playing ? { rotate: 360 } : { rotate: 0 }} transition={playing ? { repeat: Infinity, duration: 3.2, ease: 'linear' } : { duration: 0.5 }}>
            <div className="platter-rings" />
            <div className="player-label" style={{ background: current?.palette[0] || '#b7b1a5' }}><span>{current?.number || 'AS'}</span></div>
          </motion.div>
          <div className="spindle" />
          <motion.div className="tonearm" animate={{ rotate: current ? 17 : -2 }} transition={{ type: 'spring', stiffness: 80, damping: 14 }}>
            <i /><b />
          </motion.div>
        </div>
        <div className="player-copy">
          <AnimatePresence mode="wait">
            <motion.div key={current?.id || 'empty'} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}>
              <small>{current ? current.artist : 'Atelier Sillon'}</small>
              <h4>{current ? current.title : 'Awaiting selection'}</h4>
            </motion.div>
          </AnimatePresence>
          <div className="transport">
            <button onClick={() => current && setPlaying(!playing)} disabled={!current} aria-label={playing ? 'Pause record' : 'Play record'}>
              {playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
            </button>
            <div className="timeline"><motion.i animate={{ width: `${progress}%` }} /><motion.b animate={{ left: `${progress}%` }} /></div>
            <span>{current ? `${Math.floor(progress / 15)}:${String(Math.floor((progress * 2.7) % 60)).padStart(2, '0')}` : '0:00'}</span>
            <Volume2 size={14} />
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

export default function App() {
  const scroller = useRef(null)
  const playerRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const [menu, setMenu] = useState(false)
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!playing || !current) return
    const timer = window.setInterval(() => {
      setProgress(value => value >= 100 ? 0 : value + 0.18)
    }, 120)
    return () => window.clearInterval(timer)
  }, [playing, current])

  const playRecord = (record) => {
    setCurrent(record)
    setPlaying(true)
    setProgress(8)
  }

  const handleDrop = (event, info, record) => {
    const rect = playerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = event.clientX ?? info.point.x - window.scrollX
    const y = event.clientY ?? info.point.y - window.scrollY
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) playRecord(record)
  }

  const scroll = (direction) => scroller.current?.scrollBy({ left: direction * 390, behavior: reducedMotion ? 'auto' : 'smooth' })

  return (
    <div id="top" className="site-shell">
      <div className="grain" />
      <header>
        <Logo />
        <nav aria-label="Primary navigation">
          <a href="#new">New arrivals</a><a href="#editions">Editions</a><a href="#journal">Journal</a>
        </nav>
        <div className="header-tools">
          <button aria-label="Search"><Search size={18} strokeWidth={1.5} /></button>
          <button aria-label="Shopping bag" className="bag"><ShoppingBag size={18} strokeWidth={1.5} /><span>2</span></button>
          <button className="menu-button" onClick={() => setMenu(true)} aria-label="Open menu"><Menu size={20} /></button>
        </div>
      </header>

      <AnimatePresence>{menu && <motion.div className="mobile-menu" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 220 }}><button onClick={() => setMenu(false)} aria-label="Close menu"><X /></button><Logo /><a href="#new" onClick={() => setMenu(false)}>New arrivals</a><a href="#editions" onClick={() => setMenu(false)}>Editions</a><a href="#journal" onClick={() => setMenu(false)}>Journal</a></motion.div>}</AnimatePresence>

      <main>
        <section className="hero" id="new">
          <div className="hero-index"><span>01</span><i /><small>CURATED THIS WEEK</small></div>
          <motion.div className="hero-title" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}>
            <motion.p variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>Independent music, pressed with purpose</motion.p>
            <motion.h1 variants={{ hidden: { opacity: 0, y: 35 }, show: { opacity: 1, y: 0 } }}>Records of<br /><em>consequence.</em></motion.h1>
          </motion.div>
          <motion.div className="hero-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
            <span>LISTEN BEFORE YOU OWN</span>
            <p>Hover a sleeve. Take hold of the record.<br />Drop it on the player to begin.</p>
          </motion.div>
        </section>

        <section className="collection" id="editions">
          <div className="collection-head">
            <div><span>THE LATEST PRESSINGS</span><h2>New in the listening room</h2></div>
            <div className="arrows"><button onClick={() => scroll(-1)} aria-label="Previous records"><ArrowLeft /></button><button onClick={() => scroll(1)} aria-label="Next records"><ArrowRight /></button></div>
          </div>
          <div className="record-scroller" ref={scroller}>
            {records.map(record => <RecordCard key={record.id} record={record} onDrop={handleDrop} onPlay={playRecord} reducedMotion={reducedMotion} />)}
            <article className="view-all"><span>06 / 24</span><h3>Discover the full<br /><em>collection</em></h3><button>Browse all records <ArrowRight size={16} /></button></article>
          </div>
        </section>

        <section className="manifesto" id="journal">
          <span>OUR PRACTICE</span>
          <p>Music is not content.<br />It is an <em>object of attention.</em></p>
          <small>Limited pressings · Considered editions · Worldwide delivery</small>
        </section>
      </main>

      <Turntable current={current} playing={playing} setPlaying={setPlaying} playerRef={playerRef} progress={progress} />
      <div className="sr-only" aria-live="polite">{current ? `Now playing ${current.title} by ${current.artist}` : ''}</div>
    </div>
  )
}
