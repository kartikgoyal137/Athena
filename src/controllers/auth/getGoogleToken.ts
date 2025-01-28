import { Request, Response } from 'express'
import { google } from 'googleapis'
import axios from 'axios'
import UserModel from '@models/user/userModel'
import { OAuthProviders, UserRoles, IUser, JwtPayload } from 'types'
import { createToken } from '@utils/token'
import { Types } from 'mongoose'
import sendFailureResponse from '@utils/failureResponse'

const getGoogleToken = async (req: Request, res: Response) => {
  try {
    const { code } = req.body
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL,
    )
    const { tokens } = await oauth2Client.getToken(code)
    const googleUser = await axios.get(`${process.env.GOOGLE_USER_URL}${tokens.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokens.id_token}`,
      },
    })
    const user: IUser | null = await UserModel.findOne({
      'personalDetails.emailAdd': googleUser.data.email,
      oauthProvider: OAuthProviders.google,
    })
    let userId: Types.ObjectId | undefined = user?._id
    if (!user) {
      const newUser = new UserModel({
        oauthProvider: OAuthProviders.google,
        emailAdd: googleUser.data.email,
        personalDetails: {
          name: googleUser.data.name,
          emailAdd: googleUser.data.email,
          role: UserRoles.user,
        },
        profileImage: googleUser.data.picture,
        onboardingComplete: false,
      })
      const savedUser = await newUser.save()
      userId = savedUser._id
    }
    if (userId) {
      const payload: JwtPayload = {
        userId: userId,
        emailAdd: googleUser.data.email,
        role: user ? user.role : UserRoles.user,
      }
      const jwtToken = createToken(payload)
      res.cookie('jwt', jwtToken, { httpOnly: true })
      res.status(200).send('success')
    } else {
      res.status(500).send('Internal server error')
    }
  } catch (error: unknown) {
    return sendFailureResponse({
      res,
      error,
      messageToSend: 'Failed to get user details from Google',
    })
  }
}

export default getGoogleToken
