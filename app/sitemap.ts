import { getAllActivitySlugs, getAllTopicSlugs, getAllCompareSlugs } from '@/lib/seo-content'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://montessori-navigator.com'

export default function sitemap() {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/assessment`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  const activityPages = getAllActivitySlugs().map(slug => ({
    url: `${BASE_URL}/guides/activities/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const topicPages = getAllTopicSlugs().map(slug => ({
    url: `${BASE_URL}/guides/topics/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const comparePages = getAllCompareSlugs().map(slug => ({
    url: `${BASE_URL}/guides/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...activityPages, ...topicPages, ...comparePages]
}
