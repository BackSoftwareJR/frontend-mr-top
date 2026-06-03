import LegalDocument from '../../components/legal/LegalDocument'
import LegalLayout from '../../components/legal/LegalLayout'
import { legalMarkdownFiles } from '../../constants/legalDocuments'

export default function TermsPage() {
  return (
    <LegalLayout>
      <LegalDocument src={legalMarkdownFiles.terms} />
    </LegalLayout>
  )
}
