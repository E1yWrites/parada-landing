import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/technical/`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/docs/`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/legal/`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/legal/terms/`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/legal/privacy/`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/legal/licenses/`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
