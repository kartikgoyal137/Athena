import { Request, Response } from 'express'
import QuizModel from '@models/quiz/quizModel'
import ParticipantModel from '@models/participant/participantModel'
import sendInvalidInputResponse from '@utils/invalidInputResponse'
import sendFailureResponse from '@utils/failureResponse'
import LeaderboardModel from '@models/leaderboard/leaderboardModel'
import UserModel from '@models/user/userModel'
import { Types } from 'mongoose'

interface getDashboardRequest extends Request {
  params: {
    quizId: string
    sectionIndex: string
  }
  query: {
    search?: string
  }
}

interface UserDetails {
  userId: Types.ObjectId
  name: string | undefined
  phoneNumber: string | undefined
}

function prefixSearch(searchQuery: string, name: string, phoneNumber: string) {
  //checks if the search query is a prefix of the name or phone number
  if (!searchQuery || searchQuery === '') return true
  if (/^\d+$/.test(searchQuery)) {
    return phoneNumber.startsWith(searchQuery) //only prefix of the phone number
  }
  if (/^[a-zA-Z]+$/.test(searchQuery)) {
    return name.toLowerCase().startsWith(searchQuery.toLowerCase()) //only prefix of the name
  }
  return false
}

const getCheckingDashboard = async (req: getDashboardRequest, res: Response) => {
  const quizId = req.params.quizId
  let sectionIndex = req.params.sectionIndex ? parseInt(req.params.sectionIndex, 10) : null
  if (sectionIndex != null && isNaN(sectionIndex)) {
    sectionIndex = null
  }
  const searchQuery = req.query.search as string | undefined // Adjusted to match the query parameter name 'search'

  const users: UserDetails[] = []
  const searchedLeaderboard = []

  try {
    const quiz = await QuizModel.findById(quizId).populate({
      path: 'sections',
      select: 'name questions',
      populate: {
        path: 'questions',
        select: 'type description totalAttempts checkedAttempts assignedTo',
        populate: {
          path: 'assignedTo',
          select: 'personalDetails.name personalDetails.emailAdd',
        },
      },
    })
    if (!quiz) {
      return sendInvalidInputResponse(res)
    }

    let checksCompleted = 0
    let totalAttempts = 0
    quiz?.sections?.forEach((section) => {
      section?.questions?.forEach((question) => {
        checksCompleted += question?.checkedAttempts || 0
        totalAttempts += question?.totalAttempts || 0
      })
    })

    const leaderboard = await LeaderboardModel.find({ quizId: quizId, sectionIndex: sectionIndex })

    for (const entry of leaderboard) {
      for (const participant of entry.participants) {
        const userId = participant.userId
        const user = await UserModel.findById(userId)

        if (user) {
          const name = user.personalDetails?.name?.toLowerCase() || ''
          const phoneNumber = user.personalDetails?.phoneNo || ''

          if (
            !searchQuery ||
            prefixSearch(searchQuery, name, phoneNumber)
          ) {
            users.push({
              userId: user._id,
              name: user.personalDetails?.name,
              phoneNumber: user.personalDetails?.phoneNo,
            })
            searchedLeaderboard.push({
              userId: user._id,
              questionsAttempted: participant.questionsAttempted,
              questionsChecked: participant.questionsChecked,
              marks: participant.marks,
            })
          }
        }
      }
    }
    if (leaderboard.length > 0) {
      leaderboard[0].participants = searchedLeaderboard;
    }
    const participantsCount = await ParticipantModel.countDocuments({ quizId });
    return res.status(200).json({
      admin: quiz.admin,
      scheduled: quiz.quizMetadata?.startDateTimestamp,
      sections: quiz.sections,
      participants: participantsCount,
      checksCompleted: checksCompleted,
      totalAttempts: totalAttempts,
      leaderboard: leaderboard,
      users: users,
      name: quiz?.quizMetadata?.name,
    })
  } catch (error: unknown) {
    return sendFailureResponse({
      res,
      error,
      messageToSend: 'Failed to get checking dashboard',
    })
  }
}

export default getCheckingDashboard
