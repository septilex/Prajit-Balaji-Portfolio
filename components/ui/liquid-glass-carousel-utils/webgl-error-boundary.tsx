"use client";

import React, { Component, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WebGLErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

export class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, WebGLErrorBoundaryState> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): WebGLErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("WebGL Carousel Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export function WebGLFallback({ className, message }: { className?: string; message: string }) {
  return (
    <div className={cn("flex items-center justify-center bg-transparent", className)}>
      <p className="text-sm font-medium text-[#f2ece1]/70">{message}</p>
    </div>
  );
}
