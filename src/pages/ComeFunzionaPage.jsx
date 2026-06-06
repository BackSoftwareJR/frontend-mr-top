import LegalLayout from '../components/legal/LegalLayout'
import { COME_FUNZIONA_PAGE } from '../constants/siteCopy'

export default function ComeFunzionaPage() {
  const { title, intro, sections } = COME_FUNZIONA_PAGE

  return (
    <LegalLayout>
      <article className="prose prose-slate max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-slate-600">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>

        {intro.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}

        {sections.map((section) => (
          <section key={section.title} className="mt-10">
            <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
    </LegalLayout>
  )
}
