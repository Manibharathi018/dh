# Frontend Vercel Deployment Guide

This document outlines the professional deployment architecture and procedure for your Next.js frontend to Vercel, ensuring your Spring Boot backend on AWS remains fully intact and decoupled.

---

## Architecture Overview

```text
Next.js Frontend (Vercel)
          │
          │ HTTPS (Cross-Origin)
          ▼
Spring Boot Backend API (AWS)
          │
      ┌───┴───┐
      ▼       ▼
    MySQL   AWS S3
```

- **Frontend responsibility**: UI, routing, SSR/SSG, Razorpay checkout flow initiation.
- **Backend responsibility**: Authentication, Authorization, Database logic, Razorpay verification, Security.

---

## 1. Vercel Configuration Settings

When you import the `frontend` folder to Vercel, use the following exact settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Next.js` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Install Command** | `npm install` |
| **Output Directory** | `Next.js default` |

---

## 2. Environment Variables (Vercel)

Do NOT place secrets (like AWS secret keys or database passwords) in the frontend Vercel dashboard.

You must add the following **Environment Variables** in the Vercel Project Settings:

1. `NEXT_PUBLIC_API_URL`
   - **Value**: Your actual AWS production backend URL (e.g., `https://api.mywebsite.com`)
   - **Important**: Do NOT include a trailing slash. Must use HTTPS.
   
2. `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - **Value**: Your live Razorpay Key ID (e.g., `rzp_live_...`)
   - **Important**: Do NOT expose your Razorpay Secret Key here. The secret key goes in your Spring Boot backend configuration.

---

## 3. Spring Boot Backend Requirements

Before your Vercel frontend can talk to your AWS backend, you **MUST** configure your Spring Boot backend to accept the Vercel domain.

### CORS Configuration
Your Spring Boot application must explicitly allow the Vercel production origin (and preview origins if desired).

**Example Spring Boot Config:**
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://www.yourverceldomain.com", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

*Note: Without proper CORS configuration on the backend, all API calls from Vercel will fail with a Network Error.*

---

## 4. Next.js Configuration (`next.config.ts`)

The `next.config.ts` file has been pre-configured to allow S3 image optimization:

```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "s3.*.amazonaws.com" },
    { protocol: "https", hostname: "*.s3.amazonaws.com" }
  ]
}
```
*If you use a custom CDN domain (e.g., CloudFront) for your S3 bucket later, you will need to add it to the `remotePatterns` list.*

---

## 5. Security Checklist

- [x] **No hardcoded localhost URLs**: The API client now dynamically uses `NEXT_PUBLIC_API_URL`.
- [x] **No backend secrets exposed**: The frontend relies strictly on JWT token exchange.
- [x] **Custom 404 Page**: Replaced the default Next.js error screen with a branded `not-found.tsx` for production polish.
- [x] **SEO Optimized**: `layout.tsx` metadata is upgraded for OpenGraph and social sharing.

---

## 6. Final Test After Deployment

Once Vercel gives you your production URL (e.g., `https://my-store.vercel.app`), verify the following critical flows:
1. Try logging in (verifies CORS & Backend connection).
2. Check if product images load (verifies S3/Unsplash remote patterns).
3. Attempt an invalid route like `/this-does-not-exist` (verifies the custom 404 page).
4. Run through the Razorpay checkout modal (verifies the Razorpay Public Key).
