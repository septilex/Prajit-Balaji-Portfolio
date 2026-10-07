'use client';

import React, { useEffect, useState } from 'react';
import { getGithubContributions, ContributionDay } from '@/lib/githubContributions';
import GithubGraph3D from './GithubGraph3D';

export default function GithubContributions({ username = 'septilex' }: { username?: string }) {
  const [data, setData] = useState<ContributionDay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [year, setYear] = useState<"2026" | "2025">("2026");

  useEffect(() => {
    async function load() {
      setIsFetching(true);
      const res = await getGithubContributions(username, year);
      setData(res);
      setLoading(false);
      setIsFetching(false);
    }
    load();
  }, [username, year]);

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-neutral-100 rounded-3xl border border-neutral-200">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-neutral-100 rounded-3xl border border-neutral-200">
        <p className="text-neutral-500 font-medium">Failed to load GitHub contributions.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-12 relative">
      <GithubGraph3D data={data} year={year} onYearChange={(y) => setYear(y as "2026" | "2025")} isFetching={isFetching} />
    </div>
  );
}
