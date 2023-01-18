import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { TRPCError } from "@trpc/server";
import { Suspense } from "react";
import { z, ZodError } from "zod";
import { zfd } from "zod-form-data";
import { TodoListItem } from "~/components";
import { getUser } from "~/session.server";
import { appRouter } from "~/trpc.server";

export async function loader({ request }: LoaderArgs) {
  let user = await getUser(request);
  let caller = appRouter.createCaller({ user });
  let criticalTodos = await caller.todos.list({ count: 2 });
  let todos = caller.todos.list({ skip: 2 });
  return defer({
    criticalTodos,
    todos,
    now: new Date(),
  });
}

export async function action({ request }: ActionArgs) {
  let user = await getUser(request);
  let caller = appRouter.createCaller({ user });

  let formData = await request.formData();
  let intent = formData.get("intent");

  try {
    switch (intent) {
      case "create": {
        let schema = zfd.formData({ label: zfd.text(z.string().min(1)) });
        let result = schema.parse(formData);
        await caller.todos.create({ label: result.label });
        return null;
      }

      case "update": {
        let schema = zfd.formData({
          id: zfd.text(z.string().min(1)),
          complete: zfd.checkbox(),
        });
        let result = schema.parse(formData);
        await caller.todos.complete(result);
        return null;
      }

      default: {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unknown intent",
        });
      }
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return json(error.formErrors, { status: 422 });
    }

    if (error instanceof TRPCError) {
      return json(error, { status: 422 });
    }
    throw error;
  }
}

export default function Index() {
  let data = useLoaderData<typeof loader>();
  console.log({ data });

  return (
    <>
      <h1>Todos</h1>
      <div>
        <ul className="space-y-4">
          {data.criticalTodos.map((todo) => {
            return (
              <li key={todo.id}>
                <TodoListItem
                  complete={todo.complete}
                  id={todo.id}
                  title={todo.title}
                />
              </li>
            );
          })}
          <Suspense fallback={<div className="italic">Loading...</div>}>
            <Await resolve={data.todos}>
              {(resolvedTodos) => {
                return resolvedTodos.map((todo) => {
                  return (
                    <li key={todo.id}>
                      <TodoListItem
                        complete={todo.complete}
                        id={todo.id}
                        title={todo.title}
                      />
                    </li>
                  );
                });
              }}
            </Await>
          </Suspense>
        </ul>
      </div>
    </>
  );
}
