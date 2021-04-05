import { Context } from 'koa'
import { getOrCreateUser } from '@/models/user'
import { Controller, Body, Post, Ctx } from 'koa-ts-controllers'
import { verifyTelegramPayload } from '@/helpers/verifyTelegramPayload'

@Controller('/login')
export default class LoginController {
  @Post('/telegram')
  async telegram(@Ctx() ctx: Context, @Body() body: any) {
    // verify the data
    if (!verifyTelegramPayload(body)) {
      return ctx.throw(403)
    }
    const user = await getOrCreateUser({
      name: `${body.first_name}${body.last_name ? ` ${body.last_name}` : ''}`,
      telegramId: body.id,
    })
    return user.stripped()
  }
}
