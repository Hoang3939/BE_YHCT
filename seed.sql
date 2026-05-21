-- ============================================================
-- SEED DATA — Y-RAG Platform
-- Password cho tất cả accounts: Test@1234
-- Hash: $2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK
-- ============================================================
-- Chạy script này trên SQL Server database của auth-service
-- và contribution-service (nếu cùng DB), bỏ qua nếu đã có dữ liệu

USE YHCT_DB;
GO

-- ============================================================
-- BẢNG Account (auth-service)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Account WHERE email = 'admin@yhct.vn')
BEGIN
  INSERT INTO Account (accountId, email, passwordHash, role, status, createdAt, updatedAt)
  VALUES
    -- Admin
    ('A1000001-0000-0000-0000-000000000001', 'admin@yhct.vn',      '$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK', 'admin',  'active',  GETDATE(), GETDATE()),
    -- Chuyên gia
    ('A2000001-0000-0000-0000-000000000001', 'expert1@yhct.vn',    '$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK', 'expert', 'active',  GETDATE(), GETDATE()),
    ('A2000002-0000-0000-0000-000000000001', 'expert2@yhct.vn',    '$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK', 'expert', 'active',  GETDATE(), GETDATE()),
    ('A2000003-0000-0000-0000-000000000001', 'bsnguyenminh@yhct.vn','$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK','expert', 'active',  GETDATE(), GETDATE()),
    -- Người dùng thường
    ('A3000001-0000-0000-0000-000000000001', 'user1@gmail.com',    '$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK', 'user',   'active',  GETDATE(), GETDATE()),
    ('A3000002-0000-0000-0000-000000000001', 'user2@gmail.com',    '$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK', 'user',   'active',  DATEADD(day,-15,GETDATE()), GETDATE()),
    ('A3000003-0000-0000-0000-000000000001', 'user3@gmail.com',    '$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK', 'user',   'active',  DATEADD(day,-30,GETDATE()), GETDATE()),
    ('A3000004-0000-0000-0000-000000000001', 'user4@gmail.com',    '$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK', 'user',   'active',  DATEADD(day,-45,GETDATE()), GETDATE()),
    ('A3000005-0000-0000-0000-000000000001', 'user5@yahoo.com',    '$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK', 'user',   'locked',  DATEADD(day,-60,GETDATE()), GETDATE()),
    ('A3000006-0000-0000-0000-000000000001', 'pham.thi.hoa@gmail.com','$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK','user', 'active',  DATEADD(day,-5, GETDATE()), GETDATE()),
    ('A3000007-0000-0000-0000-000000000001', 'nguyen.van.duc@gmail.com','$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK','user','active', DATEADD(day,-2, GETDATE()), GETDATE()),
    ('A3000008-0000-0000-0000-000000000001', 'le.thi.mai@outlook.com','$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK','user', 'pending', DATEADD(day,-1, GETDATE()), GETDATE()),
    ('A3000009-0000-0000-0000-000000000001', 'tran.quoc.bao@gmail.com','$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK','user','active',  DATEADD(day,-10,GETDATE()), GETDATE()),
    ('A3000010-0000-0000-0000-000000000001', 'hoang.kim.anh@gmail.com','$2b$10$XKS9n.6eJwzqyXv84FSzx.M7zjOBeWkws1CmLNGjjOkDsCKc0D8gK','user','active',  DATEADD(day,-20,GETDATE()), GETDATE());
END
GO

