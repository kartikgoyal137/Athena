import axios from 'axios'
import { Request, Response } from 'express'
import UserModel from '@models/user/userModel'
import { OAuthProviders, UserRoles, IUser, JwtPayload } from 'types'
import { createToken } from '@utils/token'
import { Types } from 'mongoose'
import sendFailureResponse from '@utils/failureResponse'
import { GITHUB_TOKEN_URL } from 'config'

const getGithubToken = async (req: Request, res: Response) => {
  try {
    const { code } = req.body

    const response = await axios.post(`${GITHUB_TOKEN_URL}${code}`, {
      headers: {
        accept: 'application/json',
      },
    })
    const accessToken = response.data.split('&')[0].split('=')[1]

    const githubUser = await axios.get(process.env.GITHUB_USER_URL!, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!githubUser.data.email) {
      const emails = await axios.get(process.env.GITHUB_EMAIL_URL!, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      githubUser.data.email = emails.data[0].email
    }
    const user: IUser | null = await UserModel.findOne({
      'personalDetails.emailAdd': githubUser.data.email,
      oauthProvider: OAuthProviders.github,
    })
    let userId: Types.ObjectId | undefined
    if (user) {
      userId = user._id
    } else {
      const newUser = new UserModel({
        oauthProvider: OAuthProviders.github,
        emailAdd: githubUser.data.email,
        personalDetails: {
          name: githubUser.data.name || githubUser.data.login,
          emailAdd: githubUser.data.email,
          role: UserRoles.user,
        },
        profileImage: githubUser.data.avatar_url,
      })
      const savedUser = await newUser.save()
      userId = savedUser._id
    }

    if (userId) {
      const payload: JwtPayload = {
        userId: userId,
        emailAdd: githubUser.data.email,
        role: user ? user.role : UserRoles.user,
      }

      const jwtToken = createToken(payload)
      res.cookie('jwt', jwtToken, { httpOnly: true })
      res.status(200).send('sucess')
    } else {
      res.status(500).send('Internal server error')
    }
  } catch (error: unknown) {
    return sendFailureResponse({
      res,
      error,
      messageToSend: 'Failed to get user details from GitHub',
    })
  }
}

export default getGithubToken
