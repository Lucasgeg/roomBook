import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import { BookingBody, Booking, BookingBodyType } from "../schema/booking.ts";
import { Type } from "typebox";
import { roomExists } from "./rooms.ts";
import { BookingType } from "../schema/booking.ts";

let bookings: BookingType[] = [
  {
    id: 1,
    endsAt: new Date().toDateString(),
    startsAt: new Date().toDateString(),
    roomId: 1,
    userId: 12,
  },
];
let nextId: number = 2;

export const bookingsRoutes: FastifyPluginAsync = async (app) => {
  const typed = app.withTypeProvider<TypeBoxTypeProvider>();

  typed.get(
    "/",
    {
      schema: {
        response: {
          200: Type.Array(Booking),
        },
      },
    },
    async () => {
      return bookings;
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
          200: Booking,
          404: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const booking = bookings.find((r) => r.id === Number(id));
      if (!booking) return reply.code(404).send({ error: "Booking not found" });
      return booking;
    },
  );

  app.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const booking = bookings.find((r) => r.id === Number(request.params.id));
    if (!booking) return reply.code(404).send({ error: "Booking not found" });
    bookings = bookings.filter((r) => r.id !== booking.id);
    return reply.code(204).send();
  });

  typed.patch(
    "/:id",
    {
      schema: {
        params: Type.Object({
          id: Type.String({ minLength: 1 }),
        }),
        body: Type.Partial(BookingBody, { minProperties: 1 }),
        response: {
          200: Booking,
          404: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const booking = bookings.find((r) => r.id === Number(request.params.id));
      if (!booking) return reply.code(404).send({ error: "Booking not found" });
      Object.assign(booking, request.body);
      return booking;
    },
  );

  typed.post(
    "/",
    {
      schema: {
        body: BookingBody,
        response: {
          201: Booking,
          400: Type.Object({
            error: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { roomId, startsAt, endsAt } = request.body;
      if (new Date(endsAt) <= new Date(startsAt)) {
        return reply
          .code(400)
          .send({ error: "endsAt must be after startsAt" });
      }
      if (!roomExists(roomId)) {
        return reply.code(400).send({ error: "Room does not exist" });
      }
      const booking: BookingType = {
        id: nextId,
        ...request.body,
      };
      bookings.push(booking);
      nextId++;
      return reply.code(201).send(booking);
    },
  );
};