-- ============================================================
-- BẢNG User (UserProfile, auth-service)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM [User] WHERE accountId = 'A1000001-0000-0000-0000-000000000001')
BEGIN
  INSERT INTO [User] (userId, accountId, fullName, phoneNumber, bio, totalQuestions, totalContributions, lastLoginAt, updatedAt)
  VALUES
    (NEWID(), 'A1000001-0000-0000-0000-000000000001', N'Quản trị viên YHCT',    '0901000001', N'Quản trị hệ thống Y học Cổ Truyền',                  0,  0, DATEADD(hour,-1,GETDATE()), GETDATE()),
    (NEWID(), 'A2000001-0000-0000-0000-000000000001', N'PGS. Trần Thị Bích Ngọc','0902000001', N'Chuyên gia Y học Cổ Truyền, 20 năm kinh nghiệm',     45, 12, DATEADD(hour,-3,GETDATE()), GETDATE()),
    (NEWID(), 'A2000002-0000-0000-0000-000000000001', N'TS. Lê Văn Phước',       '0902000002', N'Tiến sĩ Đông Y, nghiên cứu dược liệu cổ truyền',      38, 8,  DATEADD(day,-1, GETDATE()), GETDATE()),
    (NEWID(), 'A2000003-0000-0000-0000-000000000001', N'BS. Nguyễn Minh Quân',   '0902000003', N'Bác sĩ Y học Cổ Truyền, BV Tuệ Tĩnh',               61, 15, DATEADD(hour,-6,GETDATE()), GETDATE()),
    (NEWID(), 'A3000001-0000-0000-0000-000000000001', N'Phạm Văn An',            '0903000001', N'Người dùng quan tâm đến Y học Cổ Truyền',            12, 2,  DATEADD(day,-1, GETDATE()), GETDATE()),
    (NEWID(), 'A3000002-0000-0000-0000-000000000001', N'Nguyễn Thị Lan',         '0903000002', NULL,                                                   7,  0,  DATEADD(day,-2, GETDATE()), GETDATE()),
    (NEWID(), 'A3000003-0000-0000-0000-000000000001', N'Trần Hữu Đức',           '0903000003', NULL,                                                   23, 3,  DATEADD(day,-3, GETDATE()), GETDATE()),
    (NEWID(), 'A3000004-0000-0000-0000-000000000001', N'Võ Thị Kim Cương',       NULL,         NULL,                                                   5,  1,  DATEADD(day,-7, GETDATE()), GETDATE()),
    (NEWID(), 'A3000005-0000-0000-0000-000000000001', N'Đỗ Quang Minh',          NULL,         NULL,                                                   0,  0,  DATEADD(day,-60,GETDATE()), GETDATE()),
    (NEWID(), 'A3000006-0000-0000-0000-000000000001', N'Phạm Thị Hoa',           '0903000006', NULL,                                                   3,  0,  DATEADD(hour,-2,GETDATE()), GETDATE()),
    (NEWID(), 'A3000007-0000-0000-0000-000000000001', N'Nguyễn Văn Đức',         '0903000007', NULL,                                                   8,  1,  DATEADD(hour,-5,GETDATE()), GETDATE()),
    (NEWID(), 'A3000008-0000-0000-0000-000000000001', N'Lê Thị Mai',             NULL,         NULL,                                                   0,  0,  NULL,                       GETDATE()),
    (NEWID(), 'A3000009-0000-0000-0000-000000000001', N'Trần Quốc Bảo',          '0903000009', NULL,                                                   15, 2,  DATEADD(day,-1, GETDATE()), GETDATE()),
    (NEWID(), 'A3000010-0000-0000-0000-000000000001', N'Hoàng Kim Anh',          '0903000010', N'Yêu thích nghiên cứu y dược học cổ truyền',           9,  0,  DATEADD(day,-2, GETDATE()), GETDATE());
END
GO

