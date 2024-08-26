import userModel from '@models/user/userModel'
import sendFailureResponse from '@utils/failureResponse'
import sendInvalidInputResponse from '@utils/invalidInputResponse'
import { Request, Response } from 'express'
import { IUser, JwtPayload } from 'types'

interface onboardRequest extends Request {
  body: {
    personalDetails: IUser['personalDetails']
    educationalDetails: IUser['educationalDetails']
    socialHandles: IUser['socialHandles']
    user: JwtPayload
  }
}

// Check if all required details are present
const requiredDetailsPresent = (body: onboardRequest['body']) => {
  const { personalDetails, educationalDetails } = body
  if (!personalDetails?.name || !personalDetails?.emailAdd || !educationalDetails?.instituteName) {
    return false
  }
  return true
}

// Onboard user
const updateUser = async (req: onboardRequest, res: Response) => {
  const { personalDetails, educationalDetails, socialHandles, user } = req.body
  if (!requiredDetailsPresent(req.body)) {
    return sendInvalidInputResponse(res)
  }

  try {
    // Update user details
    await userModel.findByIdAndUpdate(
      user.userId,
      {
        personalDetails: personalDetails,
        educationalDetails: educationalDetails,
        socialHandles: socialHandles,
        onboardingComplete: true,
      },
    )

    res.status(200).send('success')
  } catch (error: unknown) {
    sendFailureResponse({
      res,
      error,
      messageToSend: 'Error updating user',
      errorCode: 500,
    })
  }
}

export default updateUser
