# BlogCMS - Multi-User Blog Management System

A comprehensive Content Management System (CMS) specifically designed for managing blog sections across multiple portfolio websites. Built with React, TypeScript, and Supabase.

## Features

### 🔐 Authentication & User Management
- User registration and secure sign-in system
- Individual user profiles and settings
- Complete data isolation between users
- Password reset functionality

### 📝 Blog Content Management
- Rich text editor with markdown support and live preview
- Draft, published, and inactive status management
- SEO metadata management (title, description, keywords)
- Featured images and media management
- Reading time calculation
- Automatic slug generation
- Tag system for categorization

### 🔑 API Integration
- Unique API key generation per user
- RESTful API endpoints for external consumption
- CORS-enabled API for cross-origin requests
- API usage tracking and management

### 🎨 Modern UI/UX
- Clean, intuitive dashboard design
- Responsive layout for all device sizes
- Dark/light mode support
- Smooth animations and transitions
- Professional color system and typography

### 🛡️ Security & Performance
- Row-level security (RLS) policies in Supabase
- API key authentication for external access
- Input sanitization and XSS protection
- Efficient caching and optimization

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Editor**: React Quill (Rich text editing)
- **Forms**: React Hook Form with Yup validation
- **Routing**: React Router Dom
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blogcms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the database migration in Supabase SQL editor:
     ```sql
     -- Copy and run the content from supabase/migrations/create_blog_cms_schema.sql
     ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Deploy Edge Function (Optional)**
   If you want to use the API endpoint:
   - Deploy the edge function from `supabase/functions/blog-api/index.ts`
   - This provides external API access for portfolio integration

6. **Start the development server**
   ```bash
   npm run dev
   ```

## Usage

### For CMS Users

1. **Sign Up**: Create your account at `/signup`
2. **Dashboard**: Overview of your blog statistics and recent posts
3. **Create Blogs**: Use the rich text editor with live preview
4. **Manage Status**: Switch between draft, published, and inactive
5. **API Keys**: Generate keys for external portfolio integration
6. **SEO Optimization**: Add meta titles, descriptions, and tags

### For Portfolio Integration

Use your API key to fetch published blogs:

```javascript
// Fetch all published blogs
const response = await fetch(`https://your-supabase-url.supabase.co/functions/v1/blog-api/blogs`, {
  headers: {
    'Authorization': `Bearer YOUR_API_KEY`,
    'apikey': 'YOUR_SUPABASE_ANON_KEY'
  }
});

const { data: blogs } = await response.json();

// Fetch specific blog by slug
const response = await fetch(`https://your-supabase-url.supabase.co/functions/v1/blog-api/blogs/${slug}`, {
  headers: {
    'Authorization': `Bearer YOUR_API_KEY`,
    'apikey': 'YOUR_SUPABASE_ANON_KEY'
  }
});

const { data: blog } = await response.json();
```

### Blog Data Structure

```typescript
interface Blog {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image_url?: string;
  status: 'draft' | 'published' | 'inactive';
  reading_time: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  tags?: Array<{
    name: string;
    slug: string;
    color: string;
  }>;
}
```

## Database Schema

The system uses the following main tables:

- `users` - User profiles and information
- `user_api_keys` - API keys for external integration
- `blogs` - Blog posts with metadata
- `blog_tags` - Tag definitions
- `blog_post_tags` - Blog-tag relationships
- `media` - Uploaded media files

All tables use Row Level Security (RLS) to ensure data isolation between users.

## API Endpoints

### External API (via Edge Function)

- `GET /functions/v1/blog-api/blogs` - List published blogs
- `GET /functions/v1/blog-api/blogs/{slug}` - Get specific blog by slug

Query parameters:
- `status` - Filter by status (default: 'published')
- `limit` - Number of blogs to return (default: 50)
- `offset` - Pagination offset (default: 0)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- All user data is isolated using Supabase RLS policies
- API keys are hashed and secured
- Input validation and sanitization
- CORS properly configured for API access
- Authentication required for all CMS operations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for the developer community**