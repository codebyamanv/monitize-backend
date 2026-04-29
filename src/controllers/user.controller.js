import fs from 'node:fs'
import path from 'node:path'
import { User, Session } from '../helpers/modelHelper.js'
import { ApiResponse, asyncHandler, ErrorResponse } from '../helpers/handlersHelper.js'
import { cookieOptions, generateSessionToken } from '../utils/sessionUtils.js'
import { loginValidator, registerValidator } from '../validators/authValidator.js'
import { sendEmail } from '../utils/emailSender.js'

import crypto from 'crypto'

export const register = asyncHandler(async (req, res) => {
    const { success, data, error } = registerValidator.safeParse(req.body)
    const token = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const verifyURL = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

    if (!success) {
        const zodError = JSON.parse(error)
            .map((err) => err.message)
            .join(', ')
        throw new ErrorResponse(zodError, 400, 'ValidationError')
    }

    const { fullname, email, password, interests, userType } = data
    const user = await User.findOne({ email })
    if (user) {
        throw new ErrorResponse('Email Already registered', 400, 'UserAlreadyExistsError')
    }
    await User.create({
        fullname,
        email,
        password,
        interests,
        userType,
        emailVerificationToken: hashedToken,
        emailVerificationExpires: Date.now() + 1000 * 60 * 60, // 1 hour
    })

    const emailResponse = await sendEmail({
        to: email,
        subject: 'Verify your email – Monitize',
        html: `
  <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    
    <!-- Wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <!-- Card -->
          <table width="100%" max-width="520" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:12px;padding:32px 24px;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

            <!-- Logo / Brand -->
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <h1 style="margin:0;font-size:20px;color:#111827;font-weight:700;">
                  Monitize
                </h1>
              </td>
            </tr>

            <!-- Heading -->
            <tr>
              <td>
                <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">
                  Verify your email
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td>
                <p style="margin:0 0 12px;font-size:15px;color:#374151;">
                  Hi ${fullname},
                </p>

                <p style="margin:0 0 16px;font-size:15px;color:#374151;">
                  Thanks for signing up for <strong>Monitize</strong>. Please confirm your email address by clicking the button below.
                </p>
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="center" style="padding:24px 0;">
                <a href="${verifyURL}"
                  style="
                    display:inline-block;
                    background-color:#1fa67a;
                    color:#ffffff;
                    text-decoration:none;
                    font-size:14px;
                    font-weight:600;
                    padding:12px 24px;
                    border-radius:8px;
                  ">
                  Verify Email
                </a>
              </td>
            </tr>

            <!-- Expiry -->
            <tr>
              <td>
                <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">
                  This link will expire in <strong>1 hour</strong>.
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
              </td>
            </tr>

            <!-- Fallback -->
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
                  If the button doesn’t work, copy and paste this link into your browser:
                </p>

                <p style="word-break:break-all;font-size:12px;color:#1fa67a;">
                  ${verifyURL}
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding-top:20px;">
                <p style="margin:0;font-size:13px;color:#6b7280;">
                  If you didn’t create an account, you can safely ignore this email.
                </p>

                <p style="margin-top:16px;font-size:13px;color:#111827;">
                  — Monitize Team
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
  `,
    })

    if (!emailResponse) {
        throw new ErrorResponse('Something went wrong while sending email', 500, 'EmailNotSentError')
    }

    return ApiResponse.created({}, 'User registered successfully').send(res)
})

export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ emailVerificationToken: hashedToken })
    if (!user) {
        throw new ErrorResponse('Invalid token', 400, 'InvalidTokenError')
    }
    if (Date.now() > user.emailVerificationExpires) {
        throw new ErrorResponse('Token expired', 400, 'TokenExpiredError')
    }
    await User.findOneAndUpdate(
        { emailVerificationToken: hashedToken },
        { isEmailVerified: true, emailVerificationToken: null, emailVerificationExpires: null },
        { new: true },
    )
    return ApiResponse.created({}, 'Email verified successfully').send(res)
})

export const login = asyncHandler(async (req, res) => {
    const { success, data, error } = loginValidator.safeParse(req.body)
    if (!success) {
        const zodError = JSON.parse(error)
            .map((err) => err.message)
            .join(', ')
        throw new ErrorResponse(zodError, 400, 'ValidationError')
    }

    const user = await User.findOne({ email: data.email })
    if (!user) {
        throw new ErrorResponse('Invalid credentials', 401)
    }
    if (!user.isEmailVerified) {
        throw new ErrorResponse('Email not verified.', 403)
    }
    const isPasswordCorrect = await user.isPasswordCorrect(data.password)
    if (!isPasswordCorrect) {
        throw new ErrorResponse('Invalid credentials', 403)
    }
    const sessionToken = generateSessionToken()

    // delete all sessions except the current one
    await Session.deleteMany({ userId: user._id })
    await Session.create({
        userId: user._id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    res.cookie('sessionToken', sessionToken, cookieOptions)

    return ApiResponse.success({ sessionToken }, 'Login successful').send(res)
})

export const currentUser = asyncHandler(async (req, res) => {
    return ApiResponse.success(req.user).send(res)
})

export const logout = asyncHandler(async (req, res) => {
    const sessionToken = req.cookies.sessionToken
    await Session.deleteOne({ token: sessionToken })
    res.clearCookie('sessionToken', cookieOptions)
    return ApiResponse.success({}, 'Logout successful').send(res)
})

export const logoutFromAllSessions = asyncHandler(async (req, res) => {
    const { _id } = req.user
    await Session.deleteMany({ userId: _id })
    res.clearCookie('sessionToken', cookieOptions)
    return ApiResponse.success({}, 'Logout successsfully from all devices').send(res)
})

export const changeAvatar = asyncHandler(async (req, res) => {
    const file = req.file
    const avatar = file.path.replace(/\\/g, '/')

    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ErrorResponse('User not found', 404, 'UserNotFoundError')
    }

    if (user.avatar) {
        const isDefaultAvatar = user.avatar === 'uploads/avatar/default/avatar.png'

        if (!isDefaultAvatar) {
            const imagePath = path.join(process.cwd(), user.avatar)

            try {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath)
                }
            } catch (err) {
                console.error('Error deleting avatar:', err.message)
            }
        }
    }

    await User.findByIdAndUpdate(req.user._id, { avatar })

    return ApiResponse.success({}, 'Avatar changed successfully').send(res)
})

