import type { SerializeFrom } from "@remix-run/node";
import type { User } from "~/trpc.server";

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

export function UserListItem({ user }: { user: SerializeFrom<User> }) {
  return (
    <li key={user.id}>
      <div className="relative pb-8">
        <div className="relative flex space-x-3">
          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
            <div>
              <p className="text-sm text-gray-500">
                Created{" "}
                <span className="font-medium text-gray-900">{user.name}</span>
              </p>
            </div>
            <div className="whitespace-nowrap text-right text-sm text-gray-500">
              <time dateTime={user.createdAt}>{user.createdAt}</time>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
