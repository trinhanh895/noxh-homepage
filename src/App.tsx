import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { SupportSection } from './components/SupportSection'
import { ProjectsSection } from './components/ProjectsSection'
import { StepsSection } from './components/StepsSection'
import { NewsSection } from './components/NewsSection'
import { FaqSection } from './components/FaqSection'
import { CommitmentsSection } from './components/CommitmentsSection'
import { Footer } from './components/Footer'
import { Icon } from './components/Icon'
import { ProjectDetail } from './pages/ProjectDetail'
import { Journey } from './pages/Journey'
import { Assistant } from './pages/Assistant'
import { Profile } from './pages/Profile'
import { Advisor } from './pages/Advisor'
import { Privacy } from './pages/Privacy'
import { QrLanding } from './pages/QrLanding'
import { Login } from './pages/Login'
import { Dossier } from './pages/Dossier'
import { routes } from './routes'
import { ChatPanel } from './components/chat/ChatPanel'

/*
 * Hash routing: "#/<page>" opens a page (query after "?" is page state, e.g. "#/tro-ly?prj=…");
 * any other hash ("#du-an", "#tin-tuc"…) is a section anchor on the home page.
 */
function useHash() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

// The floating assistant button would cover the footer's "back to top" button, so hide it there.
function useFooterVisible(dep: string) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(footer)
    return () => io.disconnect()
  }, [dep])
  return visible
}

/* Marks [data-reveal] blocks as revealed once they scroll into view (CSS does the fade-up, once) */
function useScrollReveal(dep: string) {
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')]
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => (el.dataset.revealed = ''))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          ;(e.target as HTMLElement).dataset.revealed = ''
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [dep])
}

function Page({ path }: { path: string }) {
  if (path.startsWith('#/du-an/')) return <ProjectDetail />
  if (path === routes.journey) return <Journey />
  if (path === routes.assistant) return <Assistant />
  if (path === routes.profile) return <Profile />
  if (path === routes.advisor) return <Advisor />
  if (path === routes.privacy) return <Privacy />
  if (path === routes.login) return <Login />
  return (
    <main id="noi-dung" tabIndex={-1} className="flex w-full flex-col items-center outline-none">
      <Hero />
      <SupportSection />
      <ProjectsSection />
      <StepsSection />
      <CommitmentsSection />
      <NewsSection />
      <FaqSection />
    </main>
  )
}

export default function App() {
  const hash = useHash()
  const path = hash.split('?')[0]
  const qr = /^#\/qr\/([^/]+)(\/ho-so)?$/.exec(path)
  const isPage = path.startsWith('#/')
  const isDetail = path.startsWith('#/du-an/')
  const footerVisible = useFooterVisible(path)
  useScrollReveal(path)

  // New page → start at the top; anchor on the home page → scroll to it once rendered.
  useEffect(() => {
    if (isPage) {
      window.scrollTo(0, 0)
      return
    }
    const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null
    target?.scrollIntoView()
  }, [path, hash, isPage])

  // Opened from a QR on the investor's brochure or slides: a standalone screen, no site header, footer or floating assistant
  if (qr)
    return (
      <>
        {qr[2] ? <Dossier slug={qr[1]} /> : <QrLanding slug={qr[1]} />}
        <ChatPanel hideLauncher />
      </>
    )

  return (
    <>
      <div id="top" className="relative flex min-h-screen flex-col items-center overflow-x-clip pt-20">
        <Header current={path} />
        <Page key={path} path={path} />
        {/* Work screens (journey, assistant, dossier) run full height without the marketing footer */}
        {![routes.assistant, routes.journey, routes.profile].includes(path) && <Footer />}
        {/* room for the project page's fixed action bar on phones */}
        {isDetail && <div className="h-28 lg:hidden" aria-hidden />}

        {/* The floating chat: hidden on the assistant page itself; the launcher steps aside over the footer and
            above the project page's action bar on phones */}
        {path !== routes.assistant && <ChatPanel hideLauncher={footerVisible} launcherClass={isDetail ? 'max-lg:hidden' : ''} />}
      </div>
    </>
  )
}
