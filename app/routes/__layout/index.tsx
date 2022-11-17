import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { TRPCError } from "@trpc/server";
import { buttonClassName, createDateString, TodoListItem } from "~/components";
import { appRouter } from "~/trpc.server";

export async function loader() {
  const caller = appRouter.createCaller({});
  let todos = await caller.todos.list();
  return { todos, now: new Date() };
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

export default function Index() {
  let data = useLoaderData<typeof loader>();

  return (
    <>
      <Link className={buttonClassName} to="client">
        View CSR
      </Link>

      <ul>
        {data.todos.map((todo) => {
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
    </>
  );
}
