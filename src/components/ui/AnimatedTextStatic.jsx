export default function AnimatedTextStatic({
  text,
  className = '',
  as: Tag = 'span',
}) {
  const words = text.split(' ')

  return (
    <Tag className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block mr-[0.25em]">
          {word}
        </span>
      ))}
    </Tag>
  )
}
