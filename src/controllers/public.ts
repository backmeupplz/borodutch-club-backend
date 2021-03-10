import { Controller, Get } from 'koa-ts-controllers'

@Controller('/')
export default class {
  @Get('/')
  root() {
    return 'All your club belong to us'
  }
}
