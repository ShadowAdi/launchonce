# LaunchOnce 🚀

**Create once, share everywhere** - A modern platform for creating documents and forms with automatic translation to 50+ languages.

![LaunchOnce](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🌟 What is LaunchOnce?

LaunchOnce is a powerful content management platform that allows you to:

- **Create Rich Documents** - Write product announcements, portfolios, or any content with a beautiful rich text editor
- **Build Interactive Forms** - Create surveys, feedback forms, and questionnaires attached to your documents
- **Share Globally** - Your content is automatically translated to 50+ languages for worldwide reach
- **Zero Setup** - Get your content live in under 2 minutes with a unique shareable URL

Perfect for product launches, documentation, portfolios, announcements, and global content distribution.

## ✨ Key Features

- 📝 **Rich Text Editor** - BlockNote-based editor with full formatting, code syntax highlighting, and media embeds
- 🌍 **Automatic Translation** - Powered by Lingo.dev - content translates in real-time for visitors
- 📊 **Dynamic Forms** - Create multi-step forms with various field types (text, select, email, URL, boolean)
- 🔐 **Authentication** - Secure JWT-based authentication with automatic login on registration
- 📱 **Responsive Design** - Beautiful UI that works seamlessly on all devices
- ⚡ **Cold Start Handling** - Automatic retry logic for Vercel serverless functions
- 🎨 **Clean Design** - Minimal, award-winning aesthetic with smooth animations
- 👁️ **View Tracking** - Automatic view count for your documents

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form management with Zod validation
- **BlockNote** - Rich text editing
- **Shadcn/ui** - Beautiful UI components

### Backend
- **Next.js Server Actions** - Server-side logic
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe database access
- **bcrypt** - Password hashing
- **JWT** - Token-based authentication
- **Lingo.dev** - Translation service

### DevOps
- **Vercel** - Deployment platform (optimized for cold starts)
- **Git** - Version control

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **PostgreSQL** database (local or hosted)
- **npm** or **yarn** package manager
- **Lingo.dev API key** (for translation features)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ShadowAdi/launchonce.git
cd launchonce
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/launchonce"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Lingo.dev Translation API
LINGO_API_KEY="your-lingo-api-key"
LINGO_BASE_URL="https://api.lingo.dev"

# Optional: Node Environment
NODE_ENV="development"
```

### 4. Database Setup

Run the database migrations:

```bash
npm run db:push
# or
npx drizzle-kit push
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
launchonce/
├── actions/              # Server actions
│   ├── document.action.ts
│   ├── form.action.ts
│   ├── translation.action.ts
│   └── user.action.ts
├── app/                  # Next.js App Router
│   ├── (auth)/          # Auth pages (login, register)
│   ├── (dashboard)/     # Protected dashboard routes
│   ├── [slug]/          # Public document pages
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/           # React components
│   ├── global/          # Shared components
│   └── ui/              # Shadcn UI components
├── context/              # React context
│   └── AuthContext.tsx  # Authentication state
├── db/                   # Database
│   ├── db.ts            # Database connection
│   └── schema.ts        # Database schema
├── lib/                  # Utilities
│   ├── retry-helper.ts  # Cold start retry logic
│   ├── utils.ts         # Helper functions
│   └── validations/     # Zod schemas
└── types/                # TypeScript types
```

## 🔑 Key Features Explained

### Authentication Flow
1. Users register with name, email, and password
2. Password is hashed with bcrypt
3. JWT token is generated automatically
4. User is logged in and redirected to dashboard
5. Token stored in localStorage via AuthContext

### Document Creation
1. Create document with title, subtitle, description
2. Add rich content using BlockNote editor
3. Optional cover image and tags
4. Publish to get unique shareable URL
5. Automatic view tracking

### Translation System
1. Content stored in original language
2. Visitor's language detected automatically
3. Content translated via Lingo.dev API
4. Cached for performance
5. 50+ languages supported

### Form System
1. Attach forms to documents
2. Multiple field types supported
3. Conditional visibility options
4. Response collection and management
5. Public response listing (optional)

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
npm run db:generate  # Generate migrations
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Environment Variables for Production

Make sure to set these in Vercel:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Strong random secret
- `LINGO_API_KEY` - Your Lingo.dev API key
- `LINGO_BASE_URL` - Lingo API URL

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **[Lingo.dev](https://lingo.dev)** - Translation API
- **[Kombai](https://kombai.com)** - Design inspiration
- **[Shadcn/ui](https://ui.shadcn.com)** - UI components
- **[BlockNote](https://www.blocknotejs.org/)** - Rich text editor

## 📧 Contact

**GitHub**: [@ShadowAdi](https://github.com/ShadowAdi)
**Repository**: [https://github.com/ShadowAdi/launchonce](https://github.com/ShadowAdi/launchonce)

---

Made with ❤️ by ShadowAdi
