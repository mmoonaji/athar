import { MetadataRoute } from 'next'

/**
 * Dynamic Next.js Sitemap builder.
 * Generates crawler mapping of public routes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://athar-app.vercel.app'

  // Static routes
  const routes = [
    '',
    '/learn',
    '/login',
    '/signup',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // Dynamic lesson slugs mapping
  const lessons = [
    'what-is-iman',
    'three-types-of-tawhid',
    'importance-of-taharah',
    'how-to-wudu',
    'pillars-of-prayer',
  ].map((slug) => ({
    url: `${baseUrl}/lesson/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...routes, ...lessons]
}
