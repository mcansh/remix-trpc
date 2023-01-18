import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { createUserSession, getUser } from "~/session.server";
import { appRouter } from "~/trpc.server";

export async function action({ request }: ActionArgs) {
  let formData = await request.formData();

  let schema = zfd.formData({
    email: zfd.text(z.string().email()),
    password: zfd.text(z.string().min(8)),
  });

  let result = schema.safeParse(formData);

  if (!result.success) {
    return json(result.error.formErrors, { status: 422 });
  }

  let caller = appRouter.createCaller({ user: await getUser(request) });

  try {
    let user = await caller.users.login(result.data);
    return createUserSession(request, user.id);
  } catch (error) {
    try {
      let user = await caller.users.create(result.data);
      return createUserSession(request, user.id);
    } catch (error) {
      throw error;
    }
  }
}

export default function Example() {
  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form className="space-y-6" method="post">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Sign in
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
