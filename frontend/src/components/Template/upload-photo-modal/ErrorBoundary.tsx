"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error(
      "Upload Modal Error Boundary caught an error:",
      error,
      errorInfo
    );

    // Call the optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI or default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#E5E5E0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              padding: "32px",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2
              style={{
                color: "#d32f2f",
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              Upload Error
            </h2>
            <p
              style={{
                color: "#666",
                fontSize: "1rem",
                lineHeight: "1.5",
                marginBottom: "24px",
              }}
            >
              Something went wrong with the upload modal. Please try refreshing
              the page.
            </p>
            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Refresh Page
              </button>
              <button
                onClick={() =>
                  this.setState({ hasError: false, error: undefined })
                }
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Try Again
              </button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details
                style={{
                  marginTop: "24px",
                  textAlign: "left",
                  backgroundColor: "#f8f9fa",
                  padding: "16px",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: "500" }}>
                  Error Details (Development Only)
                </summary>
                <pre
                  style={{
                    marginTop: "12px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    color: "#d32f2f",
                  }}
                >
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
