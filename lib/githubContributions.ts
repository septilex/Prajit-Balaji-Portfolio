'use server';

import { unstable_cache } from 'next/cache';

export interface ContributionDay {
  date: string;
  level: number;
  text?: string;
}

export interface GithubData {
  days: ContributionDay[];
  total: string;
}

export const getGithubContributions = unstable_cache(
  async (username: string, year?: string): Promise<GithubData> => {
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
      
      const tooltipRegex = /<tool-tip[^>]+for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g;
      const tooltips: Record<string, string> = {};
      let tooltipMatch;
      while ((tooltipMatch = tooltipRegex.exec(html)) !== null) {
        // strip any inner HTML tags (like <strong>) just in case
        const cleanText = tooltipMatch[2].replace(/<[^>]*>?/gm, '').trim();
        tooltips[tooltipMatch[1]] = cleanText;
      }
      
      let match;
      while ((match = regex.exec(html)) !== null) {
        const id = match[2];
        const dateStr = match[1];
        dates.push({ 
          date: dateStr, 
          level: parseInt(match[3]),
          text: tooltips[id] || `No contributions on ${dateStr}`
        });
      }

      const totalMatch = html.match(/([0-9,]+)\s+contributions/i);
      const total = totalMatch ? totalMatch[1] : "0";

      return { days: dates, total };
    } catch (error) {
      console.error(error);
      return { days: [], total: "0" };
    }
  },
  ['github-contributions-total'],
  { revalidate: 3600 }
);
