import mongoose from 'mongoose'
import { ModelNames, IParticipant } from 'types'
import participantSchema from './participantSchema'

const ParticipantModel = mongoose.model<IParticipant>(ModelNames.Participant, participantSchema)

export default ParticipantModel
