# MVP Generator AI

A comprehensive full-stack web application that generates detailed MVP (Minimum Viable Product) plans using AI. The platform helps entrepreneurs and startups create business plans, tech stacks, monetization strategies, and development roadmaps powered by Google's Gemini AI.

## ✨ Features

### 🚀 AI-Powered MVP Generation
- **Comprehensive Business Plans**: Generate detailed startup plans with tech stacks, features, and timelines
- **Smart Recommendations**: AI-driven suggestions for monetization, marketing, and development strategies
- **Multiple Industries**: Support for various business sectors and target audiences
- **Budget-Aware Planning**: Tailored recommendations based on available budget

### 📝 Automated SEO Blog System
- **Auto Blog Generation**: AI creates SEO-optimized blog posts automatically
- **Flexible Scheduling**: Daily (1-5 posts), weekly (1-7 posts), or monthly (1-30 posts) publishing
- **Latest Trends Integration**: Uses current year (2025) topics and trending keywords
- **Platform-Focused Content**: Generates content related to MVP development and startup ecosystem
- **SEO Optimization**: Meta tags, structured data, and keyword optimization

### 💰 Advanced Monetization
- **Multiple Ad Types**: Native ads, banner ads, sidebar ads, and content ads
- **Strategic Ad Placement**: Optimized ad positioning for maximum revenue
- **Responsive Design**: Ads adapt to all device sizes
- **Ad Management Dashboard**: Control ad frequency and placement through admin panel

### 📊 Analytics & Admin Dashboard
- **User Behavior Tracking**: Page views, session tracking, and user interaction analytics
- **Admin Controls**: Complete site management including maintenance mode
- **Contact Management**: Handle user inquiries and feedback
- **API Key Rotation**: Automatic switching between multiple Gemini API keys when limits are reached

### 🔐 Security & Performance
- **Secure Authentication**: Environment-based admin credentials
- **Session Management**: Encrypted sessions with PostgreSQL storage
- **Database Optimization**: Efficient Drizzle ORM with connection pooling
- **CORS Protection**: Proper cross-origin resource sharing configuration

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for client-side routing
- **Radix UI** primitives with shadcn/ui design system
- **Tailwind CSS** for styling with dark mode support
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Vite** for fast development and building

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** database with Drizzle ORM
- **Google Gemini AI** for content generation
- **Express Sessions** with PostgreSQL store
- **Hot reloading** with Vite middleware integration

### Database Schema
- `analytics` - User interaction tracking
- `mvp_generations` - AI-generated MVP plans
- `blog_posts` - SEO content management
- `contacts` - Contact form submissions
- `admin_settings` - Administrative configuration
- `api_keys` - API key management and rotation
- `advertisements` - Ad management
- `auto_blog_settings` - Automated blog configuration
- `auto_blog_queue` - Blog generation queue
- `site_settings` - Global site configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 20 or higher
- PostgreSQL database
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mvp-generator-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your database URL, admin credentials, and API keys

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5000
   - Admin Panel: http://localhost:5000/admin

### Environment Variables

Create a `.env` file or set the following environment variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Admin Authentication
ADMIN_USER=your-admin-username
ADMIN_PASS=your-admin-password

# Session Security
SESSION_SECRET=your-secure-random-session-secret-key

# AI Services
GEMINI_API_KEY=your-google-gemini-api-key

# Optional: Additional API keys for rotation
GEMINI_API_KEY_2=your-backup-gemini-api-key
GEMINI_API_KEY_3=your-third-gemini-api-key
```

## 📱 Usage

### For End Users

1. **Generate MVP Plans**
   - Visit the MVP Generator page
   - Enter your startup idea, industry, target audience, and budget
   - Get a comprehensive AI-generated business plan
   - Export or save your results

2. **Browse Blog Content**
   - Read SEO-optimized articles about startups and MVP development
   - Get insights on business planning and development strategies

3. **Contact Support**
   - Use the contact form for inquiries
   - Get help with your MVP planning process

### For Administrators

1. **Access Admin Dashboard**
   - Login with your admin credentials at `/admin`
   - Monitor site analytics and user interactions

2. **Manage Content**
   - Create, edit, and delete blog posts
   - Configure auto blog generation settings
   - Schedule automated content publishing

3. **Configure Monetization**
   - Set up and manage advertisements
   - Control ad placement and frequency
   - Monitor revenue from different ad positions

4. **Site Management**
   - Update site settings and contact information
   - Enable maintenance mode when needed
   - Manage API keys and monitor usage

## 🔧 API Key Management

The system supports automatic API key rotation to handle rate limits:

1. **Primary Key**: Main Gemini API key for regular operations
2. **Backup Keys**: Additional keys automatically used when primary key hits limits
3. **Auto Reset**: Keys are automatically re-enabled after 24 hours
4. **Usage Tracking**: Monitor daily usage for each API key

## 📈 SEO & Content Strategy

### Automated Blog Features
- **Trend-Based Topics**: Uses current industry trends and 2025 topics
- **Platform Integration**: Content relates to MVP development and startup ecosystem
- **Keyword Optimization**: Strategic keyword placement for search engines
- **Meta Tags**: Automatic generation of SEO-friendly meta descriptions and titles
- **Structured Data**: Schema markup for better search engine understanding

### Content Scheduling
- **Daily Posts**: 1-5 automatically generated posts per day
- **Weekly Batches**: 1-7 posts distributed throughout the week
- **Monthly Planning**: 1-30 posts scheduled across the month
- **Custom Topics**: Define specific topics and themes for content generation

## 🚢 Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Deployment Checklist

- [ ] Set all required environment variables
- [ ] Configure PostgreSQL database
- [ ] Set up Google Gemini API keys
- [ ] Configure admin credentials
- [ ] Test all functionality in staging
- [ ] Set up monitoring and logging

## 🔒 Security Features

- **Environment Variables**: All sensitive data stored in environment variables
- **Session Encryption**: Secure session management with encrypted cookies
- **CORS Protection**: Proper cross-origin resource sharing configuration
- **Input Validation**: Comprehensive validation using Zod schemas
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **Admin Authentication**: Protected admin routes with session validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README for detailed setup instructions
- **Issues**: Report bugs or request features through GitHub issues
- **Contact**: Use the contact form on the website for direct support

## 🔄 Updates & Maintenance

The application includes built-in systems for:
- Automatic database migrations
- API key rotation and monitoring
- Content generation scheduling
- Analytics tracking and reporting
- Error logging and monitoring

---

**Built with ❤️ for entrepreneurs and startups looking to validate and develop their ideas efficiently.**