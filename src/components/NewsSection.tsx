import type { CSSProperties } from 'react'
import { SolidButton } from './Button'
import { Icon } from './Icon'
import { SectionHeader } from './SectionHeader'
import news1 from '../assets/news-1.jpg'
import news2 from '../assets/news-2.jpg'
import news3 from '../assets/news-3.jpg'

type Kind = 'intake' | 'scam' | 'planning'

const KIND: Record<Kind, { label: string; icon: string; cls: string }> = {
  intake: { label: 'Mở nhận hồ sơ', icon: 'folder-open', cls: 'bg-bg-success-faded text-success-700' },
  scam: { label: 'Cảnh báo lừa đảo', icon: 'shield-exclamation', cls: 'bg-warning-500 text-primary-600' },
  planning: { label: 'Tiến độ dự án', icon: 'helmet-safety', cls: 'bg-white text-text-neutral-primary' },
}

/*
 * Sample items (placeholder until a real news feed exists). Each links to the source's
 * official site rather than to an article page NOX doesn't have.
 */
const news: { kind: Kind; date: string; source: string; url: string; title: string; excerpt: string; image: string }[] = [
  {
    kind: 'intake',
    date: '21/09/2026',
    source: 'Sở Xây dựng Hà Nội',
    url: 'https://soxaydung.hanoi.gov.vn',
    title: 'Kế hoạch nhận hồ sơ mua nhà ở xã hội tại Bát Khối – Bát Tràng',
    excerpt: 'Nhận hồ sơ đến hết ngày 11/11/2026 tại điểm tiếp nhận ghi trong thông báo của chủ đầu tư.',
    image: news1,
  },
  {
    kind: 'scam',
    date: '08/10/2026',
    source: 'Công an TP Hà Nội',
    url: 'https://congan.hanoi.gov.vn',
    title: 'Cảnh báo chiêu rao bán “suất ngoại giao” nhà ở xã hội trên mạng',
    excerpt: 'Không có suất ngoại giao hay suất nội bộ. Không chuyển tiền đặt cọc, phí hồ sơ cho người trung gian.',
    image: news2,
  },
  {
    kind: 'planning',
    date: '15/07/2026',
    source: 'UBND xã Bát Tràng',
    url: 'https://hanoi.gov.vn',
    title: 'Bát Tràng họp gỡ vướng, đẩy nhanh quy hoạch khu nhà ở xã hội',
    excerpt: 'Xã thống nhất cách tháo gỡ khó khăn khi lập quy hoạch chi tiết 1/500 cho khu nhà ở xã hội tập trung.',
    image: news3,
  },
]

export function NewsSection() {
  return (
    <section id="tin-tuc" className="flex w-full justify-center px-4 pb-24 sm:px-5 lg:pb-[200px]">
      <div className="flex w-full max-w-[1280px] flex-col gap-10">
        <div>
        <SectionHeader
          size="l"
          eyebrow="Tin mới, có nguồn rõ ràng"
          lines={['Tin tức & sự kiện']}
          description="Tin mẫu để minh hoạ — mỗi tin ghi ngày và nguồn, bấm để mở trang chính thức của nguồn đó."
        />
        </div>

        <ul className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {news.map((n, i) => {
            const k = KIND[n.kind]
            return (
              <li key={n.title} data-reveal style={{ '--reveal-delay': `${i * 110}ms` } as CSSProperties}>
                <article className="flex h-full flex-col gap-5">
                  <div data-reveal="clip" style={{ '--reveal-delay': `${i * 110}ms` } as CSSProperties} className="relative overflow-hidden rounded-24">
                    <img src={n.image} alt="" loading="lazy" className="aspect-video w-full rounded-24 bg-placeholder object-cover" />
                    <span className={`${k.cls} absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-12 px-2.5 py-1 text-s font-semibold`}>
                      <Icon name={k.icon} size={12} />
                      {k.label}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col items-start gap-3 px-1 md:px-4">
                    <p className="text-s text-primary-50">
                      <time>{n.date}</time> · {n.source}
                    </p>
                    <h3 className="text-l font-semibold">{n.title}</h3>
                    <p className="text-m text-primary-50">{n.excerpt}</p>
                    <div className="mt-auto pt-2">
                      <SolidButton href={n.url} external>
                        Trang {n.source}
                      </SolidButton>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
