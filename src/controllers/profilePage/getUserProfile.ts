import { Request, Response } from 'express'
import sendFailureResponse from '@utils/failureResponse'
import QuizModel from '@models/quiz/quizModel'
import { JwtPayload, ResponseStatus } from 'types'
import UserModel from '@models/user/userModel'
import { Types } from 'mongoose'
import ResponseModel from '@models/response/responseModel'

interface getDashBoardRequest extends Request {
  body: {
    user: JwtPayload
  }
}

interface Participant {
  userId: Types.ObjectId
  marks: number
  questionsAttempted: number
  questionsChecked: number
}

const getUserProfile = async (req: getDashBoardRequest, res: Response) => {
  const user = req.body.user

  try {
    const createdQuizzes = await QuizModel.find({
      $or: [{ admin: user.userId }, { managers: user.userId }],
    })
    const quizzes = await QuizModel.find({})
    let attemptedQuizzes = 0
    const quizDetails = quizzes
      .filter((quiz) => quiz.isPublished)
      .map(async (quiz) => {
        if (quiz?.isPublished) {
          const userStatus = quiz?.participants?.find(
            (participant) => participant.userId && participant.userId.equals(user.userId),
          )
          if (userStatus?.submitted) {
            attemptedQuizzes += 1
            const creatorDocument = await UserModel.findById(quiz.admin)

            const participants: Participant[] = []
            await Promise.all(
              quiz?.participants?.map(async (participant) => {
                const responses = await ResponseModel.find({
                  quizId: quiz._id,
                  userId: participant.userId,
                })

                let score = 0
                let questionsAttempted = 0
                let questionsChecked = 0

                responses.forEach((response) => {
                  score += response.marksAwarded || 0
                  questionsAttempted++
                  questionsChecked += response.status === ResponseStatus.checked ? 1 : 0
                })

                if (Types.ObjectId.isValid(participant.userId)) {
                  const leaderboardEntry: Participant = {
                    userId: participant.userId,
                    marks: score,
                    questionsAttempted: questionsAttempted,
                    questionsChecked: questionsChecked,
                  }
                  participants.push(leaderboardEntry)
                }
              }) as Promise<void>[],
            )
            const sortedParticipants = participants.sort((a, b) => {
              if (a.marks > b.marks) {
                return -1
              } else return 1
            })
            let rank = 0
            for(let i=0; i<sortedParticipants.length; i++) {
              if (sortedParticipants[i].userId == user.userId) {
                rank=i+1
                break
              }
            }

            return {
              _id: quiz._id,
              creator: creatorDocument?.personalDetails?.name,
              name: quiz?.quizMetadata?.name,
              description: quiz?.quizMetadata?.description,
              instructions: quiz?.quizMetadata?.instructions,
              startDateTimestamp: quiz?.quizMetadata?.startDateTimestamp,
              bannerImage: quiz?.quizMetadata?.bannerImage,
              resultsPublished: quiz.resultsPublished,
              totalParticipants: quiz.participants?.length,
              rank: rank,
            }
          }
        }
      })
    const userDocument = await UserModel.findById(user.userId)
    const userDetails = {
      firstName: userDocument?.personalDetails?.name.split(' ')[0] || '',
      lastName: userDocument?.personalDetails?.name.split(' ')[1] || '',
      emailAdd: userDocument?.personalDetails?.emailAdd,
      phoneNo: userDocument?.personalDetails?.phoneNo,
      instituteName: userDocument?.educationalDetails?.instituteName,
      city: userDocument?.educationalDetails?.city,
      country: userDocument?.educationalDetails?.country,
      profileImage: userDocument?.profileImage,
      socialHandles: userDocument?.socialHandles,
    }

    const resolvedQuizzes = await Promise.all(quizDetails)
    const Quizzes = {
      createdQuizzes: createdQuizzes,
      quizzes: resolvedQuizzes,
      attemptedQuizzes: attemptedQuizzes,
      hostedQuizzes: createdQuizzes.length,
    }
    return res.status(200).send({
      message: 'User Profile details fetched',
      quizzes: Quizzes,
      userDetails: userDetails,
    })
  } catch (error: unknown) {
    sendFailureResponse({
      res,
      error,
      messageToSend: 'Failed to fetch user profile data',
    })
  }
}

export default getUserProfile
