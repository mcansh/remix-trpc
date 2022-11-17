import crypto from "crypto";
import { initTRPC } from "@trpc/server";
import { z } from "zod";

export const t = initTRPC.create();

export interface Todo {
  id: string;
  label: string;
  createdAt: string;
}

function id() {
  return crypto.randomBytes(16).toString("hex");
}

let todoList: Array<Todo> = [
  {
    id: id(),
    label: "walk the dog",
    createdAt: new Date().toISOString(),
  },
];

declare global {
  var __todoList__: Array<Todo>;
}

if (!global.__todoList__) {
  global.__todoList__ = todoList;
} else {
  todoList = global.__todoList__;
}

export const appRouter = t.router({
  todos: t.router({
    list: t.procedure.query(() => {
      return todoList;
    }),

    getById: t.procedure.input(z.string()).query((req) => {
      return todoList.find((todo) => todo.id === req.input);
    }),

    create: t.procedure
      .input(z.object({ label: z.string().min(5) }))
      .mutation(async (req) => {
        todoList.push({
          id: id(),
          label: req.input.label,
          createdAt: new Date().toISOString(),
        });

        return todoList;
      }),
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
