import { useEffect, useRef, useState } from 'react'
import { PrimaryButton } from '../components/Button'
import { Icon } from '../components/Icon'
import { PageShell } from '../components/Page'
import { TextField } from '../components/TextField'
import { digitsOf, maskLong, signIn, validPhone } from '../lib/account'
import { routes } from '../routes'

/* Đăng nhập trên máy khác (wireframe A0 → A2L): phone number → 6-digit code → Hồ sơ của tôi.
 * There's no separate sign-up: the account is created the first time a paper is uploaded. OTP is simulated. */
export function Login() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState('')

  return (
    <PageShell width={480}>
      <div className="flex flex-col gap-6 py-4 md:py-10">
        {step === 'phone' ? (
          <>
            <div className="flex flex-col gap-3">
              <span className="flex size-12 items-center justify-center rounded-pill bg-primary-50 text-primary-500" aria-hidden>
                <Icon name="phone" variant="regular" size={20} />
              </span>
              <h1 className="headline text-headline-xs capitalize md:text-headline-m">Đăng nhập</h1>
              <p className="text-m text-text-neutral-secondary">Dùng số điện thoại bạn đã lưu hồ sơ. Hồ sơ trên máy này sẽ được gộp vào tài khoản.</p>
            </div>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!validPhone(phone)) return setErr('Số điện thoại gồm 10 chữ số, bắt đầu bằng số 0. Ví dụ: 0901 234 567.')
                setErr('')
                setStep('otp')
              }}
            >
              <TextField
                label="Số điện thoại"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ví dụ: 0901 234 567"
                value={phone}
                onChange={(v) => {
                  setPhone(v)
                  setErr('')
                }}
                hint="Mã xác nhận 6 số gửi qua tin nhắn. Không dùng để quảng cáo."
                error={err || undefined}
              />
              <PrimaryButton type="submit" block>
                Gửi mã xác nhận
              </PrimaryButton>
            </form>
            <div className="flex flex-col gap-2 rounded-24 bg-primary-25 p-4 text-s text-text-neutral-secondary">
              <p>
                <b className="font-semibold text-text-neutral-primary">Chưa có tài khoản?</b> Không cần tạo trước. NOX chỉ hỏi số điện thoại khi bạn tải giấy
                tờ đầu tiên.
              </p>
              <a href={routes.home} className="w-fit font-semibold text-primary-500 underline underline-offset-2">
                Về trang chủ
              </a>
            </div>
          </>
        ) : (
          <Otp phone={digitsOf(phone)} onBack={() => setStep('phone')} />
        )}
      </div>
    </PageShell>
  )
}

function Otp({ phone, onBack }: { phone: string; onBack: () => void }) {
  const [code, setCode] = useState('')
  const [left, setLeft] = useState(45)
  const [err, setErr] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => input.current?.focus(), [])
  useEffect(() => {
    if (left <= 0) return
    const t = window.setTimeout(() => setLeft((x) => x - 1), 1000)
    return () => window.clearTimeout(t)
  }, [left])

  return (
    <>
      <button type="button" onClick={onBack} className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 text-s font-semibold text-primary-500">
        <Icon name="arrow-left" size={14} />
        Đổi số điện thoại
      </button>
      <div className="flex flex-col gap-3">
        <h1 className="headline text-headline-xs capitalize md:text-headline-m">Nhập mã xác nhận</h1>
        <p className="text-m text-text-neutral-secondary">
          Mã 6 số vừa gửi tới số <b className="font-semibold text-text-neutral-primary">{maskLong(phone)}</b>. Bản mẫu: nhập 6 số bất kỳ.
        </p>
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (code.length < 6) return setErr('Nhập đủ 6 số trong tin nhắn.')
          signIn(phone)
          window.location.hash = routes.profile
        }}
      >
        {/* one real input, drawn as six boxes */}
        <div className="relative grid grid-cols-6 gap-2" onClick={() => input.current?.focus()}>
          {Array.from({ length: 6 }, (_, i) => (
            <span
              key={i}
              className={`${i === Math.min(code.length, 5) ? 'border-primary-500 ring-3 ring-primary-500/15' : 'border-border-input'} flex h-14 items-center justify-center rounded-16 border bg-white text-xl font-semibold`}
            >
              {code[i] ?? ''}
            </span>
          ))}
          <input
            ref={input}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="Mã xác nhận 6 số"
            aria-invalid={Boolean(err)}
            value={code}
            onChange={(e) => {
              setErr('')
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            }}
            className="absolute inset-0 w-full opacity-0"
          />
        </div>
        {err && (
          <p className="text-s font-semibold text-danger-600" role="alert">
            {err}
          </p>
        )}
        <p className="text-s text-text-neutral-secondary">
          Chưa nhận được?{' '}
          {left > 0 ? (
            `Gửi lại mã sau 0:${String(left).padStart(2, '0')}`
          ) : (
            <button type="button" onClick={() => setLeft(45)} className="cursor-pointer font-semibold text-primary-500 underline underline-offset-2">
              Gửi lại mã
            </button>
          )}
        </p>
        <PrimaryButton type="submit" block>
          Xác nhận
        </PrimaryButton>
        <p className="text-s text-text-neutral-secondary">Sau khi đăng nhập, bạn vào Hồ sơ của tôi.</p>
      </form>
    </>
  )
}
