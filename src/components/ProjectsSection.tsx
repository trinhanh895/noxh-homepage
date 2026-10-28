import { useState } from 'react'
import p1 from '../assets/project-1.jpg'
import p2 from '../assets/project-2.jpg'
import p3 from '../assets/project-3.jpg'
import p4 from '../assets/project-4.jpg'
import p5 from '../assets/project-5.jpg'
import p6 from '../assets/project-6.jpg'
import p7 from '../assets/project-7.jpg'
import { Icon } from './Icon'
import { SolidButton } from './Button'
import { SectionHeader } from './SectionHeader'
import { Skyline } from './Skyline'
import { Marquee } from './Marquee'

// Only one project has a detail page so far; every card links to it.
const PROJECT_DETAIL_HREF = '#/du-an/bat-khoi-bat-trang'

type Project = { title: string; image: string; city: string; summary: string; status?: string }

const projects: Project[] = [
  {
    title: 'Dự án đầu tư xây dựng NOXH Phúc Thịnh tại ô đất ký hiệu II-CT',
    image: p1,
    city: 'Hà Nội',
    summary: 'Căn 45–70 m². Giá và số căn theo thông báo chính thức của dự án.',
    status: 'Đang nhận hồ sơ',
  },
  { title: 'Dự án khu NOXH Tây Cổ Loa', image: p2, city: 'Hà Nội', summary: 'Căn 45–70 m². Giá và số căn theo thông báo chính thức của dự án.' },
  { title: 'Dự án đầu tư xây dựng NOXH tại ô đất ký hiệu NO2', image: p3, city: 'Hà Nội', summary: 'Căn 45–70 m². Giá và số căn theo thông báo chính thức của dự án.' },
  { title: 'Dự án Đầu tư xây dựng Khu NOXH Dược Thượng', image: p4, city: 'Hà Nội', summary: 'Căn 45–70 m². Giá và số căn theo thông báo chính thức của dự án.' },
  { title: 'Dự án xây dựng NOXH tại ô đất VII.3.2', image: p5, city: 'Hà Nội', summary: 'Căn 45–70 m². Giá và số căn theo thông báo chính thức của dự án.' },
  { title: 'Dự án xây dựng NOXH tại ô đất VII.3.2', image: p6, city: 'Hà Nội', summary: 'Căn 45–70 m². Giá và số căn theo thông báo chính thức của dự án.' },
  { title: 'Dự án xây dựng NOXH tại ô đất VII.3.2', image: p7, city: 'Hà Nội', summary: 'Căn 45–70 m². Giá và số căn theo thông báo chính thức của dự án.' },
]

function StatusPill({ p }: { p: Project }) {
  const open = Boolean(p.status)
  return (
    <span
      className={`${open ? 'bg-bg-success-faded text-success-700' : 'bg-white/15 text-white backdrop-blur'} inline-flex items-center gap-2 rounded-pill px-3 py-1 text-s font-semibold`}
    >
      <span className={`${open ? 'bg-success-700' : 'bg-white/70'} size-1.5 rounded-full`} aria-hidden />
      {p.status ?? 'Sắp mở bán'}
    </span>
  )
}

function ExpandedContent({ p, index }: { p: Project; index: number }) {
  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="flex items-center justify-between gap-3">
        <StatusPill p={p} />
        <span className="headline text-l text-warning-500" aria-hidden>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="flex w-full flex-col items-start gap-4">
        <span className="flex items-center gap-2 text-s font-semibold text-primary-50">
          <Icon name="location-dot" className="text-warning-500" />
          {p.city}
        </span>
        <h3 className="headline text-xl capitalize">{p.title}</h3>
        <p className="text-s text-primary-50">{p.summary}</p>
        <div className="pt-1">
          <SolidButton href={PROJECT_DETAIL_HREF} icon="arrow-up-right">
            Tìm hiểu
          </SolidButton>
        </div>
      </div>
    </div>
  )
}

