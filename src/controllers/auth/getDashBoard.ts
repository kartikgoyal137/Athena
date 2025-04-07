import { Request, Response } from 'express'
import sendFailureResponse from '@utils/failureResponse'
import QuizModel from '@models/quiz/quizModel'
import ParticipantModel from '@models/participant/participantModel'
import { JwtPayload } from 'types'
import UserModel from '@models/user/userModel'

interface getDashBoardRequest extends Request {
  body: {
    user: JwtPayload
  }
}

const getDashBoard = async (req: getDashBoardRequest, res: Response) => {
  const user = req.body.user
  try {
    const [createdQuizzes, quizzes, userDocument] = await Promise.all([
      QuizModel.find({ $or: [{ admin: user.userId }, { managers: user.userId }] }),
      QuizModel.find({ isPublished: true }), // Fetch only published quizzes
      UserModel.findById(user.userId),
    ])

    let attemptedQuizzes = 0
    const quizDetails = await Promise.all(
      quizzes.map(async (quiz) => {
        const participant = await ParticipantModel.findOne({
          userId: user.userId,
          quizId: quiz._id,
        })

        if (participant?.submitted) {
          attemptedQuizzes += 1
        }

        return {
          _id: quiz._id,
          name: quiz.quizMetadata?.name,
          description: quiz.quizMetadata?.description,
          instructions: quiz.quizMetadata?.instructions,
          startDateTimestamp: quiz.quizMetadata?.startDateTimestamp,
          endDateTimestamp: quiz.quizMetadata?.endDateTimestamp,
          bannerImage: quiz.quizMetadata?.bannerImage,
          isAcceptingAnswers: quiz.isAcceptingAnswers,
          registrationMetadata: quiz.registrationMetadata,
          isAccessCodePresent: Boolean(quiz.quizMetadata?.accessCode?.length),
          registered: Boolean(participant),
          submitted: participant?.submitted || false,
        }
      }),
    )

    const userDetails = {
      firstName: userDocument?.personalDetails?.name.split(' ')[0] || '',
      lastName: userDocument?.personalDetails?.name.split(' ')[1] || '',
      emailAdd: userDocument?.personalDetails?.emailAdd,
      phoneNo: userDocument?.personalDetails?.phoneNo,
      instituteName: userDocument?.educationalDetails?.instituteName,
    }

    return res.status(200).send({
      message: 'Dashboard details fetched',
      createdQuizzes: createdQuizzes,
      quizzes: quizDetails,
      attemptedQuizzes: attemptedQuizzes,
      hostedQuizzes: createdQuizzes.length,
      userDetails: userDetails,
    })
  } catch (error: unknown) {
    sendFailureResponse({
      res,
      error,
      messageToSend: 'Failed to fetch dashboard data',
    })
  }
}

export default getDashBoard
