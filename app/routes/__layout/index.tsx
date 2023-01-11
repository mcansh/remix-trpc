import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { createDateString, TodoListItem } from "~/components";
import { getUser } from "~/session.server";
import { appRouter } from "~/trpc.server";

export async function loader({ request }: LoaderArgs) {
  let user = await getUser(request);
  let caller = appRouter.createCaller({ user });
  let todos = await caller.todos.list();
  return { todos, now: new Date() };
}

export async function action({ request }: ActionArgs) {
  let user = await getUser(request);
  let caller = appRouter.createCaller({ user });

  let formData = await request.formData();
  let intent = formData.get("intent");

  switch (intent) {
    case "create": {
      let schema = zfd.formData({ label: zfd.text(z.string().min(1)) });
      let result = schema.safeParse(formData);
      if (!result.success) {
        return json(result.error.formErrors, { status: 422 });
      }

      try {
        await caller.todos.create({ label: result.data.label });
        return null;
      } catch (error) {
        if (error instanceof TRPCError) {
          return json({ message: error.message }, { status: 422 });
        }
        throw error;
      }
    }
    case "update": {
      let schema = zfd.formData({
        id: zfd.text(z.string().min(1)),
        complete: zfd.checkbox(),
      });
      let result = schema.safeParse(formData);
      if (!result.success) {
        return json(result.error.formErrors, { status: 422 });
      }

      try {
        await caller.todos.complete(result.data);
        return null;
      } catch (error) {
        if (error instanceof TRPCError) {
          return json({ message: error.message }, { status: 422 });
        }
        throw error;
      }
    }
  }
}

export default function Index() {
  let data = useLoaderData<typeof loader>();

  return (
    <>
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
