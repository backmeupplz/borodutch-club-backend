import { authenticate } from '@/middlefares/authenticate'
import { Controller, Get, Flow } from 'koa-ts-controllers'

@Controller('/info')
export default class {
  @Get('/')
  @Flow(authenticate)
  root() {
    return 'All your club belong to us'
  }
}
