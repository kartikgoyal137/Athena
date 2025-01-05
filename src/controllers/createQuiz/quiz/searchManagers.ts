import userModel from '@models/user/userModel'
import { Request, Response } from 'express'
import { IUser } from 'types'

interface searchManagersRequest extends Request {
  body: {
    query: string
  }
}

const searchManagers = async (req: searchManagersRequest, res: Response) => {
  const { query } = req.body
  const managers: IUser[] = await userModel.find({
    $or: [
      { 'personalDetails.name': { $regex: query, $options: 'i' } },
      { 'personalDetails.emailAdd': { $regex: query, $options: 'i' } },
      { 'personalDetails.phoneNo': { $regex: query, $options: 'i' } },
    ],
  })
  
  if (managers) {
    res.status(200).json({
        message: 'Managers found',
        managers,
    })
  } else {
    res.status(404).json({
      message: 'No managers found',
    })
  }
}

export default searchManagers
