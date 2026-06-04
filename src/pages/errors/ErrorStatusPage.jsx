import { useParams } from 'react-router-dom'
import ErrorPageContent from '../../components/errors/ErrorPageContent'

export default function ErrorStatusPage() {
  const { code } = useParams()
  return <ErrorPageContent code={code} />
}
