import { sign, verify } from 'jsonwebtoken'
import { JwtPayload } from 'types'

export const createToken = (payload: JwtPayload): string => {
  return sign(payload, process.env.JWT_KEY || 'Athena2023', {
    expiresIn: process.env.JWT_EXPIRY || '1d',
  })
}

export const verifyToken = (token: string): JwtPayload => {
  const user = verify(token, process.env.JWT_KEY || 'Athena2023')

  if (typeof user === 'string') throw Error('Invalid Token Format')
  return user as JwtPayload
}
