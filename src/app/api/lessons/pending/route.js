import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Lesson from "../../../../../models/Lesson";

export async function GET(request) {
  await connectMongoDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const userEmail = session.user.email;

    const lessons = await Lesson.find({
      creator: userEmail,
      status: { $in: ["pending", "rejected"] },
    }).sort({ createdAt: -1 });
    return new Response(JSON.stringify({ lessons }), { status: 200 });

  } catch (error) {
    console.error("Failed to fetch pending lessons:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch pending lessons" }), { status: 500 });
  }
}
