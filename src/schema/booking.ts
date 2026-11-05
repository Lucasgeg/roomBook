import { Type, Static } from "@fastify/type-provider-typebox";

export const BookingBody = Type.Object({
  roomId: Type.Integer({ minimum: 1 }),
  userId: Type.Integer({ minimum: 1 }),
  startsAt: Type.String({ format: "date-time" }),
  endsAt: Type.String({ format: "date-time" }),
});

export type BookingBodyType = Static<typeof BookingBody>;

export const Booking = Type.Object({
  id: Type.Integer(),
  roomId: Type.Integer(),
  userId: Type.Integer(),
  startsAt: Type.String(),
  endsAt: Type.String(),
});

export type BookingType = Static<typeof Booking>;
