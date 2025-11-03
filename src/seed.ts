import type { Payload } from 'payload'

export const seed = async (payload: Payload) => {
  // cek apakah superadmin sudah ada
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: 'rmind137@gmail.com' } },
  })

  if (existing.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'rmind137@gmail.com',
        password: 'adminadmin',
        roles: ['superadmin'],
      },
    })
    console.log('Super admin created')
  } else {
    console.log('Super admin already exists')
  }
}
