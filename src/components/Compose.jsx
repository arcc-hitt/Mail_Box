import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { sendMail } from '../services/mail'
import { auth } from '../firebase'

const composeSchema = z.object({
  to: z.string().trim().email('Enter a valid recipient email'),
  subject: z.string().trim().min(1, 'Subject is required'),
  body: z.string().optional(),
})

function Compose() {
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''
  const from = auth.currentUser?.email || ''

  const { register, handleSubmit, formState: { errors, isValid }, reset, setValue } = useForm({
    resolver: zodResolver(composeSchema),
    mode: 'onChange',
    defaultValues: { to: '', subject: '', body: '' },
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: '',
    editorProps: {
      attributes: { class: 'form-control p-3 prose border' },
    },
    onUpdate: ({ editor }) => {
      // Sync to form state
      const html = editor.getHTML()
      setValue('body', html, { shouldValidate: false })
    }
  })

  const onSubmit = async (values) => {
    try {
      setServerError('')
      setSuccess('')
      const html = editor?.getHTML() || ''
      await sendMail({ from, to: values.to, subject: values.subject, html, token })
      setSuccess('Mail sent successfully!')
      editor?.commands.clearContent()
      reset()
    } catch (err) {
      setServerError(err?.message || 'Failed to send mail')
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-3 p-md-4">
        <h5 className="mb-3">Compose</h5>

        {serverError && <div className="alert alert-danger">{serverError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label htmlFor="to" className="form-label">To</label>
            <input id="to" type="email" className={`form-control ${errors.to ? 'is-invalid' : ''}`} placeholder="recipient@example.com" {...register('to')} />
            {errors.to && <div className="invalid-feedback">{errors.to.message}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="subject" className="form-label">Subject</label>
            <input id="subject" type="text" className={`form-control ${errors.subject ? 'is-invalid' : ''}`} placeholder="Subject" {...register('subject')} />
            {errors.subject && <div className="invalid-feedback">{errors.subject.message}</div>}
          </div>
          {/* Hidden input to keep body value in RHF */}
          <input id="compose-body" type="hidden" {...register('body')} />
          <div className="mb-2">
            <label className="form-label">Message</label>
            {/* Toolbar */}
            <div className="editor-toolbar btn-toolbar mb-2" role="toolbar">
              <div className="btn-group me-2" role="group">
                <button type="button" className={`btn btn-sm btn-outline-secondary ${editor?.isActive('bold') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleBold().run()}><strong>B</strong></button>
                <button type="button" className={`btn btn-sm btn-outline-secondary ${editor?.isActive('italic') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleItalic().run()}><em>I</em></button>
                <button type="button" className={`btn btn-sm btn-outline-secondary ${editor?.isActive('underline') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleUnderline().run()}><u>U</u></button>
              </div>
              <div className="btn-group me-2" role="group">
                <button type="button" className={`btn btn-sm btn-outline-secondary ${editor?.isActive('heading', { level: 1 }) ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
                <button type="button" className={`btn btn-sm btn-outline-secondary ${editor?.isActive('heading', { level: 2 }) ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
                <button type="button" className={`btn btn-sm btn-outline-secondary ${editor?.isActive('paragraph') ? 'active' : ''}`} onClick={() => editor?.chain().focus().setParagraph().run()}>P</button>
              </div>
              <div className="btn-group me-2" role="group">
                <button type="button" className={`btn btn-sm btn-outline-secondary ${editor?.isActive('bulletList') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
                <button type="button" className={`btn btn-sm btn-outline-secondary ${editor?.isActive('orderedList') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
                <button type="button" className={`btn btn-sm btn-outline-secondary ${editor?.isActive('blockquote') ? 'active' : ''}`} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>❝ Quote</button>
              </div>
              <div className="btn-group me-2" role="group">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => editor?.chain().focus().undo().run()}>Undo</button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => editor?.chain().focus().redo().run()}>Redo</button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</button>
              </div>
            </div>
            <EditorContent editor={editor} />
          </div>

          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  )
}

export default Compose
