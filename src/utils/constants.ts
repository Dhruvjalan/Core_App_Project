import path from "path";
import dotenv from "dotenv";

const envPath = path.resolve(__dirname, "../../.env");
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.warn(`⚠️ Warning: Could not load .env file from ${envPath}. Ensure it exists.`);
}

const checkEnv = (key: string): string => {
    const value = process.env[key];
    if (value === undefined || value === "") {
        throw new Error(`${key} not set in .env file`);
    }
    return value;
};

export const AUTH_TOKEN_KEY = checkEnv("AUTH_TOKEN_KEY");
export const HASHKEY = checkEnv("HASHKEY");

export const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGODB_URI) throw new Error("MONGO_URI or MONGODB_URI not set");

export const PORT = process.env.PORT || "3000";

export const USER_NAME = checkEnv("USER_NAME");
export const USER_EMAIL = checkEnv("USER_EMAIL");

export const LOG_SHEET_ID = checkEnv("LOG_SHEET_ID");
export const SEND_EMAIL_PASS = checkEnv("SEND_EMAIL_PASS");
export const SEND_EMAIL_USER = checkEnv("SEND_EMAIL_USER");

export const CLIENT_ID = checkEnv("CLIENT_ID");
export const CLIENT_SECRET = checkEnv("CLIENT_SECRET");
export const REDIRECT_URI = checkEnv("REDIRECT_URI");
export const REFRESH_TOKEN = checkEnv("REFRESH_TOKEN");

export const ECLIENT_ID = checkEnv("ECLIENT_ID");
export const ECLIENT_SECRET = checkEnv("ECLIENT_SECRET"); 
export const EREDIRECT_URI = checkEnv("EREDIRECT_URI");
export const EREFRESH_TOKEN = checkEnv("EREFRESH_TOKEN");