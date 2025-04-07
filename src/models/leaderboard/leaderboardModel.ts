import mongoose from 'mongoose'
import { ModelNames, ILeaderboard } from 'types'
import leaderboardSchema from './leaderboardSchema'

const LeaderboardModel = mongoose.model<ILeaderboard>(ModelNames.Leaderboard, leaderboardSchema)

export default LeaderboardModel
