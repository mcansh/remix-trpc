import { PrismaClient } from '@prisma/client';

export let db: PrismaClient

declare global {
  var __db__: PrismaClient
}

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient()
} else {
  // Ensure the prisma instance is re-used during hot-reloading
  // Otherwise, a new client will be created on every reload
  global.__db__ = global.__db__ || new PrismaClient()
  db = global.__db__
}
