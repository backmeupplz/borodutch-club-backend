import { Context } from 'koa'
import { Controller, Get, Ctx, Flow, Post } from 'koa-ts-controllers'
import { authenticate } from '@/middlefares/authenticate'
import { stripe } from '@/helpers/stripe'
import { UserModel } from '@/models/user'
import { kick } from '@/telegram/bot'

const coupon = process.env.STRIPE_FREE_DISCOUNT

@Controller('/subscription')
export default class SubscriptionController {
  @Get('/session')
  @Flow(authenticate)
  async session(@Ctx() ctx: Context) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      subscription_data: { items: [{ plan: process.env.STRIPE_PRICE }] },
      success_url: `${process.env.FRONTEND_URL}`,
      cancel_url: `${process.env.FRONTEND_URL}`,
      client_reference_id: ctx.state.user.telegramId,
      locale: 'ru',
      discounts: ctx.state.user.free ? [{ coupon }] : undefined,
      allow_promotion_codes: true,
    })
    return {
      session: session.id,
    }
  }

  @Get('/portal')
  @Flow(authenticate)
  async portal(@Ctx() ctx: Context) {
    const subscriptionId = ctx.state.user.subscriptionId
    if (!subscriptionId) {
      return ctx.throw(404)
    }
    const subscription = await stripe.subscriptions.retrieve(
      subscriptionId as string
    )
    const customerId = subscription.customer as string
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.FRONTEND_URL,
    })
    return {
      url: session.url,
    }
  }

  @Post('/webhook')
  async webhook(@Ctx() ctx: Context) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    const signature = ctx.request.headers['stripe-signature']
    try {
      const event = stripe.webhooks.constructEvent(
        ctx.request.rawBody,
        signature,
        secret
      )
      const anyData = event.data.object as any
      switch (event.type) {
        case 'customer.subscription.deleted': {
          const subscriptionId = anyData.id
          const user = await UserModel.findOne({ subscriptionId })
          if (!user) {
            return ctx.throw(
              400,
              `Webhook Error: No user found for subscription id ${subscriptionId}`
            )
          }
          user.subscriptionId = undefined
          await user.save()
          await kick(user.telegramId)
          break
        }
        case 'checkout.session.completed': {
          const telegramId = anyData.client_reference_id
          const user = await UserModel.findOne({ telegramId })
          if (!user) {
            return ctx.throw(
              400,
              `Webhook Error: No user found with telegram id ${telegramId}`
            )
          }
          user.subscriptionId = anyData.subscription
          await user.save()
          break
        }
        default:
      }
      ctx.status = 200
      return { received: true }
    } catch (err) {
      ctx.throw(403, 'Webhook signature verification failed')
    }
  }
}
