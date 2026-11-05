import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import { RoomType, RoomBody, Room } from "../schema/room.ts";
import { Type } from "typebox";
import { HttpError } from "../plugins/errors.ts";

let rooms: RoomType[] = [
  { id: 1, name: "A101", capacity: 30 },
  { id: 2, name: "Toto", capacity: 12 },
];
let nextId: number = 3;

export const roomExists = (id: number) => rooms.some((r) => r.id === id);

export const roomsRoutes: FastifyPluginAsync = async (app) => {
  const typed = app.withTypeProvider<TypeBoxTypeProvider>();
  app.addHook("onRequest", async (req) => {
    req.log.info(req.originalUrl);
  });

  typed.get(
    "/",
    {
      schema: {
        querystring: Type.Object(
          {
            minCapacity: Type.Optional(Type.Integer({ minimum: 1 })),
          },
          {
            additionalProperties: false,
          },
        ),
      },
    },
    async (request, response) => {
      const { minCapacity } = request.query;
      if (minCapacity) {
        return rooms.filter((r) => r.capacity >= minCapacity);
      }
      return rooms;
    },
  );
  typed.get(
    "/:id",
    {
      schema: {
        params: Type.Object({
          id: Type.String({ minLength: 1 }),
        }),
        response: {
          200: Room,
          404: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const room = rooms.find((r) => r.id === Number(id));
      if (!room) {
        throw new HttpError(404, "Room not found");
      }
      return room;
    },
  );

  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const room = rooms.find((r) => r.id === Number(request.params.id));
    if (!room) return reply.code(404).send({ error: "Room not found" });
    rooms = rooms.filter((r) => r.id !== room.id);
    return reply.code(200).send(rooms);
  });

  typed.patch(
    "/:id",
    {
      schema: {
        params: Type.Object({
          id: Type.String({ minLength: 1 }),
        }),
        body: Type.Partial(RoomBody, { minProperties: 1 }),
        response: {
          200: Room,
          404: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const room = rooms.find((r) => r.id === Number(request.params.id));
      if (!room) return reply.code(404).send({ error: "Room not found" });
      Object.assign(room, request.body);
      return room;
    },
  );

  typed.post(
    "/",
    {
      schema: {
        body: RoomBody,
      },
    },
    async (request, reply) => {
      const room: RoomType = {
        id: nextId,
        ...request.body,
      };
      rooms.push(room);
      nextId++;
      return reply.code(201).send(room);
    },
  );
};