-- ============================================================
-- BẢNG Feedback (contribution-service DB)
-- ============================================================
-- Lưu ý: chạy phần này trên DB của contribution-service nếu tách biệt
IF NOT EXISTS (SELECT 1 FROM Feedback WHERE title = N'Thông tin liều dùng Hoàng Kỳ chưa chính xác')
BEGIN
  INSERT INTO Feedback (feedbackId, accountId, fullName, email, category, title, content, pageUrl, severity, status, handledByAdminId, resolutionNote, createdAt, updatedAt)
  VALUES
    -- Bug reports
    (NEWID(), NULL, N'PGS. Nguyễn Minh Quân', 'nguyenminhquan@yhct.edu.vn', 'content',
      N'Thông tin liều dùng Hoàng Kỳ chưa chính xác',
      N'Trong bài thuốc Bổ Trung Ích Khí, liều dùng Hoàng Kỳ được ghi là 20g nhưng theo y văn cổ điển thì nên là 15-30g tùy thể trạng. Cần bổ sung giải thích.',
      '/library', 'high', 'reviewing', NULL, NULL, DATEADD(day,-3,GETDATE()), DATEADD(day,-2,GETDATE())),

    (NEWID(), NULL, N'Lê Văn Thành', 'lvthanh@gmail.com', 'bug',
      N'Tìm kiếm không trả về kết quả khi gõ tên thuốc bằng chữ hoa',
      N'Khi tôi tìm kiếm "HOÀNG KỲ" (chữ hoa) thì không ra kết quả, nhưng "hoàng kỳ" thì có. Nên normalize input trước khi search.',
      '/chat', 'medium', 'new', NULL, NULL, DATEADD(day,-5,GETDATE()), DATEADD(day,-5,GETDATE())),

    (NEWID(), NULL, N'Trần Thị Bích', 'bichtran@outlook.com', 'bug',
      N'Ứng dụng bị đứng khi upload file PDF lớn hơn 10MB',
      N'Tôi thử đóng góp một tài liệu PDF khoảng 15MB thì trang bị đứng sau khoảng 30 giây. Không có thông báo lỗi nào.',
      '/contribute', 'high', 'resolved', NULL, N'Đã cập nhật giới hạn upload và thêm thông báo lỗi rõ ràng.', DATEADD(day,-10,GETDATE()), DATEADD(day,-7,GETDATE())),

    (NEWID(), NULL, N'Nguyễn Văn Hùng', 'vanhung2024@gmail.com', 'bug',
      N'Nút đăng xuất đôi khi không phản hồi trên di động',
      N'Trên điện thoại (iOS Safari), nút đăng xuất đôi khi cần nhấn 2-3 lần mới hoạt động.',
      '/chat', 'low', 'new', NULL, NULL, DATEADD(day,-1,GETDATE()), DATEADD(day,-1,GETDATE())),

    -- Feature requests
    (NEWID(), NULL, N'TS. Lê Văn Phước', 'lvphuoc@yhct.vn', 'feature_request',
      N'Đề xuất thêm tính năng so sánh bài thuốc',
      N'Rất hữu ích nếu có tính năng so sánh 2-3 bài thuốc cùng lúc để thấy sự khác biệt về thành phần và công dụng.',
      '/library', 'medium', 'reviewing', NULL, NULL, DATEADD(day,-7,GETDATE()), DATEADD(day,-5,GETDATE())),

    (NEWID(), NULL, N'Phạm Thị Hồng Nhung', 'phnhung@gmail.com', 'feature_request',
      N'Thêm chức năng lưu lịch sử tìm kiếm',
      N'Mong muốn có thể xem lại các câu hỏi đã hỏi trước đây. Hiện tại sau khi làm mới trang thì mất hết.',
      '/chat', 'low', 'new', NULL, NULL, DATEADD(day,-2,GETDATE()), DATEADD(day,-2,GETDATE())),

    (NEWID(), NULL, N'Hoàng Minh Tuấn', 'hmtuan@yahoo.com', 'feature_request',
      N'Hỗ trợ xuất kết quả tư vấn ra file PDF',
      N'Sau khi nhận được tư vấn từ AI, tôi muốn có thể xuất ra PDF để lưu hoặc in cho bệnh nhân.',
      '/chat', 'medium', 'new', NULL, NULL, DATEADD(day,-4,GETDATE()), DATEADD(day,-4,GETDATE())),

    -- UX issues
    (NEWID(), NULL, N'Vũ Thị Thanh Hà', 'thanhha.vu@gmail.com', 'ux',
      N'Giao diện chat khó đọc trên màn hình nhỏ',
      N'Trên tablet 10 inch, sidebar chiếm quá nhiều diện tích, phần chat bị hẹp. Nên có thể thu gọn sidebar.',
      '/chat', 'medium', 'resolved', NULL, N'Đã thêm nút thu gọn sidebar.', DATEADD(day,-14,GETDATE()), DATEADD(day,-10,GETDATE())),

    (NEWID(), NULL, N'Bùi Quang Khải', 'quangkhai.bui@gmail.com', 'ux',
      N'Thời gian chờ phản hồi AI quá lâu nhưng không có loading indicator',
      N'Đôi khi AI mất 10-15 giây để trả lời nhưng không có dấu hiệu nào cho thấy hệ thống đang xử lý. Người dùng dễ nhầm tưởng bị lỗi.',
      '/chat', 'medium', 'resolved', NULL, N'Đã thêm animation typing indicator.', DATEADD(day,-20,GETDATE()), DATEADD(day,-15,GETDATE())),

    (NEWID(), NULL, N'Đinh Thị Lan Hương', 'lanhuong.dinh@outlook.com', 'ux',
      N'Font chữ quá nhỏ trong phần hiển thị bài thuốc',
      N'Phần mô tả chi tiết bài thuốc dùng font nhỏ, khó đọc cho người lớn tuổi. Nên có tùy chọn cỡ chữ.',
      '/library', 'low', 'new', NULL, NULL, DATEADD(day,-6,GETDATE()), DATEADD(day,-6,GETDATE())),

    -- Content corrections
    (NEWID(), NULL, N'BS. Nguyễn Thị Thu Hằng', 'thuhang.bs@yhct.edu.vn', 'content',
      N'Bài Lục Vị Địa Hoàng Hoàn thiếu chống chỉ định quan trọng',
      N'Bài thuốc Lục Vị Địa Hoàng Hoàn trong hệ thống chưa đề cập đến chống chỉ định với người tỳ vị hư hàn. Cần bổ sung để tránh nguy hiểm.',
      '/library', 'high', 'reviewing', NULL, NULL, DATEADD(day,-8,GETDATE()), DATEADD(day,-7,GETDATE())),

    (NEWID(), NULL, N'Trần Văn Dũng', 'tvdung.yduoc@gmail.com', 'content',
      N'Mô tả công dụng Cam Thảo bị nhầm lẫn với Cam Thảo Bắc',
      N'Hệ thống đang mô tả công dụng của Cam Thảo (Glycyrrhiza uralensis) nhưng kèm hình ảnh Cam Thảo nam (Scoparia dulcis) - hai loại này khác nhau hoàn toàn.',
      '/library', 'high', 'new', NULL, NULL, DATEADD(day,-9,GETDATE()), DATEADD(day,-9,GETDATE())),

    -- Other
    (NEWID(), NULL, N'Nguyễn Hữu Nghĩa', 'huunghia.2003@gmail.com', 'other',
      N'Câu hỏi về cách sử dụng hệ thống',
      N'Tôi muốn hỏi làm cách nào để đóng góp tài liệu Y học cổ truyền mà mình đang nghiên cứu? Quy trình xét duyệt mất bao lâu?',
      '/contribute', 'low', 'closed', NULL, N'Đã hướng dẫn qua email, quy trình xét duyệt 3-5 ngày làm việc.', DATEADD(day,-12,GETDATE()), DATEADD(day,-11,GETDATE())),

    (NEWID(), NULL, N'Lý Thị Mỹ Duyên', 'myduyen.ly@gmail.com', 'other',
      N'Đề xuất thêm tài liệu về Y học cổ truyền miền Nam',
      N'Hầu hết tài liệu trong hệ thống có quan điểm miền Bắc. Mong muốn bổ sung thêm kiến thức từ trường phái y học cổ truyền miền Nam.',
      NULL, 'low', 'new', NULL, NULL, DATEADD(day,-3,GETDATE()), DATEADD(day,-3,GETDATE()));
END
GO

PRINT 'Seed data inserted successfully!';
