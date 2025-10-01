import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Lesson from "../../../../../../models/Lesson";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await connectMongoDB();
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { id } = req.query;

    const updatedLesson = await Lesson.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );

    if (!updatedLesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    return res.status(200).json({ message: "Lesson rejected", lesson: updatedLesson });
  } catch (error) {
    console.error("Reject error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
