import { useEffect, useRef } from 'react'

/* Endless band of project names. Plays only while visible; with reduced motion it becomes a static wrapped list. */
export function Marquee({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.dataset.playing = ''
      else delete el.dataset.playing
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const row = (copy: boolean) =>
    items.map((name, i) => (
      <span key={`${copy}-${name}`} aria-hidden={copy || undefined} className={`${copy ? 'marquee-copy' : ''} flex items-center gap-12`}>
        <span
          className={`headline text-[40px] leading-[1.3] whitespace-nowrap uppercase md:text-[72px] ${
            i % 2 ? 'text-transparent [-webkit-text-stroke:1px_rgb(246_190_94/0.6)]' : 'text-white/90'
          }`}
        >
          {name}
        </span>
        <span className="text-xl text-warning-500" aria-hidden>
          ✦
        </span>
      </span>
    ))

  return (
    <div ref={ref} className="marquee w-full pt-16 lg:pt-24" role="marquee" aria-label="Các dự án trên NOX">
      <div className="marquee-track gap-12">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
