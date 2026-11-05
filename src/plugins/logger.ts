import fp from "fastify-plugin";

export default fp(async (app) => {
  app.addHook("onRequest", async (request) => {
    request.log.info("toutes les routes");
  });
});
