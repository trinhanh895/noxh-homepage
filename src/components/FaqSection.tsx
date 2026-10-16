import { useState, type CSSProperties, type ReactNode } from 'react'
import { Icon } from './Icon'
import { LinkButton } from './Button'
import { SectionHeader } from './SectionHeader'
import { routes, withParams } from '../routes'

const link = 'font-semibold text-warning-500 underline underline-offset-2'

/* The questions anxious applicants actually ask — each answer starts with a plain yes/no */
const faqs: { q: string; a: ReactNode }[] = [
  {
    q: 'NOX có thu phí không?',
    a: 'Không. NOX miễn phí hoàn toàn. Nếu ai đó nhân danh NOX đòi tiền, đó là lừa đảo.',
  },
  {
    q: 'NOX có nộp hồ sơ thay tôi không?',
    a: 'Không. Bạn tự nộp theo kênh ghi trong thông báo của dự án. NOX giúp bạn chuẩn bị, và tư vấn viên có thể xem lại cùng bạn trước khi nộp.',
  },
  {
    q: 'Có “suất ngoại giao” hay cách nào chắc chắn được mua không?',
    a: 'Không. Không có suất ngoại giao hay suất nội bộ. Khi số hồ sơ nhiều hơn số căn, người mua được chọn theo quy định của dự án (thường là bốc thăm).',
  },
  {
    q: 'Làm sao biết tôi có đủ điều kiện?',
    a: (
      <>
        Bạn cần đủ 3 nhóm điều kiện: thuộc nhóm được mua, điều kiện nhà ở và điều kiện thu nhập.{' '}
        <a href={withParams(routes.assistant, { guide: '1' })} className={link}>
          Trả lời 3 câu với trợ lý
        </a>{' '}
        để xem hướng chuẩn bị — kết quả chỉ để tham khảo.
      </>
    ),
  },
  {
    q: 'Tôi có cần khai hết thông tin ngay không?',
    a: 'Không. Bạn có thể bắt đầu khi chưa có giấy tờ nào, làm từng phần và quay lại sau.',
  },
  {
    q: 'Thông tin của tôi được lưu ở đâu?',
    a: (
      <>
        Trên điện thoại hoặc máy tính bạn đang dùng. NOX không gửi những thông tin này đi đâu.{' '}
        <a href={routes.privacy} className={link}>
          Tìm hiểu thêm
        </a>
      </>
    ),
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="cau-hoi" tabIndex={-1} className="relative isolate flex w-full scroll-mt-4 justify-center px-4 pb-24 outline-none sm:px-5 lg:pb-[200px]">
      <div className="flex w-full max-w-[1280px] flex-col gap-10 md:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <SectionHeader size="l" eyebrow="Để bạn yên tâm bắt đầu" lines={['Câu hỏi', 'thường gặp']} />
          <div className="hidden md:block">
            <LinkButton href={routes.assistant}>Hỏi trợ lý câu khác</LinkButton>
          </div>
        </div>

        <ul data-reveal style={{ '--reveal-delay': '120ms' } as CSSProperties} className="flex flex-1 flex-col">
          {faqs.map((f, i) => {
            const isOpen = open === i
            const panel = `faq-${i}`
            return (
              <li key={f.q} className="border-b border-white/15 last:border-b-0">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    className="flex min-h-16 w-full cursor-pointer items-center gap-3 py-3 text-left text-l font-medium hover:text-warning-500"
                  >
                    <Icon name="caret-right" className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                    {f.q}
                  </button>
                </h3>
                <div id={panel} hidden={!isOpen} className="pb-5 pl-7 text-m text-primary-50">
                  {f.a}
                </div>
              </li>
            )
          })}
        </ul>

        <div className="md:hidden">
          <LinkButton href={routes.assistant}>Hỏi trợ lý câu khác</LinkButton>
        </div>
      </div>
    </section>
  )
}