export function ProjectsSection() {
  const [active, setActive] = useState(0)

  return (
    <>
    {/* The city on the horizon: its own band, fading in from above, towers standing just behind the panel's top edge */}
    <div className="relative -mb-6 h-[120px] w-full [mask-image:linear-gradient(to_bottom,transparent,#000_45%)] md:-mb-8 md:h-[200px]" aria-hidden>
      <Skyline className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
    <section
      id="du-an"
      data-reveal="edge"
      className="edge-light relative mx-5 flex w-[calc(100%-40px)] flex-col items-center gap-10 rounded-40 bg-gradient-to-b from-primary-500 to-primary-400 px-5 pt-[120px] pb-[120px] lg:px-20 lg:pt-[200px] lg:pb-[200px]"
    >
      <div className="w-full max-w-[1280px]">
        <SectionHeader eyebrow="Tìm hiểu trước, quyết định sau" lines={['Bắt đầu từ nơi', 'bạn muốn sống']} className="w-full" />
      </div>

      {/* Phones: swipeable row, the next card peeks in so it's obvious there's more */}
      <div className="-mx-5 w-[calc(100%+40px)] md:hidden">
        <ul data-reveal="clip" className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none]" aria-label="Danh sách dự án">
          {projects.map((p, i) => (
            <li key={i} className="relative h-[460px] w-[82%] shrink-0 snap-start overflow-hidden rounded-32 ring-1 ring-white/10">
              <img src={p.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-600 via-primary-600/60 to-primary-600/10" />
              <div className="relative h-full p-6">
                <ExpandedContent p={p} index={i} />
              </div>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-2 px-5 pt-2 text-s text-primary-50">
          <Icon name="arrow-left" size={14} />
          Vuốt để xem {projects.length} dự án
          <Icon name="arrow-right" size={14} />
        </p>
      </div>

      {/* Wider screens: the Figma accordion — hover, click or focus opens a card */}
      <div data-reveal="clip" className="hidden h-[519px] w-full max-w-[1600px] gap-4 md:flex lg:gap-5">
        {projects.map((p, i) => {
          const isActive = i === active
          return (
            <article
              key={i}
              aria-label={p.title}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              onFocus={() => setActive(i)}
              tabIndex={0}
              className={`group relative flex h-full cursor-pointer overflow-hidden rounded-32 outline-none transition-[flex-basis,flex-grow,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2 focus-visible:ring-warning-500 ${
                isActive ? 'shrink-0 grow-0 basis-[420px] xl:basis-[519px] shadow-[0_24px_60px_rgb(0_0_0/0.35)] ring-1 ring-warning-500/40' : 'min-w-0 basis-0 grow ring-1 ring-white/10'
              }`}
            >
              <img
                src={p.image}
                alt=""
                loading="lazy"
                className={`pointer-events-none absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-out ${isActive ? 'scale-100' : 'scale-110 group-hover:scale-[1.04]'}`}
              />
              {/* green-tinted gradient instead of a flat grey overlay: photos stay alive, text stays readable */}
              <div
                className={`absolute inset-0 transition-opacity duration-700 ${
                  isActive ? 'bg-gradient-to-t from-primary-600 via-primary-600/60 to-primary-600/5' : 'bg-gradient-to-t from-primary-600/95 via-primary-600/70 to-primary-600/45'
                }`}
              />

              {isActive ? (
                <div className="relative flex w-full p-8 lg:p-10">
                  <ExpandedContent p={p} index={i} />
                </div>
              ) : (
                <div className="relative flex w-full flex-col items-center justify-between py-6" aria-hidden>
                  <span className="headline text-l text-warning-500">{String(i + 1).padStart(2, '0')}</span>
                  <p className="headline line-clamp-1 max-h-[300px] rotate-180 text-l leading-tight capitalize [writing-mode:vertical-rl] xl:line-clamp-2">{p.title}</p>
                  <span className="flex flex-col items-center gap-3">
                    <span className={`${p.status ? 'bg-success-700 ring-bg-success-faded' : 'bg-white/60 ring-white/20'} size-2 rounded-full ring-4`} />
                    <span className="flex size-9 items-center justify-center rounded-full border border-white/30 transition-colors group-hover:border-warning-500 group-hover:text-warning-500">
                      <Icon name="plus" size={16} />
                    </span>
                  </span>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
    <Marquee items={['Bát Khối – Bát Tràng', 'Phúc Thịnh', 'Tây Cổ Loa', 'Dược Thượng', 'Ô đất NO2', 'Ô đất VII.3.2']} />
    </>
  )
}
