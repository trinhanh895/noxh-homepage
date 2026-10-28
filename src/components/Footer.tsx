import glowBottom from '../assets/glow-bottom.svg'
import glowLeft from '../assets/glow-left.svg'
import { GlassButton } from './Button'
import { Icon } from './Icon'
import { routes } from '../routes'

// TODO: thay bằng thông tin liên hệ thật
const contact = {
  hotline: '1900 xxxx',
  email: 'hotro@nox.example',
  address: 'Hà Nội, Việt Nam',
}

const columns = [
  {
    title: 'Khám phá',
    links: [
      { label: 'Dự án', href: '#du-an' },
      { label: 'Hành trình', href: routes.journey },
      { label: 'Trợ lý NOXH', href: routes.assistant },
      { label: 'Tin tức & sự kiện', href: '#tin-tuc' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Câu hỏi thường gặp', href: routes.faq },
      { label: 'Hướng dẫn chuẩn bị hồ sơ', href: routes.journey },
      { label: 'Nhờ tư vấn viên', href: routes.advisor },
      { label: 'Hồ sơ của tôi', href: routes.profile },
    ],
  },
]

export function Footer() {
  return (
    <footer className="w-full px-5 pb-5">
      <div className="relative flex min-h-[884px] w-full flex-col overflow-hidden rounded-40 bg-primary-600 px-6 pt-16 pb-8 lg:px-20 lg:pt-[120px]">
        <img src={glowBottom} alt="" width={600} height={4} className="absolute top-[-2px] left-1/2 -translate-x-1/2" />
        <img src={glowLeft} alt="" width={2} height={400} className="absolute top-[73px] left-[19px]" />

        <div className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-16">
          {/* CTA */}
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="flex flex-col gap-4">
              <p className="text-s text-warning-500 uppercase">Sẵn sàng khi bạn sẵn sàng</p>
              <h2 className="headline text-headline-l capitalize lg:text-headline-xl">
                <span className="block">An cư bắt đầu</span>
                <span className="block">từ một câu hỏi</span>
              </h2>
            </div>
            <div className="flex max-w-[420px] flex-col gap-6">
              <p className="text-l text-primary-50">Hỏi trợ lý bất cứ lúc nào, hoặc để tư vấn viên cùng bạn xem lại hồ sơ.</p>
              <div className="flex flex-wrap gap-4">
                <GlassButton icon="sparkles" href={routes.assistant}>
                  Hỏi trợ lý NOXH
                </GlassButton>
                <GlassButton tone="neutral" icon="buildings" iconVariant="regular" href={routes.projects}>
                  Khám phá dự án
                </GlassButton>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 gap-10 border-t border-white/15 pt-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div className="flex flex-col gap-5">
              <a href={routes.home} className="flex min-h-11 w-fit items-center gap-2" aria-label="NOX — Trang chủ">
                <span className="size-6 bg-white" aria-hidden />
                <span className="headline text-xl capitalize">NOX</span>
              </a>
              <p className="max-w-[320px] text-s text-primary-50">
                Đồng hành cùng bạn từ tìm hiểu dự án nhà ở xã hội đến chuẩn bị hồ sơ — rõ ràng, từng bước.
              </p>
            </div>

            {columns.map((c) => (
              <nav key={c.title} aria-label={c.title} className="flex flex-col gap-1">
                <p className="mb-2 text-s text-warning-500 uppercase">{c.title}</p>
                {c.links.map((l) => (
                  <a key={l.label} href={l.href} data-nav className="inline-flex min-h-11 w-fit items-center text-m transition hover:text-warning-500">
                    {l.label}
                  </a>
                ))}
              </nav>
            ))}

            <div className="flex flex-col gap-1">
              <p className="mb-2 text-s text-warning-500 uppercase">Liên hệ</p>
              <a href={`tel:${contact.hotline}`} className="flex min-h-11 items-center gap-3 text-m hover:text-warning-500">
                <Icon name="phone" className="text-warning-500" />
                {contact.hotline}
              </a>
              <a href={`mailto:${contact.email}`} className="flex min-h-11 items-center gap-3 text-m hover:text-warning-500">
                <Icon name="envelope" className="text-warning-500" />
                {contact.email}
              </a>
              <p className="flex min-h-11 items-center gap-3 text-m">
                <Icon name="location-dot" className="text-warning-500" />
                {contact.address}
              </p>
            </div>
          </div>

          {/* Wordmark */}
          <p
            aria-hidden
            className="headline pointer-events-none mt-auto bg-gradient-to-b from-primary-400 to-primary-600 bg-clip-text text-center text-[clamp(96px,22vw,340px)] leading-[0.8] text-transparent capitalize select-none"
          >
            NOXH
          </p>
        </div>

        {/* Bottom bar */}
        <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-4 border-t border-white/15 pt-6 text-s text-primary-50 md:flex-row md:items-center md:justify-between">
          <p>© 2026 NOX. Thông tin trên NOX để tham khảo, không thay cho kết luận của cơ quan xét duyệt.</p>
          <div className="flex items-center gap-6">
            <a href={routes.privacy} className="inline-flex min-h-11 items-center hover:text-white">
              Quyền riêng tư
            </a>
            <a
              href="#top"
              aria-label="Lên đầu trang"
              className="flex size-11 items-center justify-center rounded-pill bg-white text-text-neutral-primary transition hover:bg-warning-500"
            >
              <Icon name="arrow-up" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
