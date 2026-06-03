import { UserCheck, UserMinus, UserX, MapPin, Wallet, Mail } from 'lucide-react'

export const wizardConfig = {
  id: 'care-advisor-intake',
  title: 'Analisi gratuita delle necessità',
  steps: [
    {
      id: 'autonomy',
      type: 'icon-cards',
      question: 'Qual è l\'attuale livello di autonomia?',
      subtitle: 'Ci aiuta a capire il tipo di supporto più adatto.',
      options: [
        {
          value: 'autosufficiente',
          label: 'Autosufficiente',
          description: 'Gestisce le attività quotidiane in autonomia',
          icon: UserCheck,
        },
        {
          value: 'parziale',
          label: 'Parziale',
          description: 'Ha bisogno di aiuto in alcune attività',
          icon: UserMinus,
        },
        {
          value: 'non-autosufficiente',
          label: 'Non autosufficiente',
          description: 'Richiede assistenza continua o dedicata',
          icon: UserX,
        },
      ],
    },
    {
      id: 'location',
      type: 'text-input',
      question: 'In quale zona stai cercando?',
      subtitle: 'Indica città o CAP per trovare le strutture più vicine.',
      placeholder: 'Es. Milano, 20100',
      icon: MapPin,
      inputLabel: 'Città o CAP',
    },
    {
      id: 'budget',
      type: 'pill-toggle',
      question: 'Qual è il budget mensile indicativo?',
      subtitle: 'Un\'indicazione approssimativa ci aiuta a proporti opzioni realistiche.',
      icon: Wallet,
      options: [
        { value: 'under-1500', label: '< 1500€' },
        { value: '1500-2500', label: '1500–2500€' },
        { value: 'over-2500', label: '> 2500€' },
      ],
    },
    {
      id: 'contact',
      type: 'contact-form',
      question: 'A chi inviamo il risultato dell\'analisi?',
      subtitle: 'I tuoi dati sono al sicuro. Nessun impegno, solo consigli personalizzati.',
      icon: Mail,
      fields: [
        { name: 'nome', label: 'Nome', type: 'text', placeholder: 'Il tuo nome', required: true },
        { name: 'telefono', label: 'Telefono', type: 'tel', placeholder: '+39 333 123 4567', required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'nome@email.it', required: true },
      ],
      submitLabel: 'Mostrami le soluzioni',
    },
  ],
}
