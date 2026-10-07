'use server';

import { unstable_cache } from 'next/cache';

export interface ContributionDay {
  date: string;
  level: number;
}

export const getGithubContributions = unstable_cache(
  async (username: string, year?: string): Promise<ContributionDay[]> => {
    try {
      const url = year 
        ? `https://github.com/users/${username}/contributions?from=${year}-01-01&to=${year}-12-31`
        : `https://github.com/users/${username}/contributions`;
        
      const res = await fetch(url, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch contributions');
      }

      const html = await res.text();
      
      const dates: ContributionDay[] = [];
      const regex = /<td[^>]+data-date="([^"]+)"[^>]+id="([^"]+)"[^>]+data-level="([^"]+)"[^>]*>/g;
      
      let match;
      while ((match = regex.exec(html)) !== null) {
        dates.push({ date: match[1], level: parseInt(match[3]) });
      }

      return dates;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  ['github-contributions'],
  { revalidate: 3600 }
);
