import type { MetadataRoute } from "next";

const BASE_URL = "https://www.dfoclothing.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.dfoclothing.com";

interface ApiProduct {
  id: number;
  isActive?: boolean;
}

interface ApiCategory {
  id?: number;
  name: string;
  active?: boolean;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // 1. Static public indexable pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/men`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/women`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/footwear`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/accessories`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/puma-world`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/shipping`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/returns`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // 2. Dynamic category pages (fail-safe)
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const categories: ApiCategory[] = await res.json();
      if (Array.isArray(categories)) {
        categoryRoutes = categories
          .filter((cat) => cat && cat.active !== false && cat.name)
          .map((cat) => ({
            url: `${BASE_URL}/category/${encodeURIComponent(cat.name.toLowerCase())}`,
            lastModified: currentDate,
            changeFrequency: "weekly" as const,
            priority: 0.7,
          }));
      }
    }
  } catch (err) {
    console.warn("[Sitemap] Unable to fetch dynamic categories for sitemap:", err);
  }

  // 3. Dynamic product pages (fail-safe)
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/products?page=0&size=1000`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      const products: ApiProduct[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : [];

      productRoutes = products
        .filter((prod) => prod && prod.id && prod.isActive !== false)
        .map((prod) => ({
          url: `${BASE_URL}/products/${prod.id}`,
          lastModified: currentDate,
          changeFrequency: "daily" as const,
          priority: 0.8,
        }));
    }
  } catch (err) {
    console.warn("[Sitemap] Unable to fetch dynamic products for sitemap:", err);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
