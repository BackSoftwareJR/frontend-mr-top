import LegalDocument from '../../components/legal/LegalDocument'
import LegalLayout from '../../components/legal/LegalLayout'
import { legalMarkdownFiles } from '../../constants/legalDocuments'

export default function TermsPartnersPage() {
  return (
    <LegalLayout>
      <LegalDocument src={legalMarkdownFiles.termsPartners} />
    </LegalLayout>
  )
}
