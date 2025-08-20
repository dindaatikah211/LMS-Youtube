import nodemailer from 'nodemailer'
import { EmailAdapter, SendEmailOptions } from 'payload'

const nodemailerAdapter = (): EmailAdapter => {
  const adapter = () => ({
    name: 'nodemailer',
    defaultFromName: process.env.MAIL_FROM_NAME as string,
    defaultFromAddress: process.env.MAIL_FROM_EMAIL as string,

    sendEmail: async (message: SendEmailOptions): Promise<unknown> => {
      let transporter

      if (process.env.NODE_ENV === 'production') {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
          },
        })
      } else {
        transporter = nodemailer.createTransport({
          host: process.env.MAILTRAP_HOST,
          port: parseInt(process.env.MAILTRAP_PORT || '2525', 10),
          auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS,
          },
        })
      }

      const info = await transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
        to: message.to,
        subject: message.subject,
        html: message.html,
      })

      console.log('Email sent:', info.messageId)
      return info
    },
  })

  return adapter
}

export default nodemailerAdapter
