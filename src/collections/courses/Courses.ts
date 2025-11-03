import type { CollectionConfig } from 'payload'
import { VideoBlock } from './blocks/VideoBlock'
import { QuizBlock } from './blocks/QuizBlock'
import { FinishBlock } from './blocks/FinishBlock'
import { isSuperAdminAccess } from '@/access/isSuperAdmin'
import { updateAndDeleteAccess } from './access/updateAndDelete'

export const Courses: CollectionConfig = {
  slug: 'courses',
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: updateAndDeleteAccess,
    read: () => true, // semua bisa baca course
    update: updateAndDeleteAccess,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Tenant Collections',
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'tenants',
      type: 'relationship',
      relationTo: 'tenants',
      hasMany: true,
      required: true,
      admin: {
        description: 'Tenant(s) that own this course',
        position: 'sidebar',
      },
      defaultValue: undefined,
    },
    {
      name: 'image',
      label: 'Image',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'curriculum',
      label: 'Curriculum',
      type: 'blocks',
      blocks: [VideoBlock, QuizBlock, FinishBlock],
    },
  ],
}
