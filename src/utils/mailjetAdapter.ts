import axios from 'axios'
import { EmailAdapter, SendEmailOptions } from 'payload'

const mailjetAdapter = (): EmailAdapter => {
  const adapter = () => ({
    name: 'mailjet',
    defaultFromName: process.env.MAILJET_SENDER_NAME as string,
    defaultFromAddress: process.env.MAILJET_SENDER_EMAIL as string,

    sendEmail: async (message: SendEmailOptions): Promise<unknown> => {
      if (process.env.MAILJET_EMAIL_ACTIVE !== 'true') {
        console.log('[FAKE EMAIL]', message)
        return
      }

      console.log('Sending via Mailjet:', message)

      try {
        const res = await axios({
          method: 'post',
          url: 'https://api.mailjet.com/v3.1/send',
          auth: {
            username: process.env.MAILJET_API_KEY as string,
            password: process.env.MAILJET_SECRET_KEY as string,
          },
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            Messages: [
              {
                From: {
                  Email: process.env.MAILJET_SENDER_EMAIL,
                  Name: process.env.MAILJET_SENDER_NAME,
                },
                To: [
                  {
                    Email: message.to,
                  },
                ],
                Subject: message.subject,
                HTMLPart: message.html,
              },
            ],
          },
        })

        return res.data
      } catch (error) {
        console.error('Error sending email via Mailjet:', error)
      }
    },
  })

  return adapter
}

export default mailjetAdapter
