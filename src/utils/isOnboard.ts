import { verifyToken } from '@utils/token'
import { Request, Response, NextFunction } from 'express'
import sendUnauthorizedResponse from '@utils/unauthorisedResponse'
import UserModel from '@models/user/userModel'

const isOnboard = async (req: Request, res: Response, next: NextFunction) => {
  // check for token
  const token = req.cookies.jwt
  if (!token) {
    return sendUnauthorizedResponse(res)
  }

  try {
    const user = verifyToken(token)
    if (!user) {
      return sendUnauthorizedResponse(res)
    }
    req.body.user = user
    const userData = await UserModel.findById(req.body.user.userId)

    // if not onboarded, redirect to onboard page
    if (!userData?.onboardingComplete) {
      return res.json({
        success: false,
        message: 'Onboarding not complete',
        data: null,
      })
    }
    next()
  } catch (error) {
    return sendUnauthorizedResponse(res)
  }
}

export default isOnboard
