import { UserModel, User } from '@/models/user'
import { Context } from 'koa'
import { verify } from '@/helpers/jwt'
import { DocumentType } from '@typegoose/typegoose'

export async function authenticate(ctx: Context, next: Function) {
  try {
    const token = ctx.headers.token as string
    if (!token) {
      return ctx.throw(403, 'No token provided')
    }
    const user = await getUserFromToken(token)
    if (!user) {
      return ctx.throw(404, 'No user found')
    }
    ctx.state.user = user
  } catch (err) {
    return ctx.throw(403, 'Not authenticated')
  }
  await next()
}

export async function getUserFromToken(token: string) {
  const payload = (await verify(token)) as any
  let user: DocumentType<User> | undefined
  if (payload?.name === 'JsonWebTokenError') {
    throw new Error(payload)
  }
  if (payload.telegramId) {
    user = await UserModel.findOne({ telegramId: payload.telegramId })
  }
  return user
}
