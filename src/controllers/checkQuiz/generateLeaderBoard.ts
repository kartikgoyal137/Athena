import LeaderboardModel from '@models/leaderboard/leaderboardModel';
import ResponseModel from '@models/response/responseModel';
import sendFailureResponse from '@utils/failureResponse';
import getQuiz from '@utils/getQuiz';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { IQuestion, ResponseStatus } from 'types';
import sendInvalidInputResponse from '@utils/invalidInputResponse';
import ParticipantModel from '@models/participant/participantModel';
interface generateLeaderBoardRequest extends Request {
  params: {
    quizId: string;
    sectionIndex?: string;
  };
}

interface Participant {
  userId: Types.ObjectId;
  marks: number;
  questionsAttempted: number;
  questionsChecked: number;
}

const generateLeaderBoard = async (req: generateLeaderBoardRequest, res: Response) => {
  const { quizId } = req.params;
  let sectionIndex = req.params.sectionIndex ? parseInt(req.params.sectionIndex, 10) : null;
  if (sectionIndex != null && isNaN(sectionIndex)) {
    sectionIndex = null;
  }

  try {
    const quiz = await getQuiz(quizId);
    if (!quiz || !quiz?.sections) {
      return sendInvalidInputResponse(res);
    }

    const entries: Participant[] = [];

    const questions: IQuestion[] = sectionIndex != null
      ? quiz.sections[sectionIndex]?.questions ?? []
      : quiz.sections.flatMap((section) => section.questions ?? []).filter(Boolean);

    const participants = await ParticipantModel.find({ quizId })

    await Promise.all(
      participants?.map(async (participant) => {
        const responses = await ResponseModel.find({
          userId: participant.userId,
          quizId: quizId,
          questionId: { $in: questions.filter((q) => q !== undefined).map((q) => q._id) },
        });
        let score = 0;
        let questionsAttempted = 0;
        let questionsChecked = 0;

        responses.forEach((response) => {
          score += response.marksAwarded || 0;
          questionsAttempted++;
          questionsChecked += response.status === ResponseStatus.checked ? 1 : 0;
        });

        if (
          Types.ObjectId.isValid(participant.userId)
        ) {
          const leaderboardEntry: Participant = {
            userId: participant.userId,
            marks: score,
            questionsAttempted: questionsAttempted,
            questionsChecked: questionsChecked,
          };

          entries.push(leaderboardEntry);
        }
      }) as Promise<void>[],
    );

    const sortedEntries = entries.sort((a, b) => b.marks - a.marks);

    await LeaderboardModel.findOneAndUpdate(
      { quizId: quizId, sectionIndex: sectionIndex },
      {
        quizId: quizId,
        sectionIndex: sectionIndex,
        participants: sortedEntries,
      },
      { upsert: true },
    );

    return res.status(200).json({
      message: 'Leaderboard generated successfully',
      leaderboard: sortedEntries,
    });
  } catch (error: unknown) {
    return sendFailureResponse({
      res,
      error,
      messageToSend: 'Failed to generate leaderboard',
    });
  }
};

export default generateLeaderBoard;