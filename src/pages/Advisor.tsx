import { useRef, useState } from 'react'
import { PrimaryButton } from '../components/Button'
import { Icon } from '../components/Icon'
import { Notice, PageHeader, PageShell } from '../components/Page'
import { Select } from '../components/Select'
import { TextField } from '../components/TextField'
import { findProject, projectSummaries } from '../data/projects'
import { clearHandoff, KEYS, readHandoff } from '../lib/store'
import { readStored, writeStored } from '../lib/usePersistentState'
import { readAccount } from '../lib/account'
import { hashParams, routes } from '../routes'

// TODO: thay bằng hotline thật (giống Footer)
const HOTLINE = '1900 xxxx'

type Channel = 'call' | 'zalo'
type Errors = Partial<Record<'phone' | 'consent', string>>

export function Advisor() {
  const [name, setName] = useState('')
  // Signed in: the account's number is filled in (still editable)
  const [phone, setPhone] = useState(() => readAccount()?.phone ?? '')
  const [channel, setChannel] = useState<Channel>('call')
  const [projectId, setProjectId] = useState(() => findProject(hashParams().get('prj'))?.id ?? projectSummaries[0].id)
  const [message, setMessage] = useState(readHandoff)
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [sentCode, setSentCode] = useState<string | null>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  const submit = () => {
    const digits = phone.replace(/[\s.-]/g, '')
    const next: Errors = {}
    if (!digits) next.phone = 'Nhập số điện thoại để tư vấn viên liên hệ lại.'
    else if (!/^0\d{9}$/.test(digits)) next.phone = 'Số điện thoại gồm 10 chữ số, bắt đầu bằng số 0. Ví dụ: 0912 345 678.'
    if (!consent) next.consent = 'Bạn cần đồng ý để tư vấn viên được liên hệ với bạn.'
    setErrors(next)
    if (Object.keys(next).length) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    const code = `NOX-${String(Date.now()).slice(-6)}`
    const requests = readStored<unknown[]>(KEYS.requests, [])
    writeStored(KEYS.requests, [...requests, { code, name, phone: digits, channel, projectId, message, createdAt: new Date().toISOString() }])
    clearHandoff()
    setSentCode(code)
    window.scrollTo(0, 0)
  }

  if (sentCode) {
    const p = findProject(projectId)
    return (
      <PageShell width={720}>
        <div className="flex flex-col items-start gap-5 rounded-32 bg-primary-500 p-6 text-white md:p-10" role="status">
          <span className="flex size-14 items-center justify-center rounded-pill bg-warning-500 text-primary-600" aria-hidden>
            <Icon name="check" size={24} />
          </span>
          <h1 className="headline text-headline-m uppercase">Đã ghi nhận yêu cầu</h1>
          <p className="text-l">
            Mã yêu cầu của bạn: <strong className="font-semibold text-warning-500">{sentCode}</strong>
          </p>
        </div>

        <Notice tone="warning">
          <strong className="font-semibold">Đây là bản thử nghiệm.</strong>
          <span>
            Yêu cầu mới chỉ lưu trên máy này, chưa được gửi tới tư vấn viên. Nếu cần gấp, gọi{' '}
            <a href={`tel:${HOTLINE}`} className="font-semibold underline">
              {HOTLINE}
            </a>
            .
          </span>
        </Notice>

        <section className="flex flex-col gap-4">
          <h2 className="headline text-xl uppercase">Điều gì xảy ra tiếp theo</h2>
          <ol className="flex flex-col gap-4">
            {[
              `Tư vấn viên ${channel === 'zalo' ? 'nhắn Zalo' : 'gọi'} cho bạn trong giờ hành chính, thường trong 1–2 ngày làm việc.`,
              `Hai bên cùng xem lại hồ sơ${p ? ` cho ${p.name}` : ''}: giấy nào đã đủ, giấy nào cần bổ sung.`,
              'Bạn tự nộp hồ sơ theo kênh chính thức của dự án. NOX không thu tiền và không nộp hộ.',
            ].map((t, i) => (
              <li key={t} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-pill border-2 border-primary-500 text-s font-bold text-primary-500">
                  {i + 1}
                </span>
                <span className="pt-1.5 text-m">{t}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimaryButton href={routes.profile} icon="folder-open" iconVariant="regular">
            Về Hồ sơ của tôi
          </PrimaryButton>
          <PrimaryButton variant="outlined" href={routes.assistant} icon="sparkles">
            Hỏi trợ lý trong lúc chờ
          </PrimaryButton>
        </div>
      </PageShell>
    )
  }

  const errorList = Object.entries(errors) as [keyof Errors, string][]

  return (
    <PageShell width={720}>
      <PageHeader
        eyebrow="Miễn phí"
        lines={['Nhờ tư vấn viên']}
        description="Để lại số điện thoại, tư vấn viên NOX sẽ liên hệ để cùng bạn xem lại hồ sơ. NOX không thu bất kỳ khoản phí nào."
      />

      <Notice tone="warning">
        <strong className="font-semibold">Bản thử nghiệm:</strong>
        <span>
          yêu cầu chỉ lưu trên máy này, chưa được gửi đi. Cần gấp, hãy gọi{' '}
          <a href={`tel:${HOTLINE}`} className="font-semibold underline">
            {HOTLINE}
          </a>
          .
        </span>
      </Notice>

      {errorList.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="loi-tieu-de"
          className="flex flex-col gap-3 rounded-24 border-2 border-danger-600 p-5"
        >
          <h2 id="loi-tieu-de" className="text-l font-semibold">
            Cần sửa {errorList.length} chỗ trước khi gửi
          </h2>
          <ul className="flex flex-col gap-1">
            {errorList.map(([k, msg]) => (
              <li key={k}>
                <a
                  href={`#truong-${k}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(`truong-${k}`)?.querySelector<HTMLElement>('input')?.focus()
                  }}
                  className="text-m font-semibold text-danger-600 underline underline-offset-2"
                >
                  {msg}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="flex flex-col gap-6"
      >
        <TextField label="Tên của bạn" optional autoComplete="name" value={name} onChange={setName} />

        <div id="truong-phone">
          <TextField
            label="Số điện thoại"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            hint={readAccount() ? "Số của tài khoản bạn đang đăng nhập. Tư vấn viên chỉ dùng số này để liên hệ về hồ sơ." : "Tư vấn viên chỉ dùng số này để liên hệ về hồ sơ."}
            placeholder="0912 345 678"
            value={phone}
            error={errors.phone}
            onChange={(v) => {
              setPhone(v)
              if (errors.phone) setErrors({ ...errors, phone: undefined })
            }}
          />
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-s font-medium">Bạn muốn được liên hệ qua</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['call', 'Gọi điện', 'phone'],
                ['zalo', 'Nhắn Zalo', 'comment-dots'],
              ] as const
            ).map(([v, label, icon]) => (
              <label
                key={v}
                className={`${channel === v ? 'border-primary-500 bg-primary-25' : 'border-border-input hover:border-primary-500'} inline-flex min-h-12 cursor-pointer items-center gap-3 rounded-pill border px-5 text-m font-medium has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--focus-ring)`}
              >
                <input type="radio" name="channel" value={v} checked={channel === v} onChange={() => setChannel(v)} className="sr-only" />
                <span className={`${channel === v ? 'border-primary-500' : 'border-border-input'} flex size-5 items-center justify-center rounded-full border-2`} aria-hidden>
                  {channel === v && <span className="size-2.5 rounded-full bg-primary-500" />}
                </span>
                <Icon name={icon} variant="regular" className="text-primary-500" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <Select
          label="Dự án bạn đang chuẩn bị"
          showLabel
          value={projectId}
          options={projectSummaries.map((p) => ({ value: p.id, label: p.name }))}
          onChange={setProjectId}
          className=""
        />

        <TextField
          label="Bạn cần giúp gì?"
          optional
          multiline
          hint="Ví dụ: không biết xin xác nhận thu nhập ở đâu. Đừng ghi số căn cước hay số tài khoản."
          value={message}
          onChange={setMessage}
        />

        <div id="truong-consent" className="flex flex-col gap-2">
          <label
            className={`${errors.consent ? 'border-danger-600' : 'border-border-input'} flex cursor-pointer items-start gap-3 rounded-16 border p-4 text-m has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--focus-ring)`}
          >
            <input
              type="checkbox"
              checked={consent}
              aria-invalid={Boolean(errors.consent)}
              onChange={(e) => {
                setConsent(e.target.checked)
                if (errors.consent) setErrors({ ...errors, consent: undefined })
              }}
              className="peer sr-only"
            />
            <span
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[8px] border-2 border-border-input text-white peer-checked:border-primary-500 peer-checked:bg-primary-500"
              aria-hidden
            >
              {consent && <Icon name="check" size={12} />}
            </span>
            <span>Tôi đồng ý để tư vấn viên NOX liên hệ với tôi qua số điện thoại trên về việc chuẩn bị hồ sơ.</span>
          </label>
          {errors.consent && (
            <p className="flex items-center gap-2 text-s font-medium text-danger-600">
              <Icon name="circle-exclamation" />
              {errors.consent}
            </p>
          )}
        </div>

        <div>
          <PrimaryButton type="submit" icon="paper-plane" iconVariant="regular">
            Gửi yêu cầu
          </PrimaryButton>
        </div>
      </form>
    </PageShell>
  )
}
