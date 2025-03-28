import { Request, Response } from 'express'
import sendFailureResponse from '@utils/failureResponse'
import QuizModel from '@models/quiz/quizModel'
import { JwtPayload } from 'types'
import UserModel from '@models/user/userModel'
import ParticipantModel from '@models/participant/participantModel'
import LeaderboardModel from '@models/leaderboard/leaderboardModel'

interface getDashBoardRequest extends Request {
  body: {
    user: JwtPayload
  }
}

const getUserProfile = async (req: getDashBoardRequest, res: Response) => {
  const user = req.body.user

  try {
    const createdQuizzes = await QuizModel.find({
      $or: [{ admin: user.userId }, { managers: user.userId }],
    })

    const attemptedQuizzes = await ParticipantModel.find({ userId: user.userId, submitted: true }).populate({
      path: 'quizId',
      select: 'admin quizMetadata resultsPublished bannerImage',
      populate: {
        path: 'admin',
        select: 'personalDetails.name'
      }
    });

    const quizDetails = attemptedQuizzes.map(async (participation) => {
      const leaderboard = await LeaderboardModel.findOne({ quizId: participation.quizId._id, sectionIndex: null })
      const rankIndex = leaderboard?.participants.findIndex((p) => p.userId.equals(user.userId)) ?? -1;
      const rank = (rankIndex + 1) || null;
      const totalParticipants = await ParticipantModel.countDocuments({ quizId: participation.quizId._id });
      return {
        _id: participation.quizId._id,
        creator: participation.quizId.admin.personalDetails?.name,
        name: participation.quizId.quizMetadata?.name,
        description: participation.quizId.quizMetadata?.description,
        instructions: participation.quizId.quizMetadata?.instructions,
        startDateTimestamp: participation.quizId.quizMetadata?.startDateTimestamp,
        bannerImage: participation.quizId.quizMetadata?.bannerImage,
        resultsPublished: participation.quizId.resultsPublished,
        totalParticipants: totalParticipants,
        rank: rank
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
    const quizzes = {
      createdQuizzes: createdQuizzes,
      quizzes: resolvedQuizzes,
      attemptedQuizzes: attemptedQuizzes.length,
      hostedQuizzes: createdQuizzes.length,
    }
    return res.status(200).send({
      message: 'User Profile details fetched',
      quizzes: quizzes,
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
