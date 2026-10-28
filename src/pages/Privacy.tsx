import { useState } from 'react'
import { PrimaryButton } from '../components/Button'
import { Icon } from '../components/Icon'
import { ConfirmDialog, Notice, PageHeader, PageShell } from '../components/Page'
import { clearAllData } from '../lib/store'
import { routes } from '../routes'

const stored = [
  { icon: 'folder-open', text: 'Hồ sơ đang chuẩn bị: dự án, câu trả lời với trợ lý, và giấy nào bạn đã có.' },
  { icon: 'bookmark', text: 'Các dự án bạn theo dõi và nhu cầu bạn đã lưu (khu vực, số tiền, số phòng).' },
  { icon: 'headset', text: 'Yêu cầu tư vấn bạn đã gửi (trong bản thử nghiệm này).' },
  { icon: 'comment-dots', text: 'Cuộc trò chuyện với trợ lý — chỉ giữ đến khi bạn đóng trình duyệt.' },
]

export function Privacy() {
  const [confirming, setConfirming] = useState(false)
  const [cleared, setCleared] = useState(false)

  return (
    <PageShell width={720}>
      <PageHeader
        lines={['Dữ liệu và quyền riêng tư']}
        description="Nói ngắn gọn: thông tin bạn nhập trên NOX nằm trên máy của bạn, không gửi đi đâu, và bạn xoá được bất cứ lúc nào."
      />

      <section className="flex flex-col gap-4">
        <h2 className="headline text-headline-xs capitalize">NOX lưu những gì</h2>
        <ul className="flex flex-col gap-3">
          {stored.map((s) => (
            <li key={s.text} className="flex items-start gap-4 rounded-24 bg-primary-50 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-white text-primary-500" aria-hidden>
                <Icon name={s.icon} variant="regular" />
              </span>
              <span className="pt-2 text-m">{s.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="headline text-headline-xs capitalize">Lưu ở đâu</h2>
        <p className="text-m">
          Trong trình duyệt của điện thoại hoặc máy tính bạn đang dùng. NOX không có tài khoản và không gửi những thông tin này lên máy
          chủ. Nếu bạn dùng máy chung (quán net, máy cơ quan), hãy xoá dữ liệu khi dùng xong.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="headline text-headline-xs capitalize">Không nên nhập</h2>
        <p className="text-m">
          Số căn cước, số tài khoản ngân hàng, mật khẩu VNeID. NOX không bao giờ hỏi những thông tin này và không bao giờ yêu cầu bạn
          chuyển tiền.
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-32 border border-border-neutral p-6 md:p-8">
        <h2 className="text-l font-semibold">Xoá toàn bộ dữ liệu trên máy này</h2>
        <p className="text-m text-text-neutral-secondary">Hồ sơ, dự án theo dõi, nhu cầu và cuộc trò chuyện sẽ bị xoá. Không thể khôi phục.</p>
        {cleared ? (
          <p role="status" className="flex items-center gap-2 text-m font-semibold text-success-700">
            <Icon name="circle-check" />
            Đã xoá toàn bộ dữ liệu NOX trên máy này.
          </p>
        ) : (
          <div>
            <PrimaryButton variant="outlined" icon="trash-can" iconVariant="regular" onClick={() => setConfirming(true)}>
              Xoá dữ liệu
            </PrimaryButton>
          </div>
        )}
      </section>

      <Notice>
        <span>
          Có câu hỏi về dữ liệu của bạn?{' '}
          <a href={routes.advisor} className="font-semibold text-primary-500 underline underline-offset-2">
            Nhờ tư vấn viên
          </a>
        </span>
      </Notice>

      <ConfirmDialog
        open={confirming}
        title="Xoá toàn bộ dữ liệu?"
        body="Mọi hồ sơ, dự án theo dõi và cuộc trò chuyện trên máy này sẽ bị xoá và không khôi phục được."
        confirmLabel="Xoá tất cả"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          clearAllData()
          setConfirming(false)
          setCleared(true)
        }}
      />
    </PageShell>
  )
}
