import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownViewerProps {
  content: string | null | undefined
  className?: string
}

export default function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  if (!content) return <span className="text-muted-foreground">-</span>

  return (
    <div className={`prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
