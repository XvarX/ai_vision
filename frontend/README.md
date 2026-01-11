# AI Vision Novel Platform - Frontend

Next.js frontend for the collaborative novel writing platform.

## Features

- User authentication (login/register)
- Browse and create novels
- Chapter management with edit support
- Fork chapters to create branches
- Submit merge requests
- Responsive design with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.local.example .env.local
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── (pages)/
│   ├── page.tsx              # Home page
│   ├── login/                # Login page
│   ├── register/             # Register page
│   ├── novels/               # Novels list and create
│   │   ├── [id]/             # Novel detail
│   │   └── [id]/chapters/    # Chapter management
│   └── chapters/
│       └── [id]/             # Chapter detail and edit
├── layout.tsx                # Root layout
└── globals.css               # Global styles

components/
├── ui/                       # UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   └── card.tsx
└── navbar.tsx                # Navigation bar

lib/
├── api.ts                    # Axios instance
├── types.ts                  # TypeScript types
├── services.ts               # API service functions
├── auth-context.tsx          # Authentication context
└── utils.ts                  # Utility functions
```
