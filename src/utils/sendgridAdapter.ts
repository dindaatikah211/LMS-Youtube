import axios from 'axios'
import { EmailAdapter, SendEmailOptions } from 'payload'

const sendGridAdapter = (): EmailAdapter => {
  const adapter = () => ({
    name: 'sendgrid',
    defaultFromName: process.env.SENDGRID_SENDER_NAME as string,
    defaultFromAddress: process.env.SENDGRID_SENDER_EMAIL as string,

    sendEmail: async (message: SendEmailOptions): Promise<unknown> => {
      if (process.env.SENDGRID_EMAIL_ACTIVE !== 'true') {
        console.log('[FAKE EMAIL]', message)
        return
      }

      console.log('Sending via SendGrid:', message)

      try {
        const res = await axios({
          method: 'post',
          url: 'https://api.sendgrid.com/v3/mail/send',
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          data: {
            personalizations: [
              {
                to: [
                  {
                    email: message.to,
                  },
                ],
                subject: message.subject,
              },
            ],
            from: {
              email: process.env.SENDGRID_SENDER_EMAIL,
              name: process.env.SENDGRID_SENDER_NAME,
            },
            content: [
              {
                type: 'text/html',
                value: message.html,
              },
            ],
          },
        })

        return res.data
      } catch (error: any) {
        console.error('Error sending email via SendGrid:', error.response?.data || error.message)
        throw error
      }
    },
  })

  return adapter
}

export default sendGridAdapter
