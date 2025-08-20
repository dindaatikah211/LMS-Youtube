import { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'video',
  labels: {
    singular: 'Video',
    plural: 'Videos',
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'duration',
      label: 'Duration (in minutes)',
      type: 'text',
      required: true,
    },
    {
      name: 'playerUrl',
      label: 'Video URL From Gdrive',
      type: 'text',
      required: true,
    },
  ],
}
