import { sql, session, AuthError, SqlError } from "@elements/app";

export const MIN_PASSWORD = 8;

export interface SignupForm {
  handle: string;
  email: string;
  password: string;
  error: string;
}

export function normalizeHandle(handle: string): string {
  return handle.trim().toLowerCase();
}

export function isHandle(handle: string): boolean {
  return /^[a-z0-9_-]{3,20}$/.test(handle);
}

function isEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

/** Signs in with either the username or the email. @rpc */
export function signin(login: string, password: string) {
  let name = login.trim().toLowerCase();

  if (!name || !password) {
    throw new AuthError("enter your username and password");
  }

  let user = sql<{ id: string; handle: string }>(`
    select id, handle from users
     where (handle = ${name} or email = ${name})
       and passwordHash = crypt(${password}, passwordHash)
  `).first();

  if (!user) {
    throw new AuthError("wrong username or password");
  }

  session.login({ userId: user.id, userName: user.handle });
}

/** @rpc */
export function signup(form: SignupForm) {
  let handle = normalizeHandle(form.handle);
  let email = form.email.trim().toLowerCase();

  if (!isHandle(handle)) {
    throw new AuthError("usernames are 3 to 20 letters, digits, - or _");
  }

  if (!isEmail(email)) {
    throw new AuthError("enter a valid email address");
  }

  if (form.password.length < MIN_PASSWORD) {
    throw new AuthError(`the password needs at least ${MIN_PASSWORD} characters`);
  }

  if (!sql(`select 1 from users where handle = ${handle}`).empty()) {
    throw new AuthError(`${handle} is taken`);
  }

  if (!sql(`select 1 from users where email = ${email}`).empty()) {
    throw new AuthError("that email already has an account");
  }

  let user;

  try {
    user = sql<{ id: string }>(`
      insert into users (handle, email, passwordHash)
           values (${handle}, ${email}, crypt(${form.password}, genSalt('bf', 12)))
        returning id
    `).firstOrThrow();
  } catch (err) {
    if (err instanceof SqlError) {
      throw new AuthError("that username or email was just taken");
    }

    throw err;
  }

  session.login({ userId: user.id, userName: handle });
}

/** @rpc */
export function signout() {
  session.logout();
}
