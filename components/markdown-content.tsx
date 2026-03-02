"use client";

import ReactMarkdown from "react-markdown";

/** Basit markdown render — XSS güvenli (HTML kapalı) */
export function MarkdownContent({ content, className }: { content: string; className?: string }) {
  if (!content?.trim()) return null;
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc pl-4 my-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 my-1">{children}</ol>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
