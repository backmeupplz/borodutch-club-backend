import { Context } from 'koa'
import { Controller, Get, Ctx, Flow } from 'koa-ts-controllers'
import { authenticate } from '@/middlefares/authenticate'
import { User } from '@/models/user'

@Controller('/login')
export default class LoginController {
  @Get('/')
  @Flow(authenticate)
  async telegram(@Ctx() ctx: Context) {
    const user = ctx.state.user as User
    return {
      name: user.name,
    }
  }
}
