import { Request, Response } from 'express'
import LogModel from '@models/log/logModel'
import { JwtPayload } from 'types'

interface getLogsRequest extends Request {
  body: {
    user: JwtPayload
    logType: string
    questionId?: string
    quizId: string
    location?: {
      longitude: number
      latitude: number
    }
    key?: string
    ip?: string
  }
}

const createLog = async (req: getLogsRequest, res: Response) => {
  const { user, logType, questionId, quizId } = req.body
  try {
    const log = await LogModel.create({
      userId: user.userId,
      logType,
      ...(questionId && { questionId }),
      quizId,
    })
    return res.status(200).json({
      message: 'Log created successfully',
      log,
    })
  } catch (error: unknown) {
    return res.status(500).json({
      message: 'Error in creating log',
      error,
    })
  }
}

export default createLog
