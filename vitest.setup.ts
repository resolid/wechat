import { env } from "node:process";
import { loadEnv } from "vite";

Object.assign(env, loadEnv("", process.cwd(), ""));
