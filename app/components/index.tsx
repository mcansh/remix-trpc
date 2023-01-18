import type { Todo } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { Svg } from "./heroicons";

export function createDateString(date: string, now: string) {
  let createdAt = new Date(date);
  let isToday = createdAt.toDateString() === new Date(now).toDateString();
  return isToday
    ? createdAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })
    : createdAt.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export function TodoListItem({
  complete,
  id,
  title,
}: Pick<Todo, "complete" | "id" | "title">) {
  let fetcher = useFetcher();
  return (
    <div className="flex space-x-3">
      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5 items-center">
        <div>
          <fetcher.Form
            method="post"
            className="text-sm text-gray-500 items-center flex"
          >
            <input type="hidden" name="intent" value="update" />
            <input type="hidden" name="id" value={id} />
            {!complete ? (
              <input type="hidden" name="complete" value="on" />
            ) : null}
            <button type="submit" className="flex items-center">
              {complete ? (
                <Svg
                  name="solid:20:check-circle"
                  className="w-6 h-6 fill-indigo-600"
                />
              ) : (
                <div className="h-6 w-6 p-0.5">
                  <div className="h-full w-full rounded-full border border-indigo-600" />
                </div>
              )}
              <span className="ml-2">{title}</span>
            </button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
