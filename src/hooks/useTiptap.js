import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'

export function useTiptap({ onUpdate }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: true, autolink: true, linkOnPaste: true }),
    ],
    content: '',
    editorProps: { attributes: { class: 'form-control p-3 prose border' } },
    onUpdate,
  })
  return editor
}
