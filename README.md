# Tools Collection

[![CI](https://github.com/lamngockhuong/tools/actions/workflows/ci.yml/badge.svg)](https://github.com/lamngockhuong/tools/actions/workflows/ci.yml)
[![Deploy](https://github.com/lamngockhuong/tools/actions/workflows/deploy.yml/badge.svg)](https://github.com/lamngockhuong/tools/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-22%2B-green.svg)](https://nodejs.org/)

A collection of useful tools and utilities for productivity, development, and lifestyle.

## 🧰 Available Tools

### 🗄️ SQL Parameter Replacer

Convert parameterized SQL queries (with $1, $2, etc.) to executable SQL by replacing parameters with actual values. Perfect for debugging TypeORM queries.

**Features:**

- Support for various data types (string, number, boolean, null, objects, arrays)
- Proper SQL escaping for string parameters
- JSON object parameter support
- TypeORM query compatibility
- Real-time conversion and formatting

**Live Demo:** [SQL Parameter Replacer](https://lamngockhuong.github.io/tools/sql-param-replacer.html)

### 😴 Sleep Cycle Calculator

Calculate optimal bedtime and wake-up times based on 90-minute sleep cycles. Wake up feeling refreshed and energized by aligning with your natural sleep rhythm.

**Features:**

- Calculate wake-up times from bedtime (or vice versa)
- Customizable sleep cycles (recommended: 5-6 cycles = 7.5-9 hours)
- Adjustable sleep latency (time to fall asleep)
- Date and time selection
- Settings persistence (localStorage)
- Mobile-friendly interface
- Vietnamese language support

**Live Demo:** [Sleep Cycle Calculator](https://lamngockhuong.github.io/tools/sleep-cycle-calculator.html)

## 🚀 Development

### Prerequisites

- Node.js 22+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Code quality checks
pnpm run lint        # Run ESLint
pnpm run lint:fix    # Auto-fix ESLint issues
pnpm run type-check  # TypeScript type checking

# Build for production
pnpm build

# Run full CI pipeline
pnpm run ci
```

### Project Structure

```text
├── src/                       # TypeScript source code
│   ├── sql-param-replacer/    # SQL Parameter Replacer module
│   └── sleep-cycle-calculator/# Sleep Cycle Calculator module
├── public/                    # HTML files and static assets
├── test/                      # Unit tests
├── dist/                      # Built files (generated)
└── .github/workflows/         # GitHub Actions
```

## 🌐 Deployment

### GitHub Pages

This project is automatically deployed to GitHub Pages using GitHub Actions.

**Setup GitHub Pages:**

1. Go to your repository Settings
2. Navigate to "Pages" section
3. Set Source to "GitHub Actions"
4. Push to main branch - deployment will happen automatically

**Manual deployment:**

- Go to Actions tab in your GitHub repository
- Run the "Deploy to GitHub Pages" workflow manually

### Local Preview

```bash
# Build and preview locally
pnpm build
pnpm preview
```

## 🧪 Testing

The project includes comprehensive unit tests covering:

- Unit tests for individual functions
- TypeORM integration scenarios
- Edge cases and error handling
- Various SQL query patterns

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch
```

## 📝 Adding New Tools

1. Create a new module in `src/[tool-name]/`
2. Add corresponding HTML file in `public/[tool-name].html`
3. Update `vite.config.js` to include the new entry point
4. Add tests in `test/[tool-name].test.ts`
5. Update the main index.html to list the new tool

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License
