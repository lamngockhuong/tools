# Bộ Sưu Tập Công Cụ

[![CI](https://github.com/lamngockhuong/tools/actions/workflows/ci.yml/badge.svg)](https://github.com/lamngockhuong/tools/actions/workflows/ci.yml)
[![Deploy](https://github.com/lamngockhuong/tools/actions/workflows/deploy.yml/badge.svg)](https://github.com/lamngockhuong/tools/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org/)

Bộ sưu tập các công cụ hữu ích cho năng suất, phát triển và lối sống.

## 🧰 Các Công Cụ Khả Dụng

### 🗄️ SQL Parameter Replacer

Chuyển đổi các câu truy vấn SQL có tham số ($1, $2, v.v.) thành SQL có thể thực thi bằng cách thay thế tham số bằng giá trị thực tế. Hoàn hảo để debug các truy vấn TypeORM.

**Tính năng:**

- Hỗ trợ nhiều kiểu dữ liệu (string, number, boolean, null, objects, arrays)
- Escape string SQL đúng cách
- Hỗ trợ tham số đối tượng JSON
- Tương thích với truy vấn TypeORM
- Chuyển đổi và định dạng theo thời gian thực

**Live Demo:** [SQL Parameter Replacer](https://lamngockhuong.github.io/tools/sql-param-replacer.html)

### 😴 Sleep Cycle Calculator

Tính toán thời gian đi ngủ và thức dậy tối ưu dựa trên chu kỳ giấc ngủ 90 phút. Thức dậy cảm thấy sảng khoái và tràn đầy năng lượng bằng cách căn chỉnh theo nhịp sinh học tự nhiên của bạn.

**Tính năng:**

- Tính giờ thức dậy từ giờ đi ngủ (hoặc ngược lại)
- Tuỳ chỉnh số chu kỳ ngủ (khuyến nghị: 5-6 chu kỳ = 7.5-9 giờ)
- Điều chỉnh thời gian ru ngủ
- Chọn ngày và giờ
- Lưu cài đặt (localStorage)
- Giao diện thân thiện với mobile
- Hỗ trợ tiếng Việt

**Live Demo:** [Sleep Cycle Calculator](https://lamngockhuong.github.io/tools/sleep-cycle-calculator.html)

## 🚀 Phát Triển

### Yêu Cầu

- Node.js 22+
- pnpm

### Cài Đặt

```bash
# Cài đặt dependencies
pnpm install

# Khởi chạy development server
pnpm dev

# Chạy tests
pnpm test

# Kiểm tra chất lượng code
pnpm run lint        # Chạy ESLint
pnpm run lint:fix    # Tự động sửa các lỗi ESLint
pnpm run type-check  # Kiểm tra kiểu TypeScript

# Build cho production
pnpm build

# Chạy toàn bộ CI pipeline
pnpm run ci
```

### Cấu Trúc Project

```text
├── src/                       # Mã nguồn TypeScript
│   ├── sql-param-replacer/    # Module SQL Parameter Replacer
│   └── sleep-cycle-calculator/# Module Sleep Cycle Calculator
├── public/                    # File HTML và static assets
├── test/                      # Unit tests
├── dist/                      # File đã build (tự động tạo)
└── .github/workflows/         # GitHub Actions
```

## 🌐 Triển Khai

### GitHub Pages

Project này được tự động triển khai lên GitHub Pages sử dụng GitHub Actions.

**Cài đặt GitHub Pages:**

1. Vào phần Settings của repository
2. Chuyển đến mục "Pages"
3. Đặt Source thành "GitHub Actions"
4. Push lên nhánh main - việc triển khai sẽ tự động diễn ra

**Triển khai thủ công:**

- Vào tab Actions trong GitHub repository của bạn
- Chạy workflow "Deploy to GitHub Pages" thủ công

### Xem Trước Local

```bash
# Build và xem trước local
pnpm build
pnpm preview
```

## 🧪 Testing

Project bao gồm các unit test toàn diện:

- Unit tests cho các function riêng lẻ
- Kịch bản tích hợp TypeORM
- Các trường hợp biên và xử lý lỗi
- Nhiều mẫu truy vấn SQL khác nhau

```bash
# Chạy tất cả tests
pnpm test

# Chạy tests ở chế độ watch
pnpm test --watch
```

## 📝 Thêm Công Cụ Mới

1. Tạo module mới trong `src/[tên-công-cụ]/`
2. Thêm file HTML tương ứng trong `public/[tên-công-cụ].html`
3. Cập nhật `vite.config.js` để thêm entry point mới
4. Thêm tests trong `test/[tên-công-cụ].test.ts`
5. Cập nhật file index.html chính để liệt kê công cụ mới

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch
3. Thêm tests cho chức năng mới
4. Đảm bảo tất cả tests đều pass
5. Gửi pull request

## 📄 License

MIT License
