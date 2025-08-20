import { Block } from 'payload'

export const FinishBlock: Block = {
  slug: 'finish',
  labels: {
    singular: 'Finish Block',
    plural: 'Finish Blocks',
  },
  fields: [
    {
      name: 'template',
      label: 'Certificate Template',
      type: 'code',
      required: true,
      admin: {
        description:
          'The template to use for the certificate. This should be a valid HTML template.',
        language: 'html',
      },
    },
  ],
}
