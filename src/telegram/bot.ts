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
        `Привет, <a href="tg://user?id=${member.id}"/>${member.first_name}</a>! Добро пожаловать в Бородач Клуб!

Обязательно ознакомься с <a href="https://telegra.ph/Glavnyj-dokument-Borodach-Kluba-04-05">главным документом Клуба</a>! Там описано, что нужно делать и как себя вести в этом сообществе.

А пока что — не забудь представиться с хештегом #интро.`
      )
    } else {
      await kick(member.id)
    }
  }
})
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
