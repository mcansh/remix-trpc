import crypto from "crypto";
import { initTRPC } from "@trpc/server";
import { z } from "zod";

export const t = initTRPC.create();

export interface User {
  id: string;
  name: string;
  createdAt: string;
}

function id() {
  return crypto.randomBytes(16).toString("hex");
}

let userList: Array<User> = [
  {
    id: id(),
    name: "Logan",
    createdAt: new Date().toISOString(),
  },
];

declare global {
  var __userList__: Array<User>;
}

if (!global.__userList__) {
  global.__userList__ = userList;
} else {
  userList = global.__userList__;
}

export const appRouter = t.router({
  users: t.router({
    list: t.procedure.query(() => {
      return userList;
    }),

    getById: t.procedure.input(z.string()).query((req) => {
      return userList.find((user) => user.id === req.input);
    }),

    create: t.procedure
      .input(z.object({ name: z.string().min(5) }))
      .mutation(async (req) => {
        userList.push({
          id: id(),
          name: req.input.name,
          createdAt: new Date().toISOString(),
        });

        return userList;
      }),
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
