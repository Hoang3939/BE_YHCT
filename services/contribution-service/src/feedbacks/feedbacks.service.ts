import { Injectable } from '@nestjs/common';

/**
 * Mock feedback data shape — matches FE_YHCT/src/types/feedback.ts.
 * When a real feedback table is added, replace the static array with DB queries.
 */
export interface FeedbackAuthor {
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
}

export interface Feedback {
  id: string;
  title: string;
  author: FeedbackAuthor;
  relatedEntity: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
  upvotes: number;
  tags: string[];
}

const MOCK_FEEDBACKS: Feedback[] = [
  {
    id: 'FB-0691',
    title: 'Sai thông tin liều dùng Hoàng Kỳ trong bài thuốc Bổ Trung Ích Khí...',
    author: { name: 'PGS. Nguyễn Minh Quân', initials: 'MQ', role: 'Chuyên gia', avatarColor: 'bg-blue-500' },
    relatedEntity: 'Bổ Trung Ích Khí Thang',
    type: 'Chỉnh sửa',
    priority: 'Cao',
    status: 'Chờ duyệt',
    createdAt: '2026-03-08T08:32:00Z',
    upvotes: 14,
    tags: ['#liều dùng', '#hoàng kỳ', '#Bổ Trung Ích Thang'],
  },
  {
    id: 'FB-0690',
    title: 'Đề xuất bổ sung chống chỉ định cho bài thuốc Lục Vị Địa Hoàng...',
    author: { name: 'ThS. Lê Thị Hương', initials: 'LH', role: 'Thầy thuốc', avatarColor: 'bg-violet-500' },
    relatedEntity: 'Lục Vị Địa Hoàng Hoàn',
    type: 'Bổ sung',
    priority: 'Trung bình',
    status: 'Đang xem xét',
    createdAt: '2026-03-08T14:15:00Z',
    upvotes: 8,
    tags: ['#chống chỉ định', '#Lục Vị', '#bổ sung'],
  },
  {
    id: 'FB-0689',
    title: 'Bổ sung nghiên cứu lâm sàng hiện đại cho Sâm Ngọc Linh',
    author: { name: 'TS. Phạm Văn Bình', initials: 'PB', role: 'Nhà nghiên cứu', avatarColor: 'bg-teal-500' },
    relatedEntity: 'Sâm Ngọc Linh — Panax vietnamensis',
    type: 'Đề xuất',
    priority: 'Trung bình',
    status: 'Đã duyệt',
    createdAt: '2026-03-08T10:45:00Z',
    upvotes: 22,
    tags: ['#nghiên cứu', '#Sâm Ngọc Linh', '#lâm sàng'],
  },
  {
    id: 'FB-0688',
    title: 'Hỏi về tương tác thuốc: Cam Thảo và thuốc huyết áp Tây y',
    author: { name: 'Nguyễn Anh Khoa', initials: 'AK', role: 'Người dùng', avatarColor: 'bg-orange-400' },
    relatedEntity: 'Cam Thảo — Glycyrrhiza',
    type: 'Câu hỏi',
    priority: 'Thấp',
    status: 'Đã duyệt',
    createdAt: '2026-03-08T07:20:00Z',
    upvotes: 5,
    tags: ['#tương tác thuốc', '#Cam Thảo', '#huyết áp'],
  },
  {
    id: 'FB-0687',
    title: 'Báo cáo kết quả truy xuất sai: nhầm lẫn Dương Quy và Xuyên K...',
    author: { name: 'BS. Trần Quốc Toàn', initials: 'QT', role: 'Thầy thuốc', avatarColor: 'bg-rose-500' },
    relatedEntity: 'Bổ RAG',
    type: 'Báo lỗi',
    priority: 'Cao',
    status: 'Từ chối',
    createdAt: '2026-03-07T15:30:00Z',
    upvotes: 18,
    tags: ['#bổ RAG', '#Pembrolizumab', '#Dương Quy'],
  },
  {
    id: 'FB-0686',
    title: 'Sai tên Latin của cây Thiên Môn Đông',
    author: { name: 'PGS. Hoàng Thị Mai', initials: 'HM', role: 'Chuyên gia', avatarColor: 'bg-blue-600' },
    relatedEntity: 'Thiên Môn Đông',
    type: 'Chỉnh sửa',
    priority: 'Cao',
    status: 'Chờ duyệt',
    createdAt: '2026-03-07T09:00:00Z',
    upvotes: 11,
    tags: ['#tên khoa học', '#Hoàn lại thực vật', '#Thiên Môn Đông'],
  },
  {
    id: 'FB-0685',
    title: 'Đề xuất thêm tính năng so sánh bài thuốc',
    author: { name: 'Vũ Thành Long', initials: 'VL', role: 'Người dùng', avatarColor: 'bg-green-500' },
    relatedEntity: 'Hệ thống RAG',
    type: 'Đề xuất',
    priority: 'Thấp',
    status: 'Chờ duyệt',
    createdAt: '2026-03-05T16:45:00Z',
    upvotes: 7,
    tags: ['#so sánh', '#UX', '#tìm kiếm'],
  },
  {
    id: 'FB-0684',
    title: 'Bổ sung hình ảnh dược liệu Tam Thất từ bộ ảnh chuẩn WHO',
    author: { name: 'TS.DS. Thị Lan', initials: 'TL', role: 'Nhà dược', avatarColor: 'bg-indigo-500' },
    relatedEntity: 'Tam Thất — Panax notoginseng',
    type: 'Bổ sung',
    priority: 'Trung bình',
    status: 'Đang xem xét',
    createdAt: '2026-03-03T11:20:00Z',
    upvotes: 16,
    tags: ['#hình ảnh', '#Tam Thất', '#WHO'],
  },
];

@Injectable()
export class FeedbacksService {
  /**
   * Return all mock feedbacks. Replace with DB query when feedback table exists.
   */
  findAll(): Feedback[] {
    return MOCK_FEEDBACKS;
  }
}
