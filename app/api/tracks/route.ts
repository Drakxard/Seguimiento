import { NextResponse } from "next/server"
import { tracks } from "../../../lib/tracks"

export async function GET() {
  return NextResponse.json(tracks)
}
