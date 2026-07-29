"use client";

import { Component, type ReactNode } from "react";

type KeyboardSceneBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  onError: () => void;
};

type KeyboardSceneBoundaryState = {
  failed: boolean;
};

export class KeyboardSceneBoundary extends Component<
  KeyboardSceneBoundaryProps,
  KeyboardSceneBoundaryState
> {
  state: KeyboardSceneBoundaryState = { failed: false };

  static getDerivedStateFromError(): KeyboardSceneBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
