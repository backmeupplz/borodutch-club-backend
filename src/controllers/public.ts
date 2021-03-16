import { Controller, Get } from 'koa-ts-controllers'

@Controller('/')
export default class PublicContoller {
  @Get('/')
  root() {
    return 'All your club belong to us'
  }
}
