import { motion } from 'framer-motion'
import { Clock, ArrowRight } from 'lucide-react'

export default function BlogCard({ article, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/50 transition-shadow hover:shadow-xl hover:shadow-slate-200/60"
    >
      <span className="mb-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
        {article.category}
      </span>
      <h3 className="mb-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-teal-800">
        {article.title}
      </h3>
      <p className="mb-5 leading-relaxed text-slate-600">{article.excerpt}</p>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {article.readTime}
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-teal-800 opacity-0 transition-opacity group-hover:opacity-100">
          Leggi
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </motion.article>
  )
}
