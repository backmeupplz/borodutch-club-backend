import { DocumentType } from '@typegoose/typegoose'
import { Controller, Post, Body, Flow, Ctx } from 'koa-ts-controllers'
import { Context } from 'koa'
import { authenticate } from '@/middlefares/authenticate'
import { User, UserModel } from '@/models/user'

@Controller('/invite')
export default class InviteController {
  @Post('/code')
  @Flow(authenticate)
  async postInviteCode(
    @Ctx() ctx: Context,
    @Body('inviteCode') inviteCode: string
  ) {
    const inviter = await UserModel.findOne({ inviteCode })
    if (!inviter) {
      return ctx.throw(404)
    }
    if (!inviter.subscriptionId) {
      return ctx.throw(403)
    }
    const user = ctx.state.user as DocumentType<User>
    user.inviter = inviter
    await user.save()
    ctx.status = 200
  }
}
