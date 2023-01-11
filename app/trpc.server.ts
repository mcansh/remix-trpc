import type { inferAsyncReturnType } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { hash, compare } from "bcrypt";
import { getUser } from "./session.server";
import { db } from "./db.server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

async function createContext(request: Request, _response: Response) {
  let user = await getUser(request);
  return { user };
}

type Context = inferAsyncReturnType<typeof createContext>;

export const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  users: t.router({
    create: t.procedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user)
          throw new TRPCError({
            code: "CONFLICT",
            message: "Already logged in",
          });

        let hashedPassword = await hash(input.password, 10);

        try {
          let user = await db.user.create({
            data: {
              email: input.email,
              password: {
                create: {
                  hash: hashedPassword,
                },
              },
            },
          });

          return user;
        } catch (error) {
          if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: error.message,
              });
            }
          }

          throw error;
        }
      }),
    login: t.procedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user)
          throw new TRPCError({
            code: "CONFLICT",
            message: "Already logged in",
          });

        let user = await db.user.findUnique({
          where: { email: input.email },
          include: { password: true },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        let passwordMatch = await compare(input.password, user.password!.hash);
        if (!passwordMatch) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid password",
          });
        }

        return user;
      }),
  }),

  todos: t.router({
    list: t.procedure.query(({ ctx }) => {
      console.log({ ctx });
      return db.todo.findMany({
        where: { userId: ctx.user?.id },
      });
    }),

    getById: t.procedure.input(z.string()).query(({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return db.todo.findUnique({ where: { id: input } });
    }),

    complete: t.procedure
      .input(
        z.object({
          id: z.string(),
          complete: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        return db.todo.update({
          where: { id: input.id },
          data: { complete: input.complete },
        });
      }),

    create: t.procedure
      .input(z.object({ label: z.string().min(5) }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        return db.todo.create({
          data: {
            title: input.label,
            user: {
              connect: {
                id: ctx.user.id,
              },
            },
          },
        });
      }),
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
