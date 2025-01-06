import userModel from '@models/user/userModel'
import { Request, Response } from 'express'
import { IUser } from 'types'

interface searchUserRequest extends Request {
  query: {
    query: string
    ids: string
  }
}

const searchUsers = async (req: searchUserRequest, res: Response) => {
  const { query, ids } = req.query
  const objIds = ids?.split(',')

  if (!query && !ids) {
    return res.status(400).json({
      message: 'Invalid query',
    })
  }

  let findQuery = {}
  if (query) {
    findQuery = {
      $or: [
        { 'personalDetails.name': { $regex: query, $options: 'i' } },
        { 'personalDetails.emailAdd': { $regex: query, $options: 'i' } },
      ],
    }
  } else if (ids) {
    findQuery = { _id: { $in: objIds } }
  }

  const users: IUser[] = await userModel.find(findQuery)

  if (users && users.length > 0) {
    return res.status(200).json({
      message: 'Users found',
      users,
    })
  }

  return res.status(404).json({
    message: 'No users found',
  })

}

export default searchUsers