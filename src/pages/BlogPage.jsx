import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { blogArticles } from '../data/blogArticles'
import BlogCard from '../components/blog/BlogCard'
import StickyCTA from '../components/blog/StickyCTA'

export default function BlogPage() {
  return (
    <div className="px-4 pb-32 pt-28 sm:px-6 lg:pb-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-2xl"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800">
            <BookOpen className="h-4 w-4" />
            Blog & Guide
          </span>
          <h1 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Orientamento con calma
          </h1>
          <p className="text-lg leading-relaxed text-slate-600">
            Articoli pensati per accompagnarvi nelle scelte più importanti,
            con linguaggio chiaro e informazioni affidabili.
          </p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-6 sm:grid-cols-2">
            {blogArticles.map((article, index) => (
              <BlogCard key={article.id} article={article} index={index} />
            ))}
          </div>
          <StickyCTA />
        </div>
      </div>
    </div>
  )
}
