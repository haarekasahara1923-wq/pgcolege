# Prathvi Group of College - Official Website

This is a complete, production-ready, fully responsive Next.js web application for "Prathvi Group of College". It includes a dynamic public-facing website and a comprehensive, secure admin panel.

## Technology Stack
- **Framework:** Next.js (App Router, Server Actions)
- **Styling:** Tailwind CSS + Lucide React Icons
- **Database:** PostgreSQL (Neon Serverless Postgres)
- **ORM:** Prisma Client
- **Image/Video Hosting:** Cloudinary
- **Authentication:** Custom JWT-based stateless auth
- **Deployment:** Vercel (Recommended)

## Project Structure
- `app/(public)`: All public-facing routes (Home, About, Colleges, Gallery, Contact)
- `app/admin`: The secure admin dashboard and CRUD interfaces
- `app/api`: Edge API routes (including rate-limited enquiry submission)
- `components/`: Reusable React components (UI, Admin, Public)
- `lib/`: Utility functions, Prisma configuration, schema validation (Zod), and Cloudinary integrations
- `actions/`: Next.js Server Actions for secure database mutations

## Features Implemented
- **Dynamic Content:** Admin can add/edit Colleges, Courses, Gallery Items (Images/Videos), About details, and Contact information.
- **Enquiry System:** User inquiries are captured and rate-limited. Admins can track status and leave notes.
- **Media Optimization:** Direct-to-Cloudinary upload ensures media is optimized and doesn't rely on the server filesystem.
- **Responsive Aesthetics:** Premium dynamic design utilizing modern micro-animations, gradients, and proper layout techniques.
- **SEO Optimized:** Metadata, sitemap generation, and clean semantic markup.

## Setup Instructions (Local)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   # PostgreSQL Database (Neon)
   DATABASE_URL="your-neon-pooling-url"
   DIRECT_URL="your-neon-direct-url"

   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # Admin Auth
   JWT_SECRET="generate-a-secure-random-string"
   ```

3. **Database Setup:**
   Generate Prisma client and push the schema to your Neon database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   *(Optional)* Run the seed script to create the initial admin user and default content:
   ```bash
   npx ts-node prisma/seed.ts
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## Deployment Instructions (Vercel)

This application is fully optimized for deployment on Vercel.

1. **Push your code to GitHub/GitLab/Bitbucket.**
2. **Import the repository into Vercel.**
3. **Configure Environment Variables:**
   In the Vercel project settings, add all the environment variables listed in your `.env` file (`DATABASE_URL`, `DIRECT_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `JWT_SECRET`).
4. **Deploy:**
   Vercel will automatically detect Next.js.
   - Build Command: `prisma generate && next build`
   - Install Command: `npm install`
5. **Post-Deployment:**
   - Once deployed, you can access the admin panel at `your-domain.com/admin/login`.
   - The default admin credentials (if you ran the seed script) are `admin@prathvi.edu.in` / `Prathvi@2024`. **Change the password immediately.**

## Production Notes
- **Serverless Environment:** This app writes no files to the local disk. Media uploads go directly from the client to Cloudinary via signed URLs, ensuring full compatibility with Vercel's serverless architecture.
- **Caching & Revalidation:** Next.js caching is utilized heavily. Server actions call `revalidatePath` and `revalidateTag` to instantly update the public site when an admin makes changes.
