import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { GlassButton, LinkButton } from './Button'
import { SectionHeader } from './SectionHeader'
import { journeySteps } from '../data/journey'
import { findProject } from '../data/projects'
import { readDrafts } from '../lib/store'
import { routes, withParams } from '../routes'

/* Scroll progress through the list as a CSS var (--p, 0 to 1), rAF-throttled; and which step is at mid-screen */
function useStepProgress() {
  const ref = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(-1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--p', '1')
      setActive(journeySteps.length)
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (innerHeight * 0.55 - r.top) / r.height))
      el.style.setProperty('--p', p.toFixed(3))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step))
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    el.querySelectorAll('[data-step]').forEach((li) => io.observe(li))
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])
  return { ref, active }
}

export function StepsSection() {
  const { ref, active } = useStepProgress()
  const draft = readDrafts()[0]
  const project = draft && findProject(draft.projectId)
  const done = draft ? draft.docs.filter((d) => d.status === 'done').length : 0

  return (
    <section id="hanh-trinh" className="relative isolate flex w-full justify-center px-5 py-[120px] lg:px-20 lg:py-[200px]">
      <div className="grid w-full max-w-[1280px] grid-cols-1 gap-12 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-24">
        {/* One message, one action */}
        <div className="relative isolate flex flex-col items-start gap-8 lg:sticky lg:top-12 lg:self-start">
          {/* soft breeze-block motif behind the heading */}
          <div aria-hidden className="bg-breeze pointer-events-none absolute -top-16 -left-20 -z-10 h-[360px] w-[520px]" style={{ opacity: 0.18 }} />
          <div>
            <SectionHeader
              size="l"
              eyebrow="Không cần hoàn thành trong một lần"
              lines={['Mỗi lần,', 'một bước rõ ràng']}
              description="Từ tìm dự án đến tự nộp hồ sơ. Bạn có thể dừng ở bất kỳ bước nào và quay lại sau."
            />
          </div>
          <div data-reveal style={{ '--reveal-delay': '120ms' } as CSSProperties} className="flex flex-col items-start gap-5">
            {draft && (
              <p className="text-m text-primary-50">
                Hồ sơ {project?.name}: <strong className="font-semibold text-white">đã có {done}/{draft.docs.length} giấy tờ</strong>
              </p>
            )}
            {draft ? (
              <GlassButton icon="arrow-right" href={withParams(routes.profile, { draft: draft.id })}>
                Tiếp tục hồ sơ
              </GlassButton>
            ) : (
              <GlassButton icon="list-check" href={withParams(routes.assistant, { guide: '1' })}>
                Bắt đầu với 3 câu hỏi
              </GlassButton>
            )}
            <LinkButton href={routes.journey}>Xem chi tiết từng bước</LinkButton>
          </div>
        </div>

        {/* Same rhythm for every step: number · title · one line */}
        <ol ref={ref} className="relative flex flex-col">
          {/* rail + gold fill that follows scroll */}
          <span aria-hidden className="absolute top-3 bottom-3 left-[27px] w-0.5 rounded bg-white/12 md:left-[31px]" />
          <span
            aria-hidden
            className="absolute top-3 bottom-3 left-[27px] w-0.5 origin-top rounded bg-warning-500 md:left-[31px]"
            style={{ transform: 'scaleY(var(--p, 0))' }}
          />
          {journeySteps.map((s, i) => {
            const lit = i <= active
            return (
              <li
                key={s.title}
                data-step={i}
                data-reveal
                style={{ '--reveal-delay': `${i * 80}ms` } as CSSProperties}
                className="relative grid grid-cols-[56px_1fr] items-start gap-x-6 pb-12 last:pb-0 md:grid-cols-[64px_1fr] md:gap-x-8 md:pb-14"
              >
                <span
                  aria-hidden
                  className={`${lit ? 'border-warning-500 bg-warning-500 text-primary-600' : 'border-warning-500/50 bg-primary-500 text-warning-500'} headline relative z-[1] flex size-14 items-center justify-center rounded-pill border text-headline-2xs transition-colors duration-500 md:size-16 md:text-headline-xs`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className={`${lit ? '' : 'lg:opacity-55'} flex flex-col gap-2 pt-2 transition-opacity duration-500 md:pt-3`}>
                  <h3 className="text-xl font-semibold">
                    <span className="sr-only">Bước {i + 1}: </span>
                    {s.title}
                  </h3>
                  <p className="max-w-[520px] text-m text-primary-50">{s.body}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
