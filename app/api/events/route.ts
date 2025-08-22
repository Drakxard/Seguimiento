// @ts-nocheck
import { NextResponse } from "next/server";
import { loadEvents, saveEvents } from "../../../lib/events";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const state = loadEvents();
  if (id) {
    const event = state.events.find((e) => e.id === id);
    if (event) return NextResponse.json(event);
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(state.events);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, event } = body;
  const state = loadEvents();

  switch (action) {
    case "add":
      state.events.push({
        ...event,
        completed: event.completed ?? 0,
        total: event.total ?? 0,
      });
      saveEvents(state);
      return NextResponse.json({ status: "added" });

    case "edit":
      const index = state.events.findIndex((e) => e.id === event.id);
      if (index !== -1) {
        state.events[index] = {
          ...state.events[index],
          ...event,
        };
      }
      saveEvents(state);
      return NextResponse.json({ status: "updated" });

    case "delete":
      const idx = state.events.findIndex((e) => e.id === event.id);
      if (idx !== -1) state.events.splice(idx, 1);
      saveEvents(state);
      return NextResponse.json({ status: "deleted" });

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
