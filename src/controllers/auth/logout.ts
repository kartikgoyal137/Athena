import { Request, Response } from 'express'
import sendFailureResponse from '@utils/failureResponse'

const logout = async (req: Request, res: Response) => {
  try {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) })
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error: unknown) {
    return sendFailureResponse({
      res,
      error,
      messageToSend: 'Failed to log out',
    })
  }
}

export default logout
