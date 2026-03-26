import "dotenv/config";

if (process.env.AUTH_TOKEN_KEY === undefined) throw new Error("AUTH_TOKEN_KEY not set");
export const AUTH_TOKEN_KEY = process.env.AUTH_TOKEN_KEY;

if (process.env.HASHKEY === undefined) throw new Error("HASHKEY not set");
export const HASHKEY = process.env.HASHKEY;

if (process.env.MONGO_URI === undefined) throw new Error("MONGO_URI not set");
export const MONGO_URI = process.env.MONGO_URI;

if (process.env.PORT === undefined) throw new Error("PORT not set");
export const PORT = process.env.PORT;

if (process.env.USER_NAME === undefined) throw new Error("USER_NAME not set");
export const USER_NAME = process.env.USER_NAME;

if (process.env.USER_EMAIL === undefined) throw new Error("USER_EMAIL not set");
export const USER_EMAIL = process.env.USER_EMAIL;

if (process.env.LOG_SHEET_ID === undefined) throw new Error("LOG_SHEET_ID not set");
export const LOG_SHEET_ID = process.env.LOG_SHEET_ID;

if (process.env.SEND_EMAIL_PASS === undefined) throw new Error("SEND_EMAIL_PASS not set");
export const SEND_EMAIL_PASS = process.env.SEND_EMAIL_PASS;

if (process.env.SEND_EMAIL_USER === undefined) throw new Error("SEND_EMAIL_USER not set");
export const SEND_EMAIL_USER = process.env.SEND_EMAIL_USER;

if (process.env.CLIENT_ID === undefined) throw new Error("CLIENT_ID not set");
if (process.env.CLIENT_SECRET === undefined) throw new Error("CLIENT_SECRET not set");
if (process.env.REDIRECT_URI === undefined) throw new Error("REDIRECT_URI not set");
if (process.env.REFRESH_TOKEN === undefined) throw new Error("REFRESH_TOKEN not set");
if (process.env.ECLIENT_ID === undefined) throw new Error("ECLIENT_ID not set");
if (process.env.ECLIENT_SECRET === undefined) throw new Error("ECLIENT_SECRET not set");
if (process.env.EREDIRECT_URI === undefined) throw new Error("EREDIRECT_URI not set");
if (process.env.EREFRESH_TOKEN === undefined) throw new Error("EREFRESH_TOKEN not set");

export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const REDIRECT_URI = process.env.REDIRECT_URI;
export const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

export const ECLIENT_ID = process.env.ECLIENT_ID;
export const ECLIENT_SECRET = process.env.ECLIENT_SECRET;
export const EREDIRECT_URI = process.env.EREDIRECT_URI;
export const EREFRESH_TOKEN = process.env.EREFRESH_TOKEN;
