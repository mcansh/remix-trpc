import type { Session } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createCookieSessionStorage } from "@remix-run/node";
import { db } from "./db.server";

if (!process.env.SESSION_PASSWORD) {
  throw new Error("Please set the SESSION_PASSWORD environment variable");
}

export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: [process.env.SESSION_PASSWORD],
    sameSite: "strict",
    maxAge: 60 * 60, // 1 hour
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  },
});

export function getSession(request: Request): Promise<Session> {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

let USER_SESSION_KEY = "userId";

export async function getUserId(request: Request): Promise<string | undefined> {
  let session = await getSession(request);
  return session.get(USER_SESSION_KEY);
}

export async function getUser(request: Request) {
  let userId = await getUserId(request);
  if (!userId) return null;
  let user = await db.user.findUnique({ where: { id: userId } });
  return user;
}

export async function createUserSession(
  request: Request,
  userId: string,
  returnTo: string = "/"
) {
  let session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);

  return redirect(returnTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}
