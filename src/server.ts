import { buildApp } from "./app.ts";

const app = buildApp();

try {
  await app.listen({ port: 8080 });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
