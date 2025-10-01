import Lesson from "../../../../../../models/Lesson";
import { connectMongoDB } from "../../../../../../lib/mongodb";

export async function GET(req, { params }) {
  await connectMongoDB();
  const lesson = await Lesson.findById(params.id);
  if (!lesson) return new Response(JSON.stringify({ error: "Lesson not found" }), { status: 404 });
  return new Response(JSON.stringify({ lesson }), { status: 200 });
}
