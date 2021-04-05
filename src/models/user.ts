import { sign } from '@/helpers/jwt'
import { prop, getModelForClass, DocumentType } from '@typegoose/typegoose'
import { omit } from 'lodash'

export class User {
  @prop({ required: true, index: true })
  name: string
  @prop({ required: true, index: true })
  telegramId: number
  @prop({ required: true, index: true, unique: true })
  token: string

  @prop({ required: false, unique: true })
  subscriptionId?: string

  stripped() {
    const stripFields = ['createdAt', '__v']
    return omit(this._doc, stripFields)
  }

  // Mongo property
  _doc: any
}

export const UserModel = getModelForClass(User, {
  schemaOptions: { timestamps: true },
})

interface LoginOptions {
  name: string
  telegramId: number
}

export async function getOrCreateUser(loginOptions: LoginOptions) {
  if (!loginOptions.name) {
    throw new Error()
  }
  let user: DocumentType<User> | undefined
  user = await UserModel.findOne({
    telegramId: loginOptions.telegramId,
  })
  if (!user) {
    user = await new UserModel({
      ...loginOptions,
      token: await sign(loginOptions),
    }).save()
  }
  return user
}

export async function checkIfSubscribed(telegramId: number) {
  const user = await UserModel.findOne({
    telegramId,
  })
  return !!user?.subscriptionId
}
