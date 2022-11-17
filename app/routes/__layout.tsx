import * as React from "react";
import { Outlet, useFetcher } from "@remix-run/react";

export default function Layout() {
  let fetcher = useFetcher<{ message: string }>();
  let formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    console.log(fetcher);
    if (fetcher.type === "done") {
      formRef.current?.reset();
    }
  }, [fetcher]);

  return (
    <div className="grid gap-4 p-6">
      <h1 className="text-xl font-medium">Welcome to Remix</h1>

      <fetcher.Form
        ref={formRef}
        method="post"
        className="space-y-4"
        action="/?index"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Todo
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="label"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {fetcher.data?.message ? (
              <div className="text-red-500">{fetcher.data.message}</div>
            ) : null}
          </div>
        </div>
        <button
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          type="submit"
        >
          Create Todo
        </button>
      </fetcher.Form>

      <Outlet />
    </div>
  );
}
