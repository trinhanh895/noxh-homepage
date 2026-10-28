import type { CSSProperties } from 'react'
import { Icon } from './Icon'
import { SectionHeader } from './SectionHeader'

const does = [
  'Miễn phí hoàn toàn, mọi lúc.',
  'Cho bạn biết cần giấy tờ gì, xin ở đâu.',
  'Tư vấn viên xem lại hồ sơ cùng bạn.',
  'Thông tin dự án ghi rõ nguồn và ngày cập nhật.',
]

const doesNot = [
  'Không thu bất kỳ khoản phí nào.',
  'Không nộp hồ sơ thay bạn.',
  'Không nhận giữ suất. Không có “suất ngoại giao”, “suất nội bộ”.',
  'Không quyết định ai được mua — đó là việc của cơ quan xét duyệt và chủ đầu tư.',
]

// One padding and one gap for the two cards and the warning banner, so the three blocks line up
const PAD = 'p-6 md:px-10 md:py-8'

/* Says plainly what NOX does and does not do — the home page's trust anchor */
export function CommitmentsSection() {
  return (
    <section
      id="cam-ket"
      tabIndex={-1}
      aria-labelledby="cam-ket-title"
      className="relative isolate flex w-full scroll-mt-4 justify-center px-4 pt-24 pb-24 outline-none sm:px-5 lg:px-20 lg:pt-[160px] lg:pb-[200px]"
    >
      {/* The dark band's top is one smooth arc (cubic curve, ends meeting the sides at an angle — no kink, no flat top),
          then the band fades out at the bottom. Replaces an elliptical border-radius that looked dented. */}
      <svg
        aria-hidden
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80px] w-full md:h-[120px]"
      >
        <path d="M0 120 C 260 -40 740 -40 1000 120 Z" fill="var(--color-primary-600)" />
      </svg>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[79px] bottom-0 -z-10 bg-gradient-to-b from-primary-600 from-70% to-transparent md:top-[119px]" />
      <div className="flex w-full max-w-[1280px] flex-col gap-10">
        <div id="cam-ket-title">
          <SectionHeader size="l" eyebrow="Để bạn yên tâm" lines={['NOX làm gì,', 'không làm gì']} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div data-reveal className={`surface-light flex flex-col gap-5 rounded-32 bg-white text-text-neutral-primary ${PAD}`}>
              <h3 className="flex items-center gap-3 text-l font-semibold">
                <span className="flex size-10 items-center justify-center rounded-pill bg-bg-success-faded text-success-700" aria-hidden>
                  <Icon name="check" variant="solid" />
                </span>
                NOX làm
              </h3>
              <ul className="flex flex-col gap-3">
                {does.map((t) => (
                  <li key={t} className="flex gap-3 text-m">
                    <Icon name="circle-check" className="mt-1 shrink-0 text-success-700" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div
              data-reveal
              style={{ '--reveal-delay': '120ms' } as CSSProperties}
              className={`flex flex-col gap-5 rounded-32 bg-primary-500 ring-1 ring-white/10 ${PAD}`}
            >
              <h3 className="flex items-center gap-3 text-l font-semibold">
                <span className="flex size-10 items-center justify-center rounded-pill bg-warning-500 text-primary-600" aria-hidden>
                  <Icon name="xmark" variant="solid" />
                </span>
                NOX không làm
              </h3>
              <ul className="flex flex-col gap-3">
                {doesNot.map((t) => (
                  <li key={t} className="flex gap-3 text-m">
                    <Icon name="circle-xmark" className="mt-1 shrink-0 text-warning-500" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* the one light cone on the page, pointed at the warning */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[70%] bg-[conic-gradient(from_200deg_at_20%_-10%,transparent,rgb(246_190_94/0.10)_8deg,transparent_22deg)]"
          />
          <div
            data-reveal="edge"
            className={`edge-light relative flex flex-col items-start gap-5 rounded-32 bg-warning-500 text-primary-600 [--focus-ring:var(--color-primary-600)] md:flex-row md:items-center md:gap-8 ${PAD}`}
          >
            <Icon name="shield-exclamation" size={36} className="shrink-0" />
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-l font-semibold">Ai đòi tiền để giữ suất hay “chạy” hồ sơ là lừa đảo</p>
              <p className="text-m">Chỉ nộp hồ sơ theo kênh ghi trong thông báo chính thức. Nghi bị lừa, hãy báo công an nơi gần nhất.</p>
            </div>
            <a
              href="https://dichvucong.gov.vn"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-pill bg-primary-600 px-6 text-m font-semibold whitespace-nowrap text-white hover:bg-primary-500"
            >
              Cổng Dịch vụ công <Icon name="arrow-up-right" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
