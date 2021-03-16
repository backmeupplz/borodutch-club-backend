import { Context } from 'koa'
import { getOrCreateUser } from '@/models/user'
import { Controller, Ctx, Post } from 'koa-ts-controllers'
import { verifyTelegramPayload } from '@/helpers/verifyTelegramPayload'

@Controller('/login')
export default class LoginController {
  @Post('/telegram')
  async telegram(@Ctx() ctx: Context) {
    const data = ctx.request.body
    // verify the data
    if (!verifyTelegramPayload(data)) {
      return ctx.throw(403)
    }
    const user = await getOrCreateUser({
      name: `${data.first_name}${data.last_name ? ` ${data.last_name}` : ''}`,
      telegramId: data.id,
    })
    return user.stripped()
  }
}
