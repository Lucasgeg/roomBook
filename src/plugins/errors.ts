import { FastifyError } from "fastify";
import fp from "fastify-plugin";

export default fp(async (app) => {
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error.validation || (error.statusCode && error.statusCode < 500)) {
      console.error("🚀 ~ error.statusCode:", error.statusCode);

      return reply.send(error);
    }
    console.error("🚀 ~ error:", error);
    reply.status(500).send({
      statusCode: 500,
      error: "Internal server error",
      message: "Erreur interne",
    });
  });
});

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}
