import { DocumentType } from '@typegoose/typegoose'
import { Context } from 'koa'
import { Controller, Get, Ctx, Flow } from 'koa-ts-controllers'
import { authenticate } from '@/middlefares/authenticate'
import { User, UserModel } from '@/models/user'
import { getChatInviteLink } from '@/telegram/bot'
const randomWords = require('random-words')

@Controller('/info')
export default class InfoController {
  @Get('/link')
  @Flow(authenticate)
  async link() {
    const link = await getChatInviteLink()
    return { link }
  }

  @Get('/')
  @Flow(authenticate)
  async info(@Ctx() ctx: Context) {
    const user = ctx.state.user as DocumentType<User>
    if (!user.inviteCode) {
      user.inviteCode = randomWords({
        exactly: 1,
        wordsPerString: 3,
        separator: '-',
      })[0]
      await user.save()
    }
    let inviter: User
    if (user.inviter) {
      inviter = await UserModel.findById(user.inviter)
    }

    return {
      name: user.name,
      telegramId: user.telegramId,
      subscriptionId: user.subscriptionId,
      inviterName: inviter ? inviter.name : undefined,
      inviteCode: user.inviteCode,
      waitlistEmail: user.waitlistEmail,
    }
  }
}
