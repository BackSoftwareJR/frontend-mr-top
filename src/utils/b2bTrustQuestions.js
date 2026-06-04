/** @param {Array<{ id: string }>} questions */
export function trustQuestionsComplete(questions, answers) {
  if (!questions?.length) return false
  return questions.every((q) => Boolean(answers?.[q.id]))
}
