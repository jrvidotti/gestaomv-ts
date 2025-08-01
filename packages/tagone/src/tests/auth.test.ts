import { TagoneClient } from "../client";
import { LoginFailedError, TagoneError } from "../errors"
import { expect, test } from 'vitest'
import 'dotenv/config'

const baseUrl = process.env.TAGONE_BASE_URL!;
const user = process.env.TAGONE_USER!;
const password = process.env.TAGONE_PASSWORD!;

const connector = new TagoneClient(baseUrl);

test("Tagone login ok", async () => {
  const loggedClaims = await connector.doLogin(
    user,
    password
  );

  expect(loggedClaims["FullName"]).toBe(process.env.TEST_FULLNAME);
  expect(loggedClaims["Email"]).toBe(process.env.TEST_EMAIL);
});

test("Tagone login failed", async () => {
  const connector2 = new TagoneClient(baseUrl);
  await expect(connector2.doLogin("NOT_OK", "NOT_OK")).rejects.toThrow(LoginFailedError);
});

test("Tagone get logged claims fail", async () => {
  const connector2 = new TagoneClient(baseUrl);
  const result = connector2.getLoggedClaims()
  await expect(result).rejects.toThrow(TagoneError);
});

test("Tagone get logged claims ok", async () => {
  const connector2 = new TagoneClient(baseUrl, connector.tagoneCookie!);
  const loggedClaims2 = await connector2.getLoggedClaims();
  expect(loggedClaims2["FullName"]).toBe(process.env.TEST_FULLNAME);
  expect(loggedClaims2["Email"]).toBe(process.env.TEST_EMAIL);
});

