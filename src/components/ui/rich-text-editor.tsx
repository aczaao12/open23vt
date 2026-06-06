import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TurndownService from 'turndown'
import { marked } from 'marked'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2 } from 'lucide-react'

const turndown = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
})

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

interface ToolbarBtnProps {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
}

function ToolbarBtn({ onClick, active, children }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={`p-1.5 rounded hover:bg-accent transition-colors ${active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder: placeholder || 'Nhập nội dung...' }),
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = html === '<p></p>' ? '' : turndown.turndown(html)
      onChange(markdown)
    },
  })

  useEffect(() => {
    if (editor && value) {
      const html = marked.parse(value, { async: false }) as string
      editor.commands.setContent(html)
    }
  }, [editor]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="flex items-center gap-0.5 p-1.5 border-b bg-muted/30">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic className="h-4 w-4" />
        </ToolbarBtn>
        <span className="w-px h-5 bg-border mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
          <Heading1 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          <Heading2 className="h-4 w-4" />
        </ToolbarBtn>
        <span className="w-px h-5 bg-border mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarBtn>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-3 min-h-[150px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror_p]:my-0.5 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0" />
    </div>
  )
}
