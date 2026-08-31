import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/checkout/",
          "/cart",
          "/login",
          "/register",
          "/wishlist",
        ],
      },
    ],
    sitemap: "https://www.dfoclothing.com/sitemap.xml",
  };
}
