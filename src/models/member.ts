import { prop, getModelForClass } from '@typegoose/typegoose'

export class Member {
  @prop({ required: true, index: true })
  telegramId: number
}

export const MemberModel = getModelForClass(Member, {
  schemaOptions: { timestamps: true },
})
