import { FastifyError } from "fastify";
import fp from "fastify-plugin";
import { Type, Static } from "@fastify/type-provider-typebox";

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

  app.setNotFoundHandler(() => {
    throw new HttpError(404, "this route doesn't exist");
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

export const ErrorSchema = Type.Object({
  statusCode: Type.Number(),
  error: Type.String(),
  message: Type.String(),
});

export type ErrorSchemaType = Static<typeof ErrorSchema>;
