import type { SerializeFrom } from "@remix-run/node";
import type { Todo } from "@prisma/client";
import { isAfter } from "date-fns";
import { useFetcher } from "@remix-run/react";

export const buttonClassName = `inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-5 py-3 text-base font-medium text-indigo-700 hover:bg-indigo-200`;

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

export function TodoListItem({ todo }: { todo: SerializeFrom<Todo> }) {
  let fetcher = useFetcher();
  return (
    <li key={todo.id}>
      <div className="relative pb-8">
        <div className="relative flex space-x-3">
          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
            <div>
              <fetcher.Form
                method="post"
                className="text-sm text-gray-500 items-center flex"
              >
                <input type="hidden" name="intent" value="update" />
                <input type="hidden" name="id" value={todo.id} />
                <input
                  defaultChecked={todo.complete}
                  id={`checkbox-${todo.id}`}
                  type="checkbox"
                  name="complete"
                  className="rounded accent-indigo-400"
                />
                <label
                  htmlFor={`checkbox-${todo.id}`}
                  className="font-medium text-gray-900 ml-2"
                >
                  {todo.title}
                </label>
                <button type="submit" className={buttonClassName}>
                  {todo.complete ? "Undo" : "Complete"}
                </button>
              </fetcher.Form>
            </div>
            <div className="whitespace-nowrap text-right text-sm text-gray-500">
              {isAfter(new Date(todo.updatedAt), new Date(todo.createdAt)) ? (
                <time dateTime={todo.updatedAt}>{todo.updatedAt}</time>
              ) : (
                <time dateTime={todo.createdAt}>{todo.createdAt}</time>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
