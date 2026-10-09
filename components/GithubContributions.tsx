'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getGithubContributions, ContributionDay, GithubData } from '@/lib/githubContributions';
import GithubGraph3D from './GithubGraph3D';
import { motion } from 'framer-motion';

export default function GithubContributions({ username = 'septilex' }: { username?: string }) {
  const [data, setData] = useState<GithubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [year, setYear] = useState<"2026" | "2025">("2026");
  
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setIsFetching(true);
      const res = await getGithubContributions(username, year);
      if (!ignore) {
        setData(res);
        setLoading(false);
        setIsFetching(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [username, year]);

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-neutral-100 rounded-3xl border border-neutral-200">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.days.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-neutral-100 rounded-3xl border border-neutral-200">
        <p className="text-neutral-500 font-medium">Failed to load GitHub contributions.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: false, margin: "-20% 0px" }}
      onViewportEnter={() => setIsInView(true)}
      onViewportLeave={() => setIsInView(false)}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-7xl mx-auto py-12 relative"
    >
      <GithubGraph3D data={data.days} totalContributions={data.total} year={year} onYearChange={(y) => setYear(y as "2026" | "2025")} isFetching={isFetching} isInView={isInView} />
    </motion.div>
  );
}
