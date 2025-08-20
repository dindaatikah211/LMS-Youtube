import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import { Course, Participation } from '@/payload-types'
import ejs from 'ejs'
import axios, { AxiosError } from 'axios'
import { getUser } from '@/app/(app)/(authenticated)/actions/getUser'
import fs from 'fs'

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const user = await getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { id: participationId } = await params
    const participation = await payload.findByID({
      collection: 'participation',
      id: participationId,
      overrideAccess: false,
      user: user,
    })

    if (!participation) {
      return new Response('Participation not found', { status: 404 })
    }

    const course = participation.course as Course
    const lastModule = course.curriculum?.[course.curriculum.length - 1]

    if (!lastModule || lastModule.blockType !== 'finish') {
      return new Response('Course has no certificate', { status: 400 })
    }
    if (participation.progress !== (course.curriculum?.length ?? 0) - 1) {
      return new Response('Course not finished', { status: 400 })
    }
    if (!('template' in lastModule)) {
      return new Response('Template not found', { status: 400 })
    }

    const html = ejs.render(lastModule.template, {
      name: user?.email,
      courseTitle: course.title,
      date: new Date(participation.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    })

    console.log('Sending HTML to Api2PDF:', html.substring(0, 200) + '...')
    if (!html || html.trim().length === 0) {
      console.error('Empty HTML generated')
      return new Response('Empty HTML content', { status: 400 })
    }

    if (html.includes('undefined') || html.includes('null')) {
      console.warn('HTML contains undefined values:', html)
    }

    const apiKey = process.env.API2PDF_KEY
    if (!apiKey) {
      throw new Error('API2PDF_KEY is missing from environment variables')
    }

    fs.writeFileSync('debug-certificate.html', html)

    const api2pdfResp = await axios.post(
      'https://v2018.api2pdf.com/chrome/html',
      {
        html: html,
        fileName: `${course.title}.pdf`,
        options: {
          landscape: false,
          format: 'A4',
          margin: 0,
          printBackground: true,
        },
        preferCSSPageSize: true,
      },
      {
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
      },
    )

    if (!api2pdfResp.data?.pdf) {
      console.error('Api2PDF response:', api2pdfResp.data)
      return new Response('Failed to get PDF URL from Api2PDF', { status: 500 })
    }

    const pdfResponse = await axios({
      method: 'GET',
      url: api2pdfResp.data.pdf,
      responseType: 'arraybuffer',
      timeout: 30000,
    })

    const pdfBuffer = Buffer.from(pdfResponse.data)

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Empty PDF buffer received')
    }

    if (pdfBuffer.toString('utf8', 0, 4) !== '%PDF') {
      fs.writeFileSync('invalid-pdf-debug.bin', pdfBuffer)
      throw new Error('Invalid PDF format received')
    }

    fs.writeFileSync('debug-certificate.pdf', pdfBuffer)

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(course.title)}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (err) {
    console.error('PDF Generation Error:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      response: err instanceof AxiosError ? err.response?.data : undefined,
    })

    return new Response(
      JSON.stringify({
        error: 'Failed to generate PDF',
        details:
          process.env.NODE_ENV === 'development'
            ? err instanceof Error
              ? err.message
              : 'Unknown error'
            : 'Please try again later',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
