import UserModel from '@models/user/userModel'
import { verifyToken } from '@utils/token'
import { Request, Response } from 'express'
import { IUser, JwtPayload } from 'types'

const getUser = async (req: Request, res: Response) => {
  const token = req.cookies.jwt
  if (token) {
    try {
      const user: JwtPayload = verifyToken(token)
      const userId = user.userId
      const document: IUser | null = await UserModel.findById(userId)
      if (document && document.onboardingComplete === true) {
        res.send({ user, onboarded: true, profileUrl: document?.profileImage })
      } else {
        res.send({ user, onboarded: false, profileUrl: document?.profileImage })
      }
    } catch (e) {
      console.error(e)
    }
  } else {
    res.send({ user: null, onboarded: false })
  }
}

export default getUser
