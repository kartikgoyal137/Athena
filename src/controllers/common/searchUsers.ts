import userModel from '@models/user/userModel'
import { Request, Response } from 'express'
import { IUser } from 'types'

interface searchUserRequest extends Request {
  query: {
    query: string
  }
}

const searchUsers = async (req: searchUserRequest, res: Response) => {
  const { query } = req.query
  const users: IUser[] = await userModel.find({
    $or: [
      { 'personalDetails.name': { $regex: query, $options: 'i' } },
      { 'personalDetails.emailAdd': { $regex: query, $options: 'i' } },
      { 'personalDetails.phoneNo': { $regex: query, $options: 'i' } },
    ],
  })

  if (users) {
    res.status(200).json({
      message: 'Users found',
      users,
    })
  } else {
    res.status(404).json({
      message: 'No users found',
    })
  }
}

export default searchUsers