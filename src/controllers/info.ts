import { DocumentType } from '@typegoose/typegoose'
import { Context } from 'koa'
import { Controller, Get, Ctx, Flow } from 'koa-ts-controllers'
import { authenticate } from '@/middlefares/authenticate'
import { User } from '@/models/user'
import { getChatInviteLink } from '@/telegram/bot'
import randomWords from 'random-words'

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

    return {
      name: user.name,
      telegramId: user.telegramId,
      subscriptionId: user.subscriptionId,
      inviterName: user.inviter ? (user.inviter as User).name : undefined,
      inviteCode: user.inviteCode,
    }
  }
}
