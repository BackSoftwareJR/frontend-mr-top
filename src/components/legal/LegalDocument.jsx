import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { resolveLegalHref } from '../../constants/legalDocuments'

function MarkdownLink({ href, children, ...props }) {
  const resolved = resolveLegalHref(href)

  if (resolved?.startsWith('#')) {
    return (
      <a href={resolved} className="text-teal-800 hover:underline" {...props}>
        {children}
      </a>
    )
  }

  if (resolved) {
    return (
      <Link to={resolved} className="text-teal-800 hover:underline" {...props}>
        {children}
      </Link>
    )
  }

  if (href?.startsWith('http')) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal-800 hover:underline"
        {...props}
      >
        {children}
      </a>
    )
  }

  if (href?.startsWith('mailto:')) {
    return (
      <a href={href} className="text-teal-800 hover:underline" {...props}>
        {children}
      </a>
    )
  }

  return (
    <a href={href} className="text-teal-800 hover:underline" {...props}>
      {children}
    </a>
  )
}

export default function LegalDocument({ src }) {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadMarkdown() {
      setStatus('loading')
      setError(null)

      try {
        const response = await fetch(src)
        if (!response.ok) {
          throw new Error(`Impossibile caricare il documento (${response.status})`)
        }
        const text = await response.text()
        if (!cancelled) {
          setContent(text)
          setStatus('ready')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Errore di caricamento')
          setStatus('error')
        }
      }
    }

    loadMarkdown()

    return () => {
      cancelled = true
    }
  }, [src])

  if (status === 'loading') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-charcoal-muted">Caricamento documento legale…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 p-6 text-sm text-red-800">
        <p className="font-semibold">Documento non disponibile</p>
        <p className="mt-2">{error}</p>
      </div>
    )
  }

  return (
    <article className="legal-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: MarkdownLink,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
