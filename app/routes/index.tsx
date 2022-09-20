import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { appRouter } from "~/trpc.server";

export async function loader() {
  const caller = appRouter.createCaller({});
  let users = await caller.users.list();
  return { users };
}

export async function action({ request }: ActionArgs) {
  let formData = await request.formData();

  let caller = appRouter.createCaller({});
  let user = await caller.users.create({
    // @ts-expect-error - zod will validate this
    name: formData.get("name"),
  });

  console.log({ user });

  return redirect("/");
}

export default function Index() {
  let data = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>

      <Form method="post">
        <input name="name" />
        <button type="submit">Create User</button>
      </Form>

      <ul>
        {data.users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
