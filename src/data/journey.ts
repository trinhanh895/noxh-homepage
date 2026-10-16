import { routes, withParams } from '../routes'

/* The 5-step journey — shown in full on "Hành trình" and as a strip on the home page. */
export type Step = {
  title: string
  body: string
  who: string
  /** Who does the work, in one word, for the home strip */
  owner: 'NOX giúp bạn' | 'Bạn tự làm'
  time: string
  result: string
  details: string[]
  cta: { label: string; href: string; external?: boolean }
}

export const journeySteps: Step[] = [
  {
    title: 'Tìm dự án phù hợp',
    owner: 'Bạn tự làm',
    body: 'Xem dự án nào đang nhận hồ sơ, hạn nộp đến khi nào, ở đâu. Chưa cần tạo tài khoản hay chuẩn bị giấy tờ.',
    who: 'Bạn',
    time: 'Tuỳ bạn',
    result: 'Một dự án bạn muốn đăng ký',
    details: ['Bấm "Theo dõi dự án" để lưu lại và xem hạn nộp trong "Hồ sơ của tôi".', 'Mỗi người chỉ đăng ký mua tại một dự án trong cùng thời điểm.'],
    cta: { label: 'Xem các dự án', href: routes.projects },
  },
  {
    title: 'Trả lời 3 câu hỏi ngắn',
    owner: 'NOX giúp bạn',
    body: 'Trợ lý hỏi về nhà ở, công việc và gia đình để biết bạn cần những giấy tờ nào.',
    who: 'Bạn và trợ lý NOX',
    time: 'Khoảng 2 phút',
    result: 'Danh sách giấy tờ riêng cho trường hợp của bạn',
    details: ['Không chắc câu nào thì chọn "Không chắc", tư vấn viên sẽ giúp sau.', 'Danh sách được lưu vào "Hồ sơ của tôi" trên máy này.'],
    cta: { label: 'Trả lời với trợ lý', href: withParams(routes.assistant, { guide: '1' }) },
  },
  {
    title: 'Xin từng giấy tờ',
    owner: 'Bạn tự làm',
    body: 'Đánh dấu giấy nào đã có, giấy nào đang xin. Đang chờ một giấy vẫn làm được các giấy khác.',
    who: 'Bạn, nơi làm việc, UBND xã/phường',
    time: 'Vài ngày đến vài tuần',
    result: 'Đủ giấy tờ theo danh sách',
    details: ['Mỗi giấy tờ có ghi nơi xin xác nhận.', 'Giữ bản gốc; nộp bản sao có chứng thực khi thông báo yêu cầu.'],
    cta: { label: 'Mở hồ sơ của tôi', href: routes.profile },
  },
  {
    title: 'Nhờ người xem lại',
    owner: 'NOX giúp bạn',
    body: 'Trước khi nộp, nhờ tư vấn viên xem giúp còn thiếu gì. Chỉ khi bạn đồng ý, họ mới xem thông tin của bạn.',
    who: 'Bạn và tư vấn viên NOX',
    time: '1–2 ngày làm việc',
    result: 'Biết hồ sơ đã đủ hay cần bổ sung gì',
    details: ['Tư vấn viên liên hệ qua điện thoại hoặc Zalo bạn để lại.', 'Bạn có thể hỏi trợ lý bất cứ lúc nào trong lúc chờ.'],
    cta: { label: 'Nhờ tư vấn viên', href: routes.advisor },
  },
  {
    title: 'Tự nộp và theo dõi kết quả',
    owner: 'Bạn tự làm',
    body: 'Bạn tự nộp theo kênh ghi trong thông báo của dự án: trực tiếp tại chủ đầu tư, hoặc trực tuyến nếu dự án có hỗ trợ.',
    who: 'Bạn',
    time: 'Theo lịch của dự án',
    result: 'Hồ sơ được tiếp nhận; chờ kết quả xét duyệt',
    details: [
      'Nộp trực tuyến: vào Cổng Dịch vụ công Quốc gia, đăng nhập bằng tài khoản VNeID, tìm thủ tục mua nhà ở xã hội của Hà Nội.',
      'Nếu được yêu cầu bổ sung, chỉ cần bổ sung đúng giấy đó, không phải làm lại từ đầu.',
    ],
    cta: { label: 'Cổng Dịch vụ công', href: 'https://dichvucong.gov.vn', external: true },
  },
]

