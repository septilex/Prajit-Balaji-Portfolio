'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { getGithubContributions, GithubData } from '@/lib/githubContributions';
import { motion } from 'framer-motion';

// three.js + react-three-fiber are by far the largest dependencies on the page.
// Loading them in a separate chunk keeps them out of the initial bundle, so the
// browser isn't parsing/compiling ~1MB of 3D code while the intro is playing.
const GithubGraph3D = dynamic(() => import('./GithubGraph3D'), {
  ssr: false,
  loading: () => <Placeholder spinner />,
});

function Placeholder({ spinner, children }: { spinner?: boolean; children?: React.ReactNode }) {
  return (
    <div className="w-full h-[600px] flex items-center justify-center bg-neutral-100 rounded-3xl border border-neutral-200">
      {spinner ? (
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      ) : (
        children
      )}
    </div>
  );
}

export default function GithubContributions({ username = 'septilex' }: { username?: string }) {
  const [data, setData] = useState<GithubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [year, setYear] = useState<"2026" | "2025">("2026");
  const [nearView, setNearView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Only mount the WebGL scene once the section is about to scroll into view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearView(true);
          io.disconnect();
        }
      },
      { rootMargin: '800px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!nearView) return;
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
  }, [username, year, nearView]);

  let content: React.ReactNode;
  if (loading) {
    content = <Placeholder spinner />;
  } else if (!data || data.days.length === 0) {
    content = (
      <Placeholder>
        <p className="text-neutral-500 font-medium">Failed to load GitHub contributions.</p>
      </Placeholder>
    );
  } else {
    // Note: no CSS `filter: blur()` in this reveal — animating a filter on top of
    // a live WebGL canvas forces the whole canvas to be re-filtered every frame.
    content = (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20% 0px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl mx-auto py-12 relative"
      >
        <GithubGraph3D data={data.days} totalContributions={data.total} year={year} onYearChange={(y) => setYear(y as "2026" | "2025")} isFetching={isFetching} />
      </motion.div>
    );
  }

  return <div ref={rootRef}>{content}</div>;
}
