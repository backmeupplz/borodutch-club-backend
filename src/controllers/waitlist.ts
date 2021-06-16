import { DocumentType } from '@typegoose/typegoose'
import { Controller, Post, Body, Flow, Ctx } from 'koa-ts-controllers'
import { Context } from 'koa'
import { authenticate } from '@/middlefares/authenticate'
import { User } from '@/models/user'
import { report } from '@/telegram/bot'

@Controller('/waitlist')
export default class WaitlistController {
  @Post('/')
  @Flow(authenticate)
  async postInviteCode(
    @Ctx() ctx: Context,
    @Body('email') waitlistEmail: string
  ) {
    if (!validateEmail(waitlistEmail)) {
      return ctx.throw(403)
    }
    const user = ctx.state.user as DocumentType<User>
    user.waitlistEmail = waitlistEmail
    await user.save()
    report(`${user.name} joined waitlist with ${waitlistEmail}`)
    ctx.status = 200
    return { ok: true }
  }
}
