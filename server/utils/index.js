const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
// const { EMAIL, loginSecretKey } = require('../../secrets')
const EMAIL = { user: 'email here', pass: 'app password here' }
const loginSecretKey = 'test'

const sendTokenizedEmail = async (to, token) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: EMAIL.user,
      pass: EMAIL.pass
    }
  })

  // send mail with defined transport object
  const info = await transporter.sendMail({
    to,
    subject: 'Sign In to Streams',
    text: 'Please click this link to continue signing in to Streams',
    html: `
      <div>
        <a href=${`http://localhost:3000/auth/magic-link?token=${token}`}>
          Sign in
        </a>
      </div>`
  })

  return info.messageId
}

const jwtOptions = {
  issuer: 'streams.re',
  audience: 'streams.re',
  algorithm: 'HS256'
}

const generateLoginCode = user =>
  new Promise((resolve, reject) => {
    return jwt.sign(
      { sub: user._id },
      loginSecretKey,
      jwtOptions,
      (err, token) => {
        if (err) reject(err)
        else resolve(token)
      }
    )
  })

const verifyJWT = token =>
  new Promise((resolve, reject) => {
    return jwt.verify(token, loginSecretKey, {}, (err, decodedToken) => {
      if (err) reject(err)
      else resolve(decodedToken)
    })
  })

module.exports = { sendTokenizedEmail, generateLoginCode, verifyJWT }
