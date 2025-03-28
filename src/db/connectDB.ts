import mongoose from 'mongoose'
import logger from '@utils/logger'
import { MONGOURI } from 'config'

const connectDB = async () => {
  mongoose.set('strictQuery', false) // Why this? https://stackoverflow.com/questions/74747476/deprecationwarning-mongoose-the-strictquery-option-will-be-switched-back-to

  try {
    await mongoose.connect(MONGOURI || '')
    console.log('⚡️[server]: Connected to MongoDB')
    logger.silly('⚡️[server]: Connected to MongoDB')
  } catch (error) {
    logger.error(error)
  }
}

export default connectDB
