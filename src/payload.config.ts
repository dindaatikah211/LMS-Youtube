import dotenv from 'dotenv'
dotenv.config()

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import type { GeneratedTypes } from 'payload'

import Users from './collections/Users/Users'
import { Media } from './collections/Media/Media'
import { Customers } from './collections/Customers/Customers'
import { Courses } from './collections/courses/Courses'
import { Participation } from './collections/courses/Participation'
import { Tenants } from './collections/Tenants/Tenants'
import { isSuperAdmin } from './access/isSuperAdmin'

import { s3Storage } from '@payloadcms/storage-s3'
import sendGridAdapter from './utils/sendgridAdapter'
import { getUserTenantIDs } from './utils/getUserTenantIDs'
import { isUser } from './utils/isUser'
import { seed } from './seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  email: sendGridAdapter(),
  collections: [Users, Media, Customers, Courses, Participation, Tenants],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  onInit: async (args) => {
    if (process.env.SEED_DB) {
      await seed(args)
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('payload-tenant')
    }
  },
  sharp,
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        region: 'us-east-1',
        endpoint: process.env.S3_ENDPOINT || '',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY || '',
          secretAccessKey: process.env.S3_SECRET_KEY || '',
        },
      },
    }),
    multiTenantPlugin<GeneratedTypes>({
      collections: {
        media: {},
        courses: {},
        participation: {},
      },
      tenantField: {
        access: {
          read: () => true,
          update: ({ req }) => {
            if (isSuperAdmin(req.user)) {
              return true
            }
            if (!isUser(req.user)) {
              return false
            }
            return getUserTenantIDs(req.user).length > 0
          },
        },
      },
      tenantsArrayField: {
        includeDefaultField: false,
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    }),
  ],
})