export const emailVerificationAfterRegister = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        throw new ErrorResponse('Email not registered', 404, 'UserNotFoundError')
    }
    if (user.isEmailVerified) {
        throw new ErrorResponse('Email already verified', 400, 'EmailAlreadyVerifiedError')
    }

    const token = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const verifyURL = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpires = Date.now() + 1000 * 60 * 60 // 1 hour
    user.save()

    const emailResponse = await sendEmail({
        to: email,
        subject: 'Verify your email – Monitize',
        html: `
  <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    
    <!-- Wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <!-- Card -->
          <table width="100%" max-width="520" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:12px;padding:32px 24px;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

            <!-- Logo / Brand -->
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <h1 style="margin:0;font-size:20px;color:#111827;font-weight:700;">
                  Monitize
                </h1>
              </td>
            </tr>

            <!-- Heading -->
            <tr>
              <td>
                <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">
                  Verify your email
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td>
                <p style="margin:0 0 12px;font-size:15px;color:#374151;">
                  Hi ${fullname},
                </p>

                <p style="margin:0 0 16px;font-size:15px;color:#374151;">
                  Thanks for signing up for <strong>Monitize</strong>. Please confirm your email address by clicking the button below.
                </p>
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="center" style="padding:24px 0;">
                <a href="${verifyURL}"
                  style="
                    display:inline-block;
                    background-color:#1fa67a;
                    color:#ffffff;
                    text-decoration:none;
                    font-size:14px;
                    font-weight:600;
                    padding:12px 24px;
                    border-radius:8px;
                  ">
                  Verify Email
                </a>
              </td>
            </tr>

            <!-- Expiry -->
            <tr>
              <td>
                <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">
                  This link will expire in <strong>1 hour</strong>.
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
              </td>
            </tr>

            <!-- Fallback -->
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
                  If the button doesn’t work, copy and paste this link into your browser:
                </p>

                <p style="word-break:break-all;font-size:12px;color:#1fa67a;">
                  ${verifyURL}
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding-top:20px;">
                <p style="margin:0;font-size:13px;color:#6b7280;">
                  If you didn’t create an account, you can safely ignore this email.
                </p>

                <p style="margin-top:16px;font-size:13px;color:#111827;">
                  — Monitize Team
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
  `,
    })

    if (!emailResponse) {
        throw new ErrorResponse('Something went wrong while sending email', 500, 'EmailNotSentError')
    }
})

export const sendResetPasswordEmail = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        throw new ErrorResponse('Email not registered', 404, 'UserNotFoundError')
    }
    if (!user.isEmailVerified) {
        throw new ErrorResponse('Email is not verified', 400, 'EmailAlreadyVerifiedError')
    }

    const token = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const verifyURL = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpires = Date.now() + 1000 * 60 * 60 // 1 hour
    user.save()

    const emailResponse = await sendEmail({
        to: email,
        subject: 'Verify your email – Monitize',
        html: `
  <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    
    <!-- Wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <!-- Card -->
          <table width="100%" max-width="520" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:12px;padding:32px 24px;box-shadow:0 4px 20px rgba(0,0,0,0.05);">

            <!-- Logo / Brand -->
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <h1 style="margin:0;font-size:20px;color:#111827;font-weight:700;">
                  Monitize
                </h1>
              </td>
            </tr>

            <!-- Heading -->
            <tr>
              <td>
                <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">
                  Verify your email
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td>
                <p style="margin:0 0 12px;font-size:15px;color:#374151;">
                  Hi ${fullname},
                </p>

                <p style="margin:0 0 16px;font-size:15px;color:#374151;">
                  Thanks for signing up for <strong>Monitize</strong>. Please confirm your email address by clicking the button below.
                </p>
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="center" style="padding:24px 0;">
                <a href="${verifyURL}"
                  style="
                    display:inline-block;
                    background-color:#1fa67a;
                    color:#ffffff;
                    text-decoration:none;
                    font-size:14px;
                    font-weight:600;
                    padding:12px 24px;
                    border-radius:8px;
                  ">
                  Verify Email
                </a>
              </td>
            </tr>

            <!-- Expiry -->
            <tr>
              <td>
                <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">
                  This link will expire in <strong>1 hour</strong>.
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
              </td>
            </tr>

            <!-- Fallback -->
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
                  If the button doesn’t work, copy and paste this link into your browser:
                </p>

                <p style="word-break:break-all;font-size:12px;color:#1fa67a;">
                  ${verifyURL}
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding-top:20px;">
                <p style="margin:0;font-size:13px;color:#6b7280;">
                  If you didn’t create an account, you can safely ignore this email.
                </p>

                <p style="margin-top:16px;font-size:13px;color:#111827;">
                  — Monitize Team
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
  `,
    })

    if (!emailResponse) {
        throw new ErrorResponse('Something went wrong while sending email', 500, 'EmailNotSentError')
    }
})
export const forgotPassword = asyncHandler(async (req, res) => {})
export const changePassword = asyncHandler(async (req, res) => {})
