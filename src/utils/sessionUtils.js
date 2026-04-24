import crypto from 'crypto'

export const generateSessionToken = () => {
    return crypto.randomBytes(32).toString('hex')
}

export const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    // domain: 'Enter your domain here',
    maxAge: 7 * 24 * 60 * 60 * 1000,
}
