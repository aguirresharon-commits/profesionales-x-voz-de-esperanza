import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import './App.css'
import {
  createService,
  deleteService,
  fetchServiceById,
  fetchServices,
  getRecentServices,
  updateService,
} from './api/services.js'
import { createReview, deleteReview, fetchReviews } from './api/reviews.js'
import { createUser, getUser, updateUser } from './api/users.js'
import {
  buildWhatsAppUrl,
  isValidPhoneDigits,
  normalizeDigits,
} from './lib/whatsapp.js'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth, firebaseInitError } from './firebase.js'

const DEFAULT_WA_MESSAGE = 'Hola, te contacto desde Voz de Esperanza.'
const LOGO_SRC = '/assets/logo-paloma.png'
const HERO_IMAGE_SRC = '/assets/hero-atardecer.png'

function IconHeartPulse({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 19 11c0 5.65-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 11v4M10 13h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconBrain({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.5 4a3.5 3.5 0 0 0-3.4 2.6A3.5 3.5 0 0 0 3 10v1a4 4 0 0 0 3.2 3.9c.3 2.3 2.3 4.1 4.8 4.1s4.5-1.8 4.8-4.1A4 4 0 0 0 21 11v-1a3.5 3.5 0 0 0-3.1-3.4A3.5 3.5 0 0 0 14.5 4c-1.2 0-2.3.6-3 1.5A3.45 3.45 0 0 0 9.5 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconWrench({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.36 6.36a2 2 0 0 1-2.83-2.83l6.36-6.36a6 6 0 0 1 7.94-7.94l-3.76 3.77Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconScissors({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Mangos */}
      <circle cx="6" cy="7" r="2.7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="17" r="2.7" stroke="currentColor" strokeWidth="1.5" />
      {/* Eje */}
      <circle cx="10.2" cy="12" r="0.7" fill="currentColor" opacity="0.65" />
      {/* Hojas */}
      <path
        d="M21 5.2 11.1 11.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 18.8 11.1 12.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Conexión mangos → eje */}
      <path
        d="M7.9 8.4 9.8 11.1M7.9 15.6 9.8 12.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconBook({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 7h8M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconHands({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 11V9a2 2 0 0 1 2-2h.5a2 2 0 0 1 2 2v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M17 11V8a2 2 0 0 0-2-2h-.5a2 2 0 0 0-2 2v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 12c-2 2-4 3.5-4 5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2c0-1.5-2-3-4-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSearch({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconBriefcase({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="3"
        y="7"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconHouse({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-7H10v7H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPencil({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const CATEGORY_CARDS = [
  {
    key: 'salud',
    title: 'Salud',
    description: 'Profesionales del área médica y de bienestar.',
    query: 'Salud',
    Icon: IconHeartPulse,
  },
  {
    key: 'salud-mental',
    title: 'Salud Mental',
    description: 'Psicólogos y terapeutas para acompañarte.',
    query: 'Salud Mental',
    Icon: IconBrain,
  },
  {
    key: 'oficios',
    title: 'Oficios',
    description: 'Servicios de reparación, construcción y más.',
    query: 'Oficios',
    Icon: IconWrench,
  },
  {
    key: 'belleza',
    title: 'Belleza',
    description: 'Profesionales de estética y cuidado personal.',
    query: 'Belleza',
    Icon: IconScissors,
  },
  {
    key: 'educacion',
    title: 'Educación',
    description: 'Clases, tutorías y apoyo escolar y profesional.',
    query: 'Educación',
    Icon: IconBook,
  },
  {
    key: 'apoyo-familiar',
    title: 'Apoyo Familiar',
    description: 'Servicios y orientación para toda la familia.',
    query: 'Apoyo Familiar',
    Icon: IconHands,
  },
]

function useLogoWithoutBlackBackground(src) {
  const [processedSrc, setProcessedSrc] = useState(src)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.decoding = 'async'
        img.src = src
        await img.decode()

        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return

        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Transparencia para fondo negro del PNG, manteniendo el trazo azul.
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          if (r <= 12 && g <= 12 && b <= 12) data[i + 3] = 0
        }

        ctx.putImageData(imageData, 0, 0)
        const url = canvas.toDataURL('image/png')
        if (!cancelled) setProcessedSrc(url)
      } catch {
        if (!cancelled) setProcessedSrc(src)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [src])

  return processedSrc
}

function AlertBox({
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  secondaryTo,
}) {
  return (
    <div className="alert surface" role="alert">
      <div className="alertTitle">{title}</div>
      {description ? <div className="alertDesc">{description}</div> : null}
      <div className="alertActions">
        {actionLabel && onAction ? (
          <button className="pill" type="button" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
        {secondaryLabel && secondaryTo ? (
          <Link className="pill" to={secondaryTo}>
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  )
}

function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(() => onClose?.(), 2400)
    return () => window.clearTimeout(t)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className="toastWrap" role="status" aria-live="polite">
      <div className="toast surface">{message}</div>
    </div>
  )
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape' && !busy) onCancel?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel, busy])

  if (!open) return null

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard surface">
        <div className="modalTitle">{title}</div>
        {description ? <div className="modalDesc">{description}</div> : null}
        <div className="modalActions">
          <button
            className="pill"
            type="button"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            className={`pill pillPrimary${destructive ? ' pillDanger' : ''}`}
            type="button"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <span className="spinner" aria-hidden="true" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="svcCard surface">
      <div className="svcImg skeleton" />
      <div className="svcBody">
        <div className="svcRow">
          <div className="svcBadge skeleton" style={{ width: 90 }} />
        </div>
        <div className="svcName skeleton" style={{ width: '60%' }} />
        <div className="svcDesc skeleton" />
        <div className="svcDesc skeleton" style={{ width: '92%' }} />
        <div className="svcMeta skeleton" style={{ width: 140 }} />
        <div className="svcActions">
          <div className="pill skeleton" style={{ width: 110, height: 28 }} />
          <div className="pill skeleton" style={{ width: 170, height: 28 }} />
        </div>
      </div>
    </div>
  )
}

function ServiceCard({ service, showDetailLink = true, showWhatsApp = true }) {
  const phoneDigits = normalizeDigits(service.telefono)
  const canWhatsApp = isValidPhoneDigits(service.telefono)
  const waUrl = canWhatsApp
    ? buildWhatsAppUrl(phoneDigits, DEFAULT_WA_MESSAGE)
    : '#'

  return (
    <article className="svcCard surface">
      {service.imagenUrl ? (
        <img className="svcImg" src={service.imagenUrl} alt="" />
      ) : (
        <div className="svcImg svcImgEmpty">Sin imagen</div>
      )}
      <div className="svcBody">
        <div className="svcRow">
          <span className="svcBadge">{service.profesion}</span>
        </div>
        <div className="svcName">{service.nombre}</div>
        <div className="svcDesc clamp3">{service.descripcion}</div>
        <div className="svcMeta">Ubicación · {service.ubicacion || '—'}</div>

        {(showDetailLink || showWhatsApp) && (
          <div className="svcActions">
            {showDetailLink && service.id ? (
              <Link className="pill" to={`/services/${service.id}`}>
                Ver detalle
              </Link>
            ) : null}
            {showWhatsApp ? (
              <a
                className={`pill${canWhatsApp ? '' : ' isDisabled'}`}
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  if (!canWhatsApp) e.preventDefault()
                }}
                aria-disabled={canWhatsApp ? undefined : 'true'}
                tabIndex={canWhatsApp ? undefined : -1}
              >
                Contactar por WhatsApp
              </a>
            ) : null}
          </div>
        )}
      </div>
    </article>
  )
}

function DashboardServiceCard({
  service,
  onEdit,
  onDelete,
  disableEdit = false,
  disableDelete = false,
}) {
  return (
    <article className="svcCard surface">
      {service.imagenUrl ? (
        <img className="svcImg" src={service.imagenUrl} alt="" />
      ) : (
        <div className="svcImg svcImgEmpty">Sin imagen</div>
      )}
      <div className="svcBody">
        <div className="svcRow">
          <span className="svcBadge">{service.profesion}</span>
        </div>
        <div className="svcName">{service.nombre}</div>
        <div className="svcDesc clamp3">{service.descripcion}</div>
        <div className="svcMeta">Ubicación · {service.ubicacion || '—'}</div>

        <div className="svcActions svcActionsDashboard">
          <button
            className="pill"
            type="button"
            onClick={onEdit}
            disabled={disableEdit}
          >
            Editar
          </button>
          <button
            className="pill pillDangerOutline"
            type="button"
            onClick={onDelete}
            disabled={disableDelete}
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  )
}

function HomeServiceCard({ service }) {
  const phoneDigits = normalizeDigits(service.telefono)
  const canWhatsApp = isValidPhoneDigits(service.telefono)
  const waUrl = canWhatsApp
    ? buildWhatsAppUrl(phoneDigits, DEFAULT_WA_MESSAGE)
    : '#'

  return (
    <article className="homeRecentCard surface">
      {service.imagenUrl ? (
        <img className="homeRecentImg" src={service.imagenUrl} alt="" />
      ) : (
        <div className="homeRecentImg homeRecentImgPlaceholder" aria-hidden="true">
          {service.nombre.trim().slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="homeRecentBody">
        <div className="homeRecentName">{service.nombre}</div>
        <div className="homeRecentProfession">{service.profesion}</div>
        <p className="homeRecentDesc clamp2">{service.descripcion}</p>
        <div className="homeRecentMeta">📍 {service.ubicacion || '—'}</div>
        <a
          className={`homeRecentContact${canWhatsApp ? '' : ' isDisabled'}`}
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => {
            if (!canWhatsApp) e.preventDefault()
          }}
          aria-disabled={canWhatsApp ? undefined : 'true'}
        >
          Contactar
        </a>
      </div>
    </article>
  )
}

function SkeletonHomeCard() {
  return (
    <div className="homeRecentCard surface homeRecentCardSkeleton">
      <div className="homeRecentImg skeleton" />
      <div className="homeRecentBody">
        <div className="skeleton" style={{ height: 18, width: '65%' }} />
        <div className="skeleton" style={{ height: 14, width: '40%', marginTop: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '100%', marginTop: 10 }} />
        <div className="skeleton" style={{ height: 12, width: '90%', marginTop: 6 }} />
        <div className="skeleton" style={{ height: 12, width: '55%', marginTop: 10 }} />
        <div
          className="skeleton"
          style={{ height: 38, width: '100%', marginTop: 14, borderRadius: 999 }}
        />
      </div>
    </div>
  )
}

function HomeFooter() {
  const logoSrc = useLogoWithoutBlackBackground(LOGO_SRC)
  return (
    <footer className="portalFooter" aria-label="Pie de página">
      <div className="portalFooterInner">
        <img className="portalFooterLogo" src={logoSrc} alt="" aria-hidden="true" />
        <div className="portalFooterBrandName">Iglesia Voz de Esperanza</div>
      </div>
    </footer>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const [heroSearch, setHeroSearch] = useState('')
  const [state, setState] = useState({
    status: 'loading',
    services: [],
    error: null,
  })

  function onHeroSearchSubmit(e) {
    e.preventDefault()
    const q = heroSearch.trim()
    if (q) {
      navigate(`/services?q=${encodeURIComponent(q)}`)
    } else {
      navigate('/services')
    }
  }

  async function load() {
    setState({ status: 'loading', services: [], error: null })
    try {
      const services = await fetchServices()
      setState({ status: 'ok', services, error: null })
    } catch (e) {
      setState({
        status: 'error',
        services: [],
        error: e?.message || 'Ocurrió un error.',
      })
    }
  }

  useEffect(() => {
    load()
  }, [])

  const recent = getRecentServices(state.services, 4)

  return (
    <div className="pageHome">
      <section className="hero" aria-labelledby="portal-hero-title">
        <div className="heroCard" style={{ backgroundImage: `url(${HERO_IMAGE_SRC})` }}>
          <div className="heroOverlay" aria-hidden="true" />
          <div className="heroContent">
            <h1 id="portal-hero-title" className="heroTitle">
              Conectando
              <br />
              profesionales con
              <br />
              la comunidad
            </h1>
            <p className="heroSubtitle">
              Encontrá servicios de confianza,
              <br />
              personas dispuestas a ayudar
              <br />y oportunidades para crecer juntos.
            </p>

            <form className="heroSearch" onSubmit={onHeroSearchSubmit}>
              <label className="visuallyHidden" htmlFor="portal-search">
                Buscar servicios
              </label>
              <div className="heroSearchField">
                <IconSearch className="heroSearchIcon" />
                <input
                  id="portal-search"
                  className="heroSearchInput"
                  type="search"
                  name="q"
                  placeholder="¿Qué servicio estás buscando?"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="heroActions">
                <Link className="heroBtn heroBtnPrimary" to="/services">
                  Buscar profesionales
                </Link>
                <Link className="heroBtn heroBtnSecondary" to="/create">
                  Publicar servicio
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="portalCategories" aria-labelledby="portal-cat-title">
        <h2 id="portal-cat-title" className="visuallyHidden">
          Categorías de servicios
        </h2>
        <div className="portalCategoryGrid">
          {CATEGORY_CARDS.map(({ key, title, description, query, Icon }) => (
            <article key={key} className="portalCategoryCard surface">
              <div className="portalCategoryIconWrap" aria-hidden="true">
                <Icon className="portalCategoryIcon" />
              </div>
              <div className="portalCategoryTitle">{title}</div>
              <p className="portalCategoryDesc">{description}</p>
              <Link
                className="portalCategoryMore"
                to={`/services?q=${encodeURIComponent(query)}`}
              >
                <span>Ver más</span> <span aria-hidden="true">+</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="portalRecent">
        <div className="portalRecentHead">
          <h2 className="portalRecentTitle">Servicios recientes en la comunidad</h2>
          <Link className="portalRecentAll" to="/services">
            Ver todos <span aria-hidden="true">→</span>
          </Link>
        </div>

        {state.status === 'loading' ? (
          <div className="homeRecentGrid">
            <SkeletonHomeCard />
            <SkeletonHomeCard />
            <SkeletonHomeCard />
            <SkeletonHomeCard />
          </div>
        ) : null}

        {state.status === 'error' ? (
          <AlertBox
            title="No pudimos cargar los servicios"
            description={state.error}
            actionLabel="Intentar nuevamente"
            onAction={load}
            secondaryLabel="Ir a Servicios"
            secondaryTo="/services"
          />
        ) : null}

        {state.status === 'ok' && recent.length === 0 ? (
          <div className="empty surface">Aún no hay servicios publicados</div>
        ) : null}

        {state.status === 'ok' && recent.length > 0 ? (
          <div className="homeRecentGrid">
            {recent.map((s) => (
              <HomeServiceCard key={s.id} service={s} />
            ))}
          </div>
        ) : null}
      </section>

      <HomeFooter />
    </div>
  )
}

function ServicesPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const [state, setState] = useState({
    status: 'loading',
    services: [],
    error: null,
  })

  async function load() {
    setState({ status: 'loading', services: [], error: null })
    try {
      const services = await fetchServices()
      setState({ status: 'ok', services, error: null })
    } catch (e) {
      setState({
        status: 'error',
        services: [],
        error: e?.message || 'Ocurrió un error.',
      })
    }
  }

  useEffect(() => {
    load()
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!q) return state.services
    return state.services.filter((s) => {
      const hay = [
        s.nombre,
        s.profesion,
        s.descripcion,
        s.ubicacion,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [q, state.services])

  const hasSearch = q.length > 0

  return (
    <>
      <div className="pageToolbar">
        <Link className="pill" to="/">
          ← Inicio
        </Link>
      </div>

      <div className="pageHeader">
        <h1>Servicios</h1>
        <p className="pageGuide">
          Buscá por nombre/profesión/zona/descripcion. Podés contactar por
          WhatsApp desde la tarjeta.
        </p>
      </div>

      <div className="searchRow">
        <input
          className="searchInput"
          type="search"
          placeholder="Nombre, oficio, zona…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={state.status === 'loading'}
        />
      </div>

      {state.status === 'loading' ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : null}

      {state.status === 'error' ? (
        <AlertBox
          title="No pudimos cargar los servicios"
          description={state.error}
          actionLabel="Intentar nuevamente"
          onAction={load}
          secondaryLabel="Ir al inicio"
          secondaryTo="/"
        />
      ) : null}

      {state.status === 'ok' && state.services.length === 0 && !hasSearch ? (
        <div className="empty surface">
          <div className="emptyTitle">Aún no hay servicios publicados</div>
          <div className="emptyActions">
            <Link className="pill pillPrimary" to="/create">
              Publicar servicio
            </Link>
            <Link className="pill" to="/">
              Ir al inicio
            </Link>
          </div>
        </div>
      ) : null}

      {state.status === 'ok' && filtered.length === 0 && hasSearch ? (
        <div className="empty surface">
          <div className="emptyTitle">No hay resultados para “{q}”</div>
          <div className="emptyActions">
            <button className="pill" type="button" onClick={() => setQuery('')}>
              Limpiar búsqueda
            </button>
            <Link className="pill" to="/services">
              Ver todos los servicios
            </Link>
            <Link className="pill" to="/">
              Ir al inicio
            </Link>
          </div>
        </div>
      ) : null}

      {state.status === 'ok' && filtered.length > 0 ? (
        <div className="grid">
          {filtered.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      ) : null}
    </>
  )
}

function ServiceDetailPage() {
  const { id } = useParams()
  const { user } = useOutletContext()
  const [state, setState] = useState({
    status: 'loading',
    service: null,
    error: null,
  })

  const [reviewsState, setReviewsState] = useState({
    status: 'idle',
    reviews: [],
    error: null,
  })
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState(null)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [deleteReviewState, setDeleteReviewState] = useState({
    open: false,
    review: null,
    busy: false,
    error: null,
  })

  async function load() {
    setState({ status: 'loading', service: null, error: null })
    try {
      const service = await fetchServiceById(id)
      setState({ status: 'ok', service, error: null })
    } catch (e) {
      setState({
        status: 'error',
        service: null,
        error: e?.message || 'Ocurrió un error.',
      })
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function loadReviews(serviceId) {
    setReviewsState({ status: 'loading', reviews: [], error: null })
    try {
      const reviews = await fetchReviews(serviceId)
      setReviewsState({ status: 'ok', reviews, error: null })
    } catch (e) {
      setReviewsState({
        status: 'error',
        reviews: [],
        error: e?.message || 'No pudimos cargar las reseñas.',
      })
    }
  }

  useEffect(() => {
    if (!id) return
    loadReviews(id)
  }, [id])

  const formatDate = useCallback((ts) => {
    try {
      return new Intl.DateTimeFormat('es-AR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }).format(new Date(ts))
    } catch {
      return ''
    }
  }, [])

  const phoneDigits = state.service
    ? normalizeDigits(state.service.telefono)
    : ''
  const canWhatsApp = state.service
    ? isValidPhoneDigits(state.service.telefono)
    : false
  const waUrl = canWhatsApp
    ? buildWhatsAppUrl(phoneDigits, DEFAULT_WA_MESSAGE)
    : '#'

  if (state.status === 'loading') {
    return (
      <>
        <div className="detailToolbar">
          <Link className="pill" to="/services">
            ← Servicios
          </Link>
          <Link className="pill" to="/">
            Inicio
          </Link>
        </div>
        <div className="surface detailSkeleton">
          <div className="detailImg skeleton" />
          <div className="detailBody">
            <div className="skeleton" style={{ height: 28, width: '70%' }} />
            <div className="skeleton" style={{ height: 120, marginTop: 14 }} />
          </div>
        </div>
      </>
    )
  }

  if (state.status === 'error') {
    return (
      <>
        <div className="detailToolbar">
          <Link className="pill" to="/services">
            ← Servicios
          </Link>
          <Link className="pill" to="/">
            Inicio
          </Link>
        </div>
        <AlertBox
          title="No pudimos cargar el servicio"
          description={state.error}
          actionLabel="Intentar nuevamente"
          onAction={load}
          secondaryLabel="Volver al listado"
          secondaryTo="/services"
        />
      </>
    )
  }

  if (!state.service) {
    return (
      <>
        <div className="detailToolbar">
          <Link className="pill" to="/services">
            ← Servicios
          </Link>
          <Link className="pill" to="/">
            Inicio
          </Link>
        </div>
        <div className="empty surface">
          <div className="emptyTitle">No encontramos este servicio.</div>
          <div className="emptyActions">
            <Link className="pill pillPrimary" to="/services">
              Volver al listado
            </Link>
            <Link className="pill" to="/">
              Ir al inicio
            </Link>
          </div>
        </div>
      </>
    )
  }

  const s = state.service
  const isOwner =
    !!user && !!s?.ownerId && String(s.ownerId) === String(user.email)
  const canReviewThisService = !!s?.ownerId

  return (
    <>
      <div className="detailToolbar">
        <Link className="pill" to="/services">
          ← Servicios
        </Link>
        <Link className="pill" to="/">
          Inicio
        </Link>
      </div>

      <article className="surface detailCard">
        {s.imagenUrl ? (
          <img className="detailImg" src={s.imagenUrl} alt="" />
        ) : (
          <div className="detailImg detailImgEmpty">Sin imagen</div>
        )}
        <div className="detailBody">
          <h1 className="detailName">{s.nombre}</h1>
          <span className="svcBadge">{s.profesion}</span>
          <section className="detailBlock">
            <h2 className="detailBlockTitle">Sobre el servicio</h2>
            <p className="detailBlockText">{s.descripcion}</p>
          </section>
          <section className="detailBlock">
            <h2 className="detailBlockTitle">Ubicación</h2>
            <p className="detailBlockText">{s.ubicacion || '—'}</p>
          </section>
          <section className="detailBlock">
            <h2 className="detailBlockTitle">Teléfono</h2>
            <p className="detailBlockText">{s.telefono || '—'}</p>
          </section>
          <div className="detailActions">
            <a
              className={`pill pillPrimary${canWhatsApp ? '' : ' isDisabled'}`}
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (!canWhatsApp) e.preventDefault()
              }}
            >
              <span aria-hidden="true">💬</span> Contactar por WhatsApp
            </a>
          </div>

          <section className="detailReviews" aria-labelledby="reviews-title">
            <div className="detailReviewsHead">
              <h2 id="reviews-title" className="detailBlockTitle">
                Reseñas
              </h2>
              {user && !isOwner ? (
                <button
                  className="pill"
                  type="button"
                  onClick={() => {
                    setReviewError(null)
                    setReviewFormOpen((v) => !v)
                  }}
                >
                  {reviewFormOpen ? 'Cerrar' : 'Dejar reseña'}
                </button>
              ) : null}
            </div>

            {!canReviewThisService ? (
              <p className="profileMuted">Este servicio aún no admite reseñas</p>
            ) : !user ? (
              <p className="profileMuted">Iniciá sesión para continuar.</p>
            ) : isOwner ? (
              <p className="profileMuted">No podés reseñar tu propio servicio.</p>
            ) : null}

            {reviewFormOpen && canReviewThisService && user && !isOwner ? (
              <form
                className="reviewForm surface"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (reviewSubmitting) return
                  const text = reviewText.trim()
                  if (text.length < 5) {
                    setReviewError('La reseña debe tener al menos 5 caracteres')
                    return
                  }
                  if (reviewRating != null) {
                    const n = Number(reviewRating)
                    if (!Number.isFinite(n) || n < 1 || n > 5) {
                      setReviewError('El rating debe estar entre 1 y 5')
                      return
                    }
                  }
                  setReviewSubmitting(true)
                  setReviewError(null)
                  try {
                    await createReview({
                      serviceId: s.id,
                      authorId: user.email,
                      authorName: user.name,
                      text,
                      rating: reviewRating != null ? Number(reviewRating) : undefined,
                    })
                    setReviewText('')
                    setReviewRating(null)
                    setReviewFormOpen(false)
                    await loadReviews(s.id)
                    setToastMessage('Reseña publicada correctamente')
                  } catch (err) {
                    setReviewError(err?.message || 'No se pudo publicar la reseña.')
                  } finally {
                    setReviewSubmitting(false)
                  }
                }}
              >
                <div className="field">
                  <label className="label" htmlFor="review-text">
                    Tu reseña
                  </label>
                  <textarea
                    id="review-text"
                    className="textarea"
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value.slice(0, 600))}
                    disabled={reviewSubmitting}
                  />
                  <div className="help">{reviewText.length} / 600</div>
                </div>

                <div className="field">
                  <label className="label" htmlFor="review-rating">
                    Calificación <span className="hint">(opcional, 1–5)</span>
                  </label>
                  <input
                    id="review-rating"
                    className="input"
                    inputMode="numeric"
                    placeholder="Ej: 5"
                    value={reviewRating ?? ''}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, '').slice(0, 1)
                      if (!v) setReviewRating(null)
                      else setReviewRating(Number(v))
                    }}
                    disabled={reviewSubmitting}
                  />
                </div>

                {reviewError ? (
                  <div className="profileError" role="status">
                    {reviewError}
                  </div>
                ) : null}

                <button
                  className="pill pillPrimary"
                  type="submit"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? 'Publicando…' : 'Publicar reseña'}
                </button>
              </form>
            ) : null}

            {reviewsState.status === 'loading' ? (
              <p className="profileMuted">Cargando reseñas…</p>
            ) : null}

            {reviewsState.status === 'error' ? (
              <div className="alert surface" role="alert">
                <div className="alertDesc">{reviewsState.error}</div>
                <div className="alertActions">
                  <button className="pill" type="button" onClick={() => loadReviews(s.id)}>
                    Reintentar
                  </button>
                </div>
              </div>
            ) : null}

            {reviewsState.status === 'ok' && reviewsState.reviews.length === 0 ? (
              <div className="empty surface">
                <div className="emptyTitle">Aún no hay reseñas</div>
              </div>
            ) : null}

            {reviewsState.status === 'ok' && reviewsState.reviews.length > 0 ? (
              <div className="reviewList">
                {reviewsState.reviews.map((r) => {
                  const canDelete = !!user && String(r.authorId) === String(user.email)
                  return (
                    <article key={r.id} className="reviewItem surface">
                      <div className="reviewTop">
                        <div className="reviewAuthor">
                          {r.authorName?.trim() ? r.authorName : 'Anónimo'}
                        </div>
                        <div className="reviewMeta">
                          {r.rating ? (
                            <span className="reviewRating" title={`${r.rating}/5`}>
                              {'★'.repeat(Math.max(0, Math.min(5, r.rating)))}
                            </span>
                          ) : null}
                          <span className="reviewDate">{formatDate(r.createdAt)}</span>
                        </div>
                      </div>
                      <p className="reviewText">{r.text}</p>
                      {canDelete ? (
                        <div className="reviewActions">
                          <button
                            className="pill pillDangerOutline"
                            type="button"
                            onClick={() =>
                              setDeleteReviewState({
                                open: true,
                                review: r,
                                busy: false,
                                error: null,
                              })
                            }
                          >
                            Eliminar
                          </button>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            ) : null}
          </section>
        </div>
      </article>

      <ConfirmDialog
        open={deleteReviewState.open}
        title="¿Eliminar esta reseña? Esta acción no se puede deshacer."
        confirmLabel={deleteReviewState.busy ? 'Eliminando…' : 'Eliminar'}
        destructive
        busy={deleteReviewState.busy}
        onCancel={() => {
          if (deleteReviewState.busy) return
          setDeleteReviewState({ open: false, review: null, busy: false, error: null })
        }}
        onConfirm={async () => {
          if (!deleteReviewState.review || deleteReviewState.busy) return
          setDeleteReviewState((s) => ({ ...s, busy: true, error: null }))
          try {
            await deleteReview(deleteReviewState.review.id)
            setDeleteReviewState({ open: false, review: null, busy: false, error: null })
            await loadReviews(id)
            setToastMessage('Reseña eliminada correctamente')
          } catch (e) {
            setDeleteReviewState((s) => ({
              ...s,
              busy: false,
              error: e?.message || 'No se pudo eliminar la reseña.',
            }))
          }
        }}
      />

      {deleteReviewState.open && deleteReviewState.error ? (
        <div className="alert surface" role="alert">
          <div className="alertDesc">{deleteReviewState.error}</div>
        </div>
      ) : null}

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </>
  )
}

function CreatePage({ mode = 'create' }) {
  const { user } = useOutletContext()
  const navigate = useNavigate()
  const params = useParams()
  const editingId = mode === 'edit' ? params.id : null
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [loadingService, setLoadingService] = useState(false)
  const [existingImageUrl, setExistingImageUrl] = useState('')
  const [existingOwnerId, setExistingOwnerId] = useState('')
  const [existingOwnerName, setExistingOwnerName] = useState('')

  const [form, setForm] = useState({
    nombre: '',
    profesion: '',
    descripcion: '',
    ubicacion: '',
    telefono: '',
    imagen: null,
  })

  useEffect(() => {
    if (!editingId) return
    let cancelled = false
    async function load() {
      setLoadingService(true)
      setSubmitError(null)
      try {
        const svc = await fetchServiceById(editingId)
        if (cancelled) return
        if (!svc) {
          setSubmitError('No encontramos este servicio para editar.')
          return
        }
        setExistingImageUrl(svc.imagenUrl || '')
        setExistingOwnerId(svc.ownerId || '')
        setExistingOwnerName(svc.ownerName || '')
        setForm({
          nombre: svc.nombre || '',
          profesion: svc.profesion || '',
          descripcion: svc.descripcion || '',
          ubicacion: svc.ubicacion || '',
          telefono: svc.telefono || '',
          imagen: null,
        })
      } catch (e) {
        if (cancelled) return
        setSubmitError(e?.message || 'No pudimos cargar el servicio.')
      } finally {
        if (!cancelled) setLoadingService(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [editingId])

  const telefonoDigits = normalizeDigits(form.telefono)
  const telefonoOk = isValidPhoneDigits(telefonoDigits)
  const canSubmit =
    !!user &&
    !submitting &&
    !loadingService &&
    form.nombre.trim().length > 0 &&
    form.profesion.trim().length > 0 &&
    telefonoOk

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      let imageUrl
      if (form.imagen) {
        imageUrl = await new Promise((resolve, reject) => {
          const r = new FileReader()
          r.onload = () => resolve(r.result)
          r.onerror = () => reject(new Error('No se pudo leer la imagen.'))
          r.readAsDataURL(form.imagen)
        })
      }
      const payload = {
        name: form.nombre.trim(),
        profession: form.profesion.trim(),
        description: form.descripcion.trim() || undefined,
        location: form.ubicacion.trim() || undefined,
        phone: telefonoDigits,
        imageUrl: imageUrl || existingImageUrl || undefined,
        ownerId: (existingOwnerId || user?.email || '').trim() || undefined,
        ownerName: (existingOwnerName || user?.name || '').trim() || undefined,
      }

      if (editingId) {
        await updateService(editingId, payload)
      } else {
        await createService(payload)
      }

      navigate('/profile#mis-servicios', {
        state: editingId
          ? { toast: 'Cambios guardados correctamente' }
          : undefined,
      })
    } catch (err) {
      setSubmitError(
        err?.message ||
          (editingId
            ? 'Ocurrió un error al guardar los cambios.'
            : 'Ocurrió un error al publicar.'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="pageToolbar">
        <Link className="pill" to="/profile#mis-servicios">
          ← Perfil
        </Link>
        <Link className="pill" to="/">
          Inicio
        </Link>
      </div>

      <div className="pageHeader">
        <h1>{editingId ? 'Editar servicio' : 'Publicar servicio'}</h1>
        <p className="pageGuide">
          Completá los datos para que la comunidad pueda encontrarte. Podés
          adjuntar cualquier imagen (foto, diseño, imagen generada, etc.); es
          opcional.
        </p>
      </div>

      {!user ? (
        <div className="info surface" role="status">
          <p className="infoText">
            Iniciá sesión para continuar.
          </p>
          <div className="infoActions">
            <Link className="pill" to="/">
              Ir al inicio
            </Link>
            <Link className="pill" to="/services">
              Ver servicios
            </Link>
          </div>
        </div>
      ) : null}

      {submitError ? (
        <div className="alert surface" role="alert">
          <div className="alertDesc">{submitError}</div>
        </div>
      ) : null}

      {loadingService ? <p className="profileMuted">Cargando…</p> : null}

      <form className="form surface" onSubmit={onSubmit}>
        <div className="formGrid">
          <div className="field">
            <label className="label" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              className="input"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="profesion">
              Profesión u oficio
            </label>
            <input
              id="profesion"
              className="input"
              value={form.profesion}
              onChange={(e) =>
                setForm((f) => ({ ...f, profesion: e.target.value }))
              }
              required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="descripcion">
              Descripción <span className="hint">(opcional)</span>
            </label>
            <textarea
              id="descripcion"
              className="textarea"
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({ ...f, descripcion: e.target.value.slice(0, 300) }))
              }
              rows={4}
            />
            <div className="help">Opcional. Hasta 300 caracteres.</div>
          </div>

          <div className="field">
            <label className="label" htmlFor="ubicacion">
              Ubicación <span className="hint">(opcional)</span>
            </label>
            <input
              id="ubicacion"
              className="input"
              placeholder="Barrio, ciudad o zona"
              value={form.ubicacion}
              onChange={(e) =>
                setForm((f) => ({ ...f, ubicacion: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="telefono">
              Teléfono (WhatsApp)
            </label>
            <input
              id="telefono"
              className="input"
              placeholder="Ej: 54 9 11 1234-5678"
              value={form.telefono}
              onChange={(e) =>
                setForm((f) => ({ ...f, telefono: e.target.value }))
              }
              inputMode="tel"
              required
            />
            <div className="help">
              Incluí código de país para que el contacto por WhatsApp funcione
              bien. Se guardan solo dígitos.
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="imagen">
              Imagen <span className="hint">(opcional)</span>
            </label>
            <input
              id="imagen"
              className="input file"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  imagen: e.target.files?.[0] ?? null,
                }))
              }
            />
          </div>
        </div>

        <button
          className="pill pillPrimary formSubmit"
          type="submit"
          disabled={!canSubmit}
        >
          {submitting
            ? editingId
              ? 'Guardando…'
              : 'Publicando…'
            : !user
              ? 'Entrá para publicar'
              : editingId
                ? 'Guardar cambios'
                : 'Publicar servicio'}
        </button>

        <div className="formExitRow">
          <Link className="pill" to="/">
            Salir sin publicar
          </Link>
        </div>
      </form>
    </>
  )
}

function ProfilePage() {
  const { user, updateProfile } = useOutletContext()
  const location = useLocation()
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState('')
  const [bioLoading, setBioLoading] = useState(true)
  const [bio, setBio] = useState('')
  const [bioStatus, setBioStatus] = useState({ type: '', message: '' })
  const [avatarUrl, setAvatarUrl] = useState('')
  const fileInputRef = useRef(null)
  const [profileSaving, setProfileSaving] = useState(false)

  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileModalVisible, setProfileModalVisible] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [locationDraft, setLocationDraft] = useState('')
  const [bioModalDraft, setBioModalDraft] = useState('')

  const [reviewsReceivedState, setReviewsReceivedState] = useState({
    status: 'idle',
    reviews: [],
    error: null,
  })

  const [myServicesState, setMyServicesState] = useState({
    status: 'loading',
    services: [],
    error: null,
  })

  const [deleteState, setDeleteState] = useState({
    open: false,
    service: null,
    busy: false,
    error: null,
  })

  const loadMyServices = useCallback(async () => {
    if (!user) return
    setMyServicesState((s) => ({
      ...s,
      status: 'loading',
      error: null,
    }))
    try {
      const services = await fetchServices()
      const mine = services.filter(
        (svc) => svc.ownerId && String(svc.ownerId) === String(user.email),
      )
      setMyServicesState({ status: 'ok', services: mine, error: null })
    } catch (e) {
      setMyServicesState({
        status: 'error',
        services: [],
        error: e?.message || 'No pudimos cargar tus servicios.',
      })
    }
  }, [user])

  const loadReceivedReviews = useCallback(async () => {
    if (!user) return
    setReviewsReceivedState({ status: 'loading', reviews: [], error: null })
    try {
      const services = await fetchServices()
      const owned = services.filter(
        (s) => s.ownerId && String(s.ownerId) === String(user.email),
      )
      if (owned.length === 0) {
        setReviewsReceivedState({ status: 'ok', reviews: [], error: null })
        return
      }

      const batches = await Promise.all(
        owned.map(async (svc) => {
          const reviews = await fetchReviews(svc.id)
          return reviews.map((r) => ({
            ...r,
            serviceName: svc.nombre,
            serviceId: svc.id,
          }))
        }),
      )

      const all = batches.flat().sort((a, b) => b.createdAt - a.createdAt)
      setReviewsReceivedState({ status: 'ok', reviews: all, error: null })
    } catch (e) {
      setReviewsReceivedState({
        status: 'error',
        reviews: [],
        error: e?.message || 'No se pudieron cargar las reseñas.',
      })
    }
  }, [user])

  useEffect(() => {
    loadMyServices()
  }, [loadMyServices])

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!user?.email) return
      setBioLoading(true)
      try {
        const u = await getUser(user.email)
        if (cancelled) return
        if (u) {
          updateProfile?.({
            name: u.name || user.name,
            location: u.location || user.location,
            photo: u.photo || user.photo,
          })
          setBio(u.bio || '')
          setAvatarUrl(u.photo || user.photo || '')
        } else {
          const created = await createUser({
            email: user.email,
            name: user.name,
            photo: user.photo,
          })
          if (cancelled) return
          updateProfile?.({
            name: created?.name || user.name,
            location: created?.location || user.location,
            photo: created?.photo || user.photo,
          })
          setBio(created?.bio || '')
          setAvatarUrl(created?.photo || user.photo || '')
        }
      } catch (e) {
        if (cancelled) return
        setBioStatus({
          type: 'error',
          message: e?.message || 'No se pudo cargar el perfil.',
        })
      } finally {
        if (!cancelled) setBioLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [user?.email])

  useEffect(() => {
    loadReceivedReviews()
  }, [loadReceivedReviews, user?.email])

  useEffect(() => {
    if (location.hash !== '#mis-servicios') return
    const el = document.getElementById('mis-servicios')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  useEffect(() => {
    const msg = location.state?.toast
    if (!msg) return
    setToastMessage(String(msg))
    navigate(`${location.pathname}${location.hash || ''}`, {
      replace: true,
      state: null,
    })
  }, [location.pathname, location.hash, location.state, navigate])

  function validateProfileForm({ name, locationText, presentation }) {
    const n = name.trim()
    if (!n) return 'El nombre es obligatorio.'
    if (n.length > 80) return 'El nombre es demasiado largo.'
    const loc = locationText.trim()
    if (loc.length > 120) return 'La ubicación es demasiado larga.'
    const p = presentation.trim()
    if (p.length > 500) return 'La presentación no puede superar 500 caracteres.'
    return ''
  }

  function openProfileModal() {
    setNameDraft(user?.name ?? '')
    setLocationDraft(user?.location ?? '')
    setBioModalDraft(bio)
    setBioStatus({ type: '', message: '' })
    setProfileModalOpen(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setProfileModalVisible(true))
    })
  }

  function closeProfileModal() {
    setProfileModalVisible(false)
    window.setTimeout(() => {
      setProfileModalOpen(false)
      setBioStatus({ type: '', message: '' })
    }, 200)
  }

  useEffect(() => {
    if (!profileModalOpen) return
    function onKeyDown(e) {
      if (e.key === 'Escape') closeProfileModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [profileModalOpen])

  async function saveProfile() {
    const err = validateProfileForm({
      name: nameDraft,
      locationText: locationDraft,
      presentation: bioModalDraft,
    })
    if (err) {
      setBioStatus({ type: 'error', message: err })
      return
    }

    if (!user?.email || profileSaving) return
    setProfileSaving(true)
    try {
      const nextName = nameDraft.trim()
      const nextLocation = locationDraft.trim()
      const nextBio = bioModalDraft.trim()
      const nextPhoto = (avatarUrl || user.photo || '').trim()

      const saved = await updateUser(user.email, {
        name: nextName,
        location: nextLocation,
        bio: nextBio,
        photo: nextPhoto,
      })

      updateProfile?.({
        name: saved?.name ?? nextName,
        location: saved?.location ?? nextLocation,
        photo: saved?.photo ?? nextPhoto,
      })
      setBio(saved?.bio ?? nextBio)
      setAvatarUrl(saved?.photo ?? nextPhoto)
      closeProfileModal()
      setToastMessage('Perfil guardado correctamente')
    } catch (e) {
      setBioStatus({
        type: 'error',
        message: e?.message || 'No se pudo guardar el perfil.',
      })
    } finally {
      setProfileSaving(false)
    }
  }

  async function onPickAvatarFile(file) {
    if (!file) return
    const dataUrl = await new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result)
      r.onerror = () => reject(new Error('No se pudo leer la imagen.'))
      r.readAsDataURL(file)
    })
    const nextUrl = String(dataUrl || '')
    setAvatarUrl(nextUrl)
    updateProfile?.({ photo: nextUrl })
    if (user?.email) {
      try {
        await updateUser(user.email, { photo: nextUrl })
        setToastMessage('Foto actualizada correctamente')
      } catch (e) {
        setBioStatus({
          type: 'error',
          message: e?.message || 'No se pudo guardar la foto.',
        })
      }
    }
  }

  function openAvatarPicker() {
    fileInputRef.current?.click?.()
  }

  if (!user) {
    return (
      <>
        <div className="empty surface">
          <div className="emptyTitle">Debés iniciar sesión para ver tu perfil</div>
          <Link className="pill pillPrimary" to="/">
            Ir al inicio
          </Link>
        </div>
      </>
    )
  }

  const hasBio = bio.trim().length > 0

  return (
    <div className="profilePage">
      <div className="profileHeader">
        <Link className="pill" to="/">
          ← Volver
        </Link>
      </div>

      <div className="dashboardShell">
        <aside className="dashboardColLeft">
          <section className="dashboardCard surface dashboardProfileCard">
            <div className="dashboardProfileCardTop">
              <button
                type="button"
                className="profileEditIconBtn profileCardEditBtn"
                aria-label="Editar perfil"
                onClick={openProfileModal}
                disabled={bioLoading}
              >
                <IconPencil className="profileEditIcon" />
              </button>
              <div className="profileTop dashboardProfileTopCentered">
                <div className="profileAvatarWrap">
                  <div className="profileAvatar" aria-hidden="true">
                    {avatarUrl ? (
                      <img className="profileAvatarImg" src={avatarUrl} alt="" />
                    ) : (
                      (user.photo ? (
                        <img className="profileAvatarImg" src={user.photo} alt="" />
                      ) : (
                        user.name.trim().slice(0, 1).toUpperCase()
                      ))
                    )}
                  </div>
                  <button
                    type="button"
                    className="profileAvatarAdd"
                    aria-label="Agregar foto de perfil"
                    onClick={openAvatarPicker}
                  >
                    +
                  </button>
                </div>
                <div className="profileIdentity">
                  <div className="profileName profileNameCentered">{user.name}</div>
                  {user.location ? (
                    <div className="profileLocationLine">📍 {user.location}</div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="dashboardProfileCardBody">
              <h2 className="profileSectionTitle dashboardProfileSectionTitle">
                Presentación
              </h2>

              {bioLoading ? (
                <p className="profileMuted">Cargando…</p>
              ) : (
                <p className="profileBioPreview dashboardProfileBioPreview">
                  {hasBio
                    ? bio
                    : 'Agregá una breve presentación para que la comunidad te conozca.'}
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="visuallyHidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                try {
                  await onPickAvatarFile(file)
                } catch (err) {
                  setBioStatus({
                    type: 'error',
                    message: err?.message || 'No se pudo cargar la imagen.',
                  })
                } finally {
                  e.target.value = ''
                }
              }}
            />
          </section>
        </aside>

        <section className="dashboardColRight">
          <section id="mis-servicios" className="dashboardCard surface">
            <div className="dashboardSectionHeader">
              <h2 className="profileSectionTitle">Mis servicios</h2>
              <div className="dashboardHeaderRule" aria-hidden="true" />
              <Link className="pill pillDashboardCta" to="/create">
                + Crear servicio
              </Link>
            </div>

            {myServicesState.status === 'loading' ? (
              <p className="profileMuted">Cargando…</p>
            ) : null}

            {myServicesState.status === 'error' ? (
              <div className="profileReviewsError">
                <div className="profileError">{myServicesState.error}</div>
                <div className="profileReviewsErrorActions">
                  <button className="pill" type="button" onClick={loadMyServices}>
                    Reintentar
                  </button>
                  <Link className="pill" to="/services">
                    Ver todos
                  </Link>
                </div>
              </div>
            ) : null}

            {myServicesState.status === 'ok' &&
            myServicesState.services.length === 0 ? (
              <div className="empty surface profileMisServiciosCard">
                <div className="emptyTitle">Aún no hay servicios publicados</div>
                <Link className="pill pillPrimary" to="/create">
                  Publicar servicio
                </Link>
              </div>
            ) : null}

            {myServicesState.status === 'ok' &&
            myServicesState.services.length > 0 ? (
              <div className="profileServicesGrid">
                {myServicesState.services.map((s) => (
                  (() => {
                    const modalOpen = deleteState.open
                    const isCurrent = deleteState.service?.id === s.id
                    const disableActions = modalOpen || (deleteState.busy && isCurrent)
                    return (
                  <DashboardServiceCard
                    key={s.id}
                    service={s}
                    disableEdit={disableActions}
                    disableDelete={disableActions}
                    onEdit={() => navigate(`/edit/${s.id}`)}
                    onDelete={() =>
                      setDeleteState({
                        open: true,
                        service: s,
                        busy: false,
                        error: null,
                      })
                    }
                  />
                    )
                  })()
                ))}
              </div>
            ) : null}
          </section>

          <section className="dashboardCard surface dashboardReviewsCard">
            <div className="dashboardSectionHeader">
              <h2 className="profileSectionTitle">Reseñas</h2>
              <div className="dashboardHeaderRule" aria-hidden="true" />
              {reviewsReceivedState.status === 'ok' ? (
                <span className="profileMuted">
                  {reviewsReceivedState.reviews.length} reseñas recibidas
                </span>
              ) : null}
            </div>

            {reviewsReceivedState.status === 'loading' ? (
              <p className="profileMuted">Cargando reseñas…</p>
            ) : null}

            {reviewsReceivedState.status === 'error' ? (
              <div className="profileReviewsError">
                <div className="profileError">{reviewsReceivedState.error}</div>
                <div className="profileReviewsErrorActions">
                  <button className="pill" type="button" onClick={loadReceivedReviews}>
                    Reintentar
                  </button>
                  <Link className="pill" to="/">
                    Ir al inicio
                  </Link>
                </div>
              </div>
            ) : null}

            {reviewsReceivedState.status === 'ok' &&
            reviewsReceivedState.reviews.length === 0 ? (
              <div className="profileReviewsError">
                <div className="emptyTitle">Todavía no tienes reseñas</div>
                <p className="profileMuted">
                  Cuando comiences a ofrecer tus servicios, aquí aparecerán las opiniones
                  de las personas que confíen en vos.
                </p>
              </div>
            ) : null}

            {reviewsReceivedState.status === 'ok' &&
            reviewsReceivedState.reviews.length > 0 ? (
              <div className="reviewList">
                {reviewsReceivedState.reviews.map((r) => (
                  <article key={r.id} className="reviewItem surface">
                    <div className="reviewTop">
                      <div className="reviewAuthor">{r.serviceName}</div>
                      <div className="reviewMeta">
                        {r.rating ? (
                          <span className="reviewRating" title={`${r.rating}/5`}>
                            {'★'.repeat(Math.max(0, Math.min(5, r.rating)))}
                          </span>
                        ) : null}
                        <span className="reviewDate">
                          {r.createdAt
                            ? new Intl.DateTimeFormat('es-AR', {
                                year: 'numeric',
                                month: 'short',
                                day: '2-digit',
                              }).format(new Date(r.createdAt))
                            : ''}
                        </span>
                      </div>
                    </div>
                    <p className="reviewText">{r.text}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </section>
      </div>

      <ConfirmDialog
        open={deleteState.open}
        title="¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer."
        confirmLabel={deleteState.busy ? 'Eliminando…' : 'Eliminar'}
        destructive
        busy={deleteState.busy}
        onCancel={() => {
          if (deleteState.busy) return
          setDeleteState({ open: false, service: null, busy: false, error: null })
        }}
        onConfirm={async () => {
          if (!deleteState.service || deleteState.busy) return
          setDeleteState((s) => ({ ...s, busy: true, error: null }))
          try {
            await deleteService(deleteState.service.id)
            setDeleteState({ open: false, service: null, busy: false, error: null })
            loadMyServices()
            setToastMessage('Servicio eliminado correctamente')
          } catch (e) {
            setDeleteState((s) => ({
              ...s,
              busy: false,
              error: e?.message || 'No se pudo eliminar.',
            }))
          }
        }}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {deleteState.open && deleteState.error ? (
        <div className="alert surface" role="alert">
          <div className="alertDesc">{deleteState.error}</div>
        </div>
      ) : null}

      {profileModalOpen ? (
        <div
          className={`profileModalOverlay${profileModalVisible ? ' isOpen' : ''}`}
          role="presentation"
          onClick={closeProfileModal}
        >
          <div
            className={`profileModalCard surface${profileModalVisible ? ' isOpen' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Editar perfil"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profileModalTitle">Editar perfil</div>

            <div className="field">
              <label className="label" htmlFor="profile-name">
                Nombre
              </label>
              <input
                id="profile-name"
                className="input"
                value={nameDraft}
                onChange={(e) => {
                  setNameDraft(e.target.value)
                  if (bioStatus.type) setBioStatus({ type: '', message: '' })
                }}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="profile-location">
                Ubicación
              </label>
              <input
                id="profile-location"
                className="input"
                placeholder="Ciudad, barrio o zona"
                value={locationDraft}
                onChange={(e) => {
                  setLocationDraft(e.target.value)
                  if (bioStatus.type) setBioStatus({ type: '', message: '' })
                }}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="profile-bio">
                Presentación
              </label>
              <textarea
                id="profile-bio"
                className="textarea"
                rows={6}
                value={bioModalDraft}
                onChange={(e) => {
                  setBioModalDraft(e.target.value.slice(0, 500))
                  if (bioStatus.type) setBioStatus({ type: '', message: '' })
                }}
              />
              <div className="help">{bioModalDraft.length} / 500</div>
            </div>

            {bioStatus.type === 'error' ? (
              <div className="profileError" role="status">
                {bioStatus.message}
              </div>
            ) : null}

            <div className="profileModalActions">
              <button className="pill" type="button" onClick={closeProfileModal}>
                Cancelar
              </button>
              <button
                className="pill pillPrimary"
                type="button"
                onClick={() => void saveProfile()}
                disabled={profileSaving}
              >
                {profileSaving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function AboutPage() {
  return (
    <div className="staticPage">
      <section className="staticHero" aria-labelledby="about-title">
        <h1 id="about-title">Sobre nosotros</h1>
        <p className="staticLead">
          Somos una iniciativa de la iglesia Voz de Esperanza, creada para conectar
          personas con oportunidades reales de trabajo y servicio dentro de la
          comunidad.
        </p>
      </section>

      <section className="staticSection surface" aria-labelledby="about-historia">
        <h2 id="about-historia">Historia</h2>
        <div className="staticProse">
          <p>
            Este proyecto nació en 2026 dentro de la iglesia Voz de Esperanza, a
            partir de un grupo de personas que, frente a la falta de oportunidades
            laborales, decidieron crear un espacio donde ayudarse mutuamente.
          </p>
          <p>
            La idea es simple: conectar a quienes necesitan un servicio con quienes
            pueden ofrecerlo, fortaleciendo los vínculos y generando nuevas
            oportunidades dentro de la comunidad.
          </p>
        </div>
      </section>

      <section className="staticSection surface" aria-labelledby="about-mision">
        <h2 id="about-mision">Misión</h2>
        <p className="staticProseSingle">
          Facilitar el acceso a oportunidades laborales dentro de la comunidad de
          Voz de Esperanza, promoviendo el apoyo mutuo, la confianza y el crecimiento
          conjunto.
        </p>
      </section>

      <section className="staticSection surface" aria-labelledby="about-valores">
        <h2 id="about-valores">Valores</h2>
        <ul className="staticValues">
          <li>Comunidad</li>
          <li>Confianza</li>
          <li>Solidaridad</li>
          <li>Trabajo digno</li>
        </ul>
      </section>

      <section className="staticCta surface" aria-labelledby="about-cta">
        <p id="about-cta" className="staticCtaText">
          Creemos en una comunidad donde ayudarnos entre todos hace la diferencia.
        </p>
        <Link className="pill pillPrimary staticCtaBtn" to="/services">
          Explorar servicios
        </Link>
      </section>
    </div>
  )
}

function ComoFuncionaPage() {
  return (
    <div className="staticPage">
      <section className="staticHero" aria-labelledby="como-title">
        <h1 id="como-title">Cómo funciona</h1>
        <p className="staticLead">
          En la comunidad de Voz de Esperanza, facilitamos el encuentro entre
          personas que necesitan ayuda y quienes pueden ofrecer sus servicios.
        </p>
      </section>

      <div className="staticSteps">
        <article className="staticStep surface">
          <h2 className="staticStepTitle">Buscar</h2>
          <p className="staticStepDesc">
            Encontrá profesionales y servicios dentro de la comunidad según lo que
            necesites.
          </p>
        </article>
        <article className="staticStep surface">
          <h2 className="staticStepTitle">Contactar</h2>
          <p className="staticStepDesc">
            Comunicate directamente con la persona que ofrece el servicio de forma
            simple y rápida.
          </p>
        </article>
        <article className="staticStep surface">
          <h2 className="staticStepTitle">Publicar</h2>
          <p className="staticStepDesc">
            Si querés ofrecer un servicio, podés publicarlo fácilmente para que
            otros te encuentren.
          </p>
        </article>
        <article className="staticStep surface">
          <h2 className="staticStepTitle">Crecer juntos</h2>
          <p className="staticStepDesc">
            Cada conexión genera una oportunidad. Así construimos una comunidad más
            fuerte dentro de Voz de Esperanza.
          </p>
        </article>
      </div>

      <section className="staticClosing surface" aria-labelledby="como-cierre">
        <p id="como-cierre" className="staticClosingText">
          Una forma simple de ayudarnos entre todos y generar oportunidades reales.
        </p>
      </section>
    </div>
  )
}

function Drawer({ open, onClose, user, onLoginDemo, onRequestLogout }) {
  const itemGroups = useMemo(() => {
    if (!user) {
      return [
        [
          { label: 'Inicio', to: '/' },
          { label: 'Servicios', to: '/services' },
        ],
        [{ label: 'Publicar servicio', to: '/create' }],
        [
          { label: 'Sobre nosotros', to: '/about' },
          { label: 'Cómo funciona', to: '/como-funciona' },
        ],
        [{ label: 'Iniciar sesión con Google', action: 'login' }],
      ]
    }

    return [
      [
        { label: 'Inicio', to: '/' },
        { label: 'Servicios', to: '/services' },
      ],
      [{ label: 'Publicar servicio', to: '/create' }],
      [
        { label: 'Mi perfil', to: '/profile' },
        { label: 'Mis servicios', to: '/profile#mis-servicios' },
      ],
      [
        { label: 'Sobre nosotros', to: '/about' },
        { label: 'Cómo funciona', to: '/como-funciona' },
      ],
      [{ label: 'Cerrar sesión', action: 'logout' }],
    ]
  }, [user])

  function renderItem(it) {
    if (it.action === 'login' || it.action === 'logout') {
      return (
        <button
          key={it.label}
          className="pill drawerLink"
          type="button"
          onClick={() => {
            if (it.action === 'login') {
              void onLoginDemo()
            } else {
              onRequestLogout()
            }
            onClose()
          }}
        >
          {it.label}
        </button>
      )
    }

    return (
      <Link key={it.label} className="pill drawerLink" to={it.to}>
        {it.label}
      </Link>
    )
  }

  return (
    <>
      <div
        className={`drawerOverlay${open ? ' isOpen' : ''}`}
        role="presentation"
        onClick={onClose}
        aria-hidden={open ? undefined : 'true'}
      />
      <aside
        className={`drawerPanel${open ? ' isOpen' : ''}`}
        aria-label="Menú"
        aria-hidden={open ? undefined : 'true'}
      >
        <div className="drawerHeader">
          <div className="drawerTitle">Menú</div>
          <button className="iconBtn" type="button" onClick={onClose}>
            ✕
          </button>
        </div>
        {user ? (
          <div className="drawerUser">
            <div className="drawerAvatar" aria-hidden="true">
              {user.name.trim().slice(0, 1).toUpperCase()}
            </div>
            <div className="drawerUserMeta">
              <div className="drawerUserName">{user.name}</div>
              <div className="drawerUserEmail">{user.email}</div>
            </div>
          </div>
        ) : null}
        <nav className="drawerNav">
          {itemGroups.map((group, gi) => (
            <Fragment key={gi}>
              {gi > 0 ? (
                <div className="drawerDivider" role="presentation" aria-hidden="true" />
              ) : null}
              <div className="drawerGroup">{group.map((it) => renderItem(it))}</div>
            </Fragment>
          ))}
        </nav>
        <div className="drawerFooter">
          <button className="pill drawerLink" type="button" onClick={onClose}>
            Cerrar menú
          </button>
        </div>
      </aside>
    </>
  )
}

function HeaderUserAvatarBadge({ user }) {
  const [imgFailed, setImgFailed] = useState(false)
  const initial = (
    user?.name?.trim?.() ||
    user?.email?.trim?.() ||
    '?'
  )
    .slice(0, 1)
    .toUpperCase()
  const showPhoto = Boolean(user?.photo) && !imgFailed

  return (
    <div
      className="headerUserAvatarWrap"
      aria-label={user?.name ? `Sesión iniciada: ${user.name}` : 'Sesión iniciada'}
    >
      {showPhoto ? (
        <img
          className="headerUserAvatar"
          src={user.photo}
          alt=""
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="headerUserAvatar headerUserAvatarFallback" aria-hidden="true">
          {initial}
        </div>
      )}
    </div>
  )
}

function Header({ onToggleMenu, isMenuOpen, user }) {
  const logoSrc = useLogoWithoutBlackBackground(LOGO_SRC)
  return (
    <header className="header">
      <div className="container headerInner">
        <Link className="brand" to="/">
          <img
            className="brandLogo"
            src={logoSrc}
            alt=""
            aria-hidden="true"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <span className="brandText">
            <span className="brandName">
              <span className="brandNameFull">Profesionales × Voz de Esperanza</span>
              <span className="brandNameShort" aria-hidden="true">
                Profesionales × Voz…
              </span>
            </span>
            <span className="brandTagline">Comunidad</span>
          </span>
        </Link>

        <nav className="topNav" aria-label="Navegación principal">
          <Link to="/services">Buscar profesionales</Link>
          <Link to="/create">Publicar servicio</Link>
          <Link to="/about">Sobre nosotros</Link>
          <Link to="/como-funciona">Cómo funciona</Link>
        </nav>

        <div className="headerActions">
          {user ? <HeaderUserAvatarBadge user={user} /> : null}
          <button
            className="iconBtn"
            type="button"
            onClick={onToggleMenu}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            <span className="hamburger" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}

function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [authToast, setAuthToast] = useState('')
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [logoutBusy, setLogoutBusy] = useState(false)
  const prevAuthUidRef = useRef(undefined)
  const location = useLocation()

  const updateProfile = useCallback((patch) => {
    setUser((u) => (u ? { ...u, ...patch } : u))
  }, [])

  useEffect(() => {
    if (!drawerOpen) return
    document.body.classList.add('drawer-open')
    return () => {
      document.body.classList.remove('drawer-open')
    }
  }, [drawerOpen])

  // Cerrar el menú lateral en cuanto cambia la URL (evita overlay oscuro atrapado).
  useLayoutEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname, location.hash])

  useLayoutEffect(() => {
    setLogoutConfirmOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!drawerOpen) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      const uid = firebaseUser?.uid ?? null
      if (prevAuthUidRef.current === undefined) {
        prevAuthUidRef.current = uid
        if (firebaseUser) {
          const base = {
            name: firebaseUser.displayName || 'Usuario',
            email: firebaseUser.email || '',
            photo: firebaseUser.photoURL || '',
          }
          setUser(base)
          void (async () => {
            const email = String(base.email || '').trim()
            if (!email) return
            const existing = await getUser(email)
            const ensured =
              existing ??
              (await createUser({
                email,
                name: base.name,
                photo: base.photo,
              }))
            setUser((u) =>
              u && String(u.email) === String(email)
                ? {
                    ...u,
                    name: ensured?.name || u.name,
                    location: ensured?.location || u.location,
                    bio: ensured?.bio || u.bio,
                    photo: ensured?.photo || u.photo,
                  }
                : u,
            )
          })()
        } else {
          setUser(null)
        }
        return
      }
      const prevUid = prevAuthUidRef.current
      prevAuthUidRef.current = uid
      if (firebaseUser) {
        const base = {
          name: firebaseUser.displayName || 'Usuario',
          email: firebaseUser.email || '',
          photo: firebaseUser.photoURL || '',
        }
        setUser(base)
        void (async () => {
          const email = String(base.email || '').trim()
          if (!email) return
          const existing = await getUser(email)
          const ensured =
            existing ??
            (await createUser({
              email,
              name: base.name,
              photo: base.photo,
            }))
          setUser((u) =>
            u && String(u.email) === String(email)
              ? {
                  ...u,
                  name: ensured?.name || u.name,
                  location: ensured?.location || u.location,
                  bio: ensured?.bio || u.bio,
                  photo: ensured?.photo || u.photo,
                }
              : u,
          )
        })()
        if (prevUid === null && uid !== null) {
          setAuthToast('Sesión iniciada correctamente')
        }
      } else {
        setUser(null)
      }
    })
    return () => unsub()
  }, [])

  const loginWithGoogle = useCallback(async () => {
    if (!auth) {
      alert(firebaseInitError || 'Firebase no está configurado.')
      return
    }
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }, [])

  const confirmLogout = useCallback(async () => {
    if (!auth) {
      setLogoutConfirmOpen(false)
      return
    }
    setLogoutBusy(true)
    try {
      await signOut(auth)
      setAuthToast('Sesión cerrada correctamente')
    } finally {
      setLogoutBusy(false)
      setLogoutConfirmOpen(false)
    }
  }, [])

  return (
    <div className="app">
      <Header user={user} isMenuOpen={drawerOpen} onToggleMenu={() => setDrawerOpen((v) => !v)} />
      <main className="page">
        <div className="container">
          {firebaseInitError ? (
            <div className="alert surface" role="alert">
              <div className="alertTitle">Configuración requerida</div>
              <div className="alertDesc">{firebaseInitError}</div>
            </div>
          ) : null}
          <Outlet
            context={{
              user,
              updateProfile,
              onLogin: loginWithGoogle,
              onLogout: () => setLogoutConfirmOpen(true),
            }}
          />
        </div>
      </main>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        onLoginDemo={loginWithGoogle}
        onRequestLogout={() => setLogoutConfirmOpen(true)}
      />
      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Cerrar sesión"
        description="¿Estás seguro de que querés cerrar sesión?"
        cancelLabel="Cancelar"
        confirmLabel="Cerrar sesión"
        destructive
        busy={logoutBusy}
        onCancel={() => {
          if (!logoutBusy) setLogoutConfirmOpen(false)
        }}
        onConfirm={confirmLogout}
      />
      <Toast message={authToast} onClose={() => setAuthToast('')} />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/edit/:id" element={<CreatePage mode="edit" />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/como-funciona" element={<ComoFuncionaPage />} />
      </Route>
    </Routes>
  )
}

export default App
