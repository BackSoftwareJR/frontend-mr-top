import LegalLayout from '../components/legal/LegalLayout'
import { CHI_SIAMO_PAGE } from '../constants/siteCopy'

export default function ChiSiamoPage() {
  const { title, paragraphs } = CHI_SIAMO_PAGE

  return (
    <LegalLayout>
      <article className="prose prose-slate max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-slate-600">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>

        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </article>
    </LegalLayout>
  )
}
