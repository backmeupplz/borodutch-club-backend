import { Context } from 'koa'
import { Controller, Get, Ctx, Flow } from 'koa-ts-controllers'
import { authenticate } from '@/middlefares/authenticate'
import { User } from '@/models/user'
import { getChatInviteLink } from '@/telegram/bot'

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
  info(@Ctx() ctx: Context) {
    const user = ctx.state.user as User
    return {
      name: user.name,
      telegramId: user.telegramId,
      subscriptionId: user.subscriptionId,
    }
  }
}
