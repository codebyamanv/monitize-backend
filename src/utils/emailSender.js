import dotenv from 'dotenv'
dotenv.config()
// import { Resend } from 'resend'

// const resend = new Resend(process.env.RESEND_API_KEY)

// export const EmailSender = async ({ to, subject, html }) => {
//     const resendResponse = await resend.emails.send({
//         from: 'amanverma0428@gmail.com',
//         to,
//         subject,
//         html,
//     })
//     return resendResponse
// }
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Monitize'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text,
        }

        const info = await transporter.sendMail(mailOptions)
        return info
    } catch (error) {
        throw new Error('Failed to send email')
    }
}

// await sendEmail({
//     to: req.body.email,
//     subject: 'Verify Your Email Address',
//     text: `Your OTP for email verification is ${otp}. This OTP is valid for 10 minutes.`,
//     html: `
//                 <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
//                     <h2 style="color: #111827;">Hello ${user.firstName},</h2>

//                     <p style="color: #374151; font-size: 15px;">
//                         Welcome to <strong>Freecosystem</strong> 👋
//                     </p>

//                     <p style="color: #374151; font-size: 15px;">
//                         Please use the OTP below to verify your email address:
//                     </p>

//                     <div style="margin: 24px 0; text-align: center;">
//                         <span style="font-size: 28px; letter-spacing: 4px; font-weight: bold; color: #111827;">
//                             ${otp}
//                         </span>
//                     </div>

//                     <p style="color: #6b7280; font-size: 14px;">
//                         This OTP is valid for <strong>10 minutes</strong>.
//                         Do not share it with anyone for security reasons.
//                     </p>

//                     <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />

//                     <p style="color: #6b7280; font-size: 13px;">
//                         If you did not request this, you can safely ignore this email.
//                     </p>

//                     <p style="color: #374151; font-size: 14px; margin-top: 16px;">
//                         Best regards,<br />
//                         <strong>Freecosystem Team</strong>
//                     </p>
//                 </div>
//             `,
// })
