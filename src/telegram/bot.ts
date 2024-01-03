import { Telegraf } from 'telegraf'
import { MemberModel } from '@/models/member'
import { checkIfSubscribed } from '@/models/user'

const group = +process.env.TELEGRAM_GROUP

const bot = new Telegraf(process.env.TELEGRAM_LOGIN_TOKEN)
bot.on('new_chat_members', async (ctx) => {
  for (const member of ctx.message.new_chat_members) {
    const isSubscribed = await checkIfSubscribed(member.id)
    if (isSubscribed) {
      await new MemberModel({ telegramId: member.id }).save()
      await ctx.replyWithHTML(
        `Hello, <a href="tg://user?id=${member.id}">${member.first_name}</a>! Welcome to the Borodutch Club!

Be sure to familiarize yourself with the <a href="https://telegra.ph/The-Main-Document-of-Borodutch-Club-01-03">main document of the Club</a>! It describes what to do and how to behave in this community.
        
And for now — don’t forget to introduce yourself with the hashtag #intro. If you want to meet with Club members offline, leave your city with the hashtag #geo.`,
        {
          disable_web_page_preview: true,
        }
      )
    } else {
      await kick(member.id)
    }
  }
})
bot.command(['start', 'help'], (ctx) => {
  return ctx.reply(
    'Hello! It seems you are trying to access club.borodutch.com through Telegram. This bot won’t be of much help, you need to visit club.borodutch.com directly. If you have any questions, contact @borodutch. Good luck!'
  )
})
bot.catch(console.error)
bot.launch().then(() => console.log('Telegram bot launched'))

let checking = false
async function checkSubscribers() {
  if (checking) {
    return
  }
  checking = true
  try {
    const members = await MemberModel.find()
    for (const member of members) {
      const memeberStatus = await bot.telegram.getChatMember(
        group,
        member.telegramId
      )
      if (memeberStatus.status === 'member') {
        const isSubscribed = await checkIfSubscribed(member.telegramId)
        if (isSubscribed) {
          continue
        }
        await kick(member.telegramId)
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    checking = false
  }
}
setInterval(checkSubscribers, 15 * 60 * 1000) // every 15 minutes

export async function getChatInviteLink() {
  return (
    await bot.telegram.createChatInviteLink(group, {
      expire_date: Date.now() / 1000 + 600,
    })
  ).invite_link
}

export async function kick(telegramId: number) {
  try {
    await bot.telegram.kickChatMember(group, telegramId)
  } catch (err) {
    // Do nothing
  }
}

export async function report(message: string) {
  try {
    await bot.telegram.sendMessage(+process.env.TELEGRAM_ADMIN, message)
  } catch (err) {
    // Do nothing
  }
}
