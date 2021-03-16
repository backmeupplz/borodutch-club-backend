import * as mongoose from 'mongoose'
import * as Koa from 'koa'
import { Server } from 'http'

export function dropMongo() {
  return Promise.all(
    Object.values(mongoose.connection.collections).map((collection) =>
      collection.deleteMany({})
    )
  )
}
export function startKoa(
  app: Koa<Koa.DefaultState, Koa.DefaultContext>
): Promise<Server> {
  return new Promise((res, rej) => {
    const connection = app
      .listen()
      .on('listening', () => {
        res(connection)
      })
      .on('error', rej)
  })
}

export function stopServer(server: Server) {
  return new Promise<void>((res) => {
    server.close(() => {
      res()
    })
  })
}
