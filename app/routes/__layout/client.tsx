import * as React from "react";
import type { ActionArgs } from "@remix-run/node";
import { defer, json, redirect } from "@remix-run/node";
import { Link, Await, useLoaderData } from "@remix-run/react";

import { appRouter } from "~/trpc.server";
import { UserListItem, buttonClassName, createDateString } from "~/components";

export async function loader() {
  const caller = appRouter.createCaller({});

  // artificial delay to show suspense
  await new Promise((resolve) => setTimeout(resolve, 5_000));

  return defer({ users: caller.users.list(), now: new Date() });
}

export async function action({ request }: ActionArgs) {
  let caller = appRouter.createCaller({});

  let formData = await request.formData();
  let name = formData.get("name");

  if (typeof name !== "string") {
    throw json({ message: "expected name to be string" });
  }

  await caller.users.create({ name });

  return redirect("/client");
}

export default function ClientFetchPage() {
  let data = useLoaderData<typeof loader>();

  return (
    <>
      <Link className={buttonClassName} to="/">
        View SSR
      </Link>

      <React.Suspense fallback={<div>Loading...</div>}>
        <Await resolve={data.users}>
          {(users) => {
            if (typeof users === "undefined" || users.length === 0) {
              return <div>No users</div>;
            }

            return (
              <ul>
                {users.map((user) => {
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
            );
          }}
        </Await>
      </React.Suspense>
    </>
  );
}
