import * as React from "react";
import type { ActionArgs } from "@remix-run/node";
import { defer, json } from "@remix-run/node";
import { Link, Await, useLoaderData } from "@remix-run/react";

import { appRouter } from "~/trpc.server";
import { TodoListItem, buttonClassName, createDateString } from "~/components";
import { TRPCError } from "@trpc/server";

export async function loader() {
  const caller = appRouter.createCaller({});

  // artificial delay to show suspense
  await new Promise((resolve) => setTimeout(resolve, 5_000));

  return defer({ todos: caller.todos.list(), now: new Date() });
}

export async function action({ request }: ActionArgs) {
  let caller = appRouter.createCaller({});

  let formData = await request.formData();
  let label = formData.get("label");

  if (typeof label !== "string") {
    return json({ message: "expected label to be string" }, { status: 400 });
  }

  try {
    await caller.todos.create({ label });
    return null;
  } catch (error) {
    if (error instanceof TRPCError) {
      return json({ message: error.message }, { status: 400 });
    }
    throw error;
  }
}

export default function ClientFetchPage() {
  let data = useLoaderData<typeof loader>();

  return (
    <>
      <Link className={buttonClassName} to="/">
        View SSR
      </Link>

      <React.Suspense fallback={<div>Loading...</div>}>
        <Await resolve={data.todos}>
          {(resolvedTodos) => {
            if (
              typeof resolvedTodos === "undefined" ||
              resolvedTodos.length === 0
            ) {
              return <div>No todos</div>;
            }

            return (
              <ul>
                {resolvedTodos.map((todo) => {
                  return (
                    <TodoListItem
                      key={todo.id}
                      todo={{
                        ...todo,
                        createdAt: createDateString(todo.createdAt, data.now),
                      }}
                    />
                  );
                })}
              </ul>
            );
          }}
        </Await>
      </React.Suspense>
    </>
  );
}
