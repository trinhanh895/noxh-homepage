import { useState } from 'react'
import { PrimaryButton } from '../components/Button'
import { Icon } from '../components/Icon'
import { Notice, PageHeader, PageShell } from '../components/Page'
import { readDrafts } from '../lib/store'
import { journeySteps as steps } from '../data/journey'

/* Where the user is, from what they saved on this device */
function currentStep() {
  const drafts = readDrafts()
  if (drafts.length === 0) return 0
  const docs = drafts.flatMap((d) => d.docs)
  return docs.length > 0 && docs.every((d) => d.status === 'done') ? 3 : 2
}

export function Journey() {
  const here = currentStep()
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set([here]))
  const allOpen = openSet.size === steps.length
  const toggle = (i: number) =>
    setOpenSet((s) => {
      const next = new Set(s)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <PageShell width={960}>
      <PageHeader
        eyebrow="Hành trình của bạn"
        lines={['Mỗi bước rõ ràng.', 'Không cần làm hết hôm nay.']}
        description="5 bước từ tìm dự án đến tự nộp hồ sơ. Bạn có thể dừng ở bất kỳ bước nào và quay lại sau — những gì đã lưu vẫn còn trên máy này."
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-s text-text-neutral-secondary">
            {here === 0 ? 'Bạn chưa bắt đầu. Bước đầu tiên đang mở sẵn.' : `Bạn đang ở bước ${here + 1}.`}
          </p>
          <button
            type="button"
            onClick={() => setOpenSet(allOpen ? new Set() : new Set(steps.map((_, i) => i)))}
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 text-s font-semibold whitespace-nowrap text-primary-500 hover:underline"
          >
            <Icon name={allOpen ? 'angles-up' : 'angles-down'} />
            {allOpen ? 'Thu gọn tất cả' : 'Mở tất cả bước'}
          </button>
        </div>

        <ol className="relative flex flex-col">
          {steps.map((s, i) => {
            const open = openSet.has(i)
            const isHere = i === here
            const done = i < here
            const panelId = `buoc-${i + 1}`
            return (
              <li key={s.title} className="relative flex gap-4 pb-2 md:gap-6">
                {/* rail */}
                <div className="flex flex-col items-center">
                  <span
                    className={`${isHere ? 'bg-warning-500 text-primary-600 ring-4 ring-warning-500/30' : done ? 'bg-primary-500 text-white' : 'border-2 border-primary-500 bg-white text-primary-500'} z-[1] flex size-11 shrink-0 items-center justify-center rounded-pill text-m font-bold`}
                    aria-hidden
                  >
                    {done ? <Icon name="check" /> : i + 1}
                  </span>
                  {i < steps.length - 1 && <span className="w-0.5 flex-1 bg-primary-500/25" aria-hidden />}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-3 pb-8">
                  <h2>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => toggle(i)}
                      className="flex w-full cursor-pointer items-start justify-between gap-4 text-left"
                    >
                      <span className="flex flex-col gap-1">
                        <span className="text-s font-medium text-text-neutral-secondary">
                          Bước {i + 1}
                          {isHere && <span className="ml-2 rounded-12 bg-warning-50 px-2 py-0.5 font-semibold text-warning-700">Bạn đang ở đây</span>}
                          {done && <span className="ml-2 text-success-700">· Đã xong</span>}
                        </span>
                        <span className="text-xl font-semibold text-text-neutral-primary">{s.title}</span>
                      </span>
                      <span className="mt-6 flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-neutral" aria-hidden>
                        <Icon name="angle-down" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                  </h2>
                  <p className="max-w-[640px] text-m text-text-neutral-secondary">{s.body}</p>

                  <div id={panelId} hidden={!open} className="flex flex-col gap-5 pt-1">
                    <dl className="grid grid-cols-1 gap-3 rounded-24 bg-primary-50 p-5 sm:grid-cols-3">
                      <div className="flex flex-col gap-1">
                        <dt className="flex items-center gap-2 text-s text-text-neutral-secondary">
                          <Icon name="user" variant="regular" size={14} /> Ai làm
                        </dt>
                        <dd className="text-m font-medium">{s.who}</dd>
                      </div>
                      <div className="flex flex-col gap-1">
                        <dt className="flex items-center gap-2 text-s text-text-neutral-secondary">
                          <Icon name="clock" variant="regular" size={14} /> Mất bao lâu
                        </dt>
                        <dd className="text-m font-medium">{s.time}</dd>
                      </div>
                      <div className="flex flex-col gap-1">
                        <dt className="flex items-center gap-2 text-s text-text-neutral-secondary">
                          <Icon name="flag-checkered" size={14} /> Xong bước này bạn có
                        </dt>
                        <dd className="text-m font-medium">{s.result}</dd>
                      </div>
                    </dl>
                    <ul className="flex max-w-[640px] flex-col gap-2 text-m">
                      {s.details.map((d) => (
                        <li key={d} className="flex gap-3">
                          <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden />
                          {d}
                        </li>
                      ))}
                    </ul>
                    <div>
                      <PrimaryButton variant={isHere ? 'solid' : 'outlined'} href={s.cta.href} external={s.cta.external}>
                        {s.cta.label}
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="flex flex-col gap-3">
        <Notice tone="warning" icon="shield-exclamation">
          <strong className="font-semibold">NOX không thu tiền và không nhận làm hồ sơ hộ.</strong>
          <span>Cẩn thận với người hứa "chạy" suất mua. Chỉ nộp hồ sơ theo kênh ghi trong thông báo chính thức của dự án.</span>
        </Notice>
        <Notice>
          <span>
            Trợ lý và tư vấn viên NOX giúp bạn chuẩn bị. Quyết định có được mua hay không là của cơ quan xét duyệt và chủ đầu tư.
          </span>
        </Notice>
      </div>
    </PageShell>
  )
}
