import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { UserListItem, buttonClassName, createDateString } from "~/components";
import { appRouter } from "~/trpc.server";

export async function loader() {
  const caller = appRouter.createCaller({});
  let users = await caller.users.list();
  return { users, now: new Date() };
}

export async function action({ request }: ActionArgs) {
  let caller = appRouter.createCaller({});

  let formData = await request.formData();
  let name = formData.get("name");

  if (typeof name !== "string") {
    throw json({ message: "expected name to be string" });
  }

  await caller.users.create({ name });

  return redirect("/");
}

export default function Index() {
  let data = useLoaderData<typeof loader>();

  return (
    <>
      <Link className={buttonClassName} to="client">
        View CSR
      </Link>

      <ul>
        {data.users.map((user) => {
          return (
            <UserListItem
              key={user.id}
              user={{
                ...user,
                createdAt: createDateString(user.createdAt, data.now),
              }}
            />
          );
        })}
      </ul>
    </>
  );
}
