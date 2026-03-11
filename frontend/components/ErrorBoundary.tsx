"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 text-center px-6">
          <span className="text-5xl">⚡</span>
          <h2 className="font-playfair font-bold text-verdant-dark text-3xl">
            Something broke
          </h2>
          <p className="text-verdant-muted text-sm max-w-sm">
            An unexpected error occurred. Try refreshing.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green text-white px-8 py-3.5 rounded-full text-sm font-semibold"
          >
            Refresh page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
