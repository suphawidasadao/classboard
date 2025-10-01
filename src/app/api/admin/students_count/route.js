
import { connectMongoDB } from "../../../../../lib/mongodb";
import Attempt from "../../../../../models/Attempt";

export async function GET() {
  await connectMongoDB();

  try {
    // distinct เอา userId ไม่ซ้ำ
    const uniqueStudents = await Attempt.distinct("userId");
    return new Response(
      JSON.stringify({ count: uniqueStudents.length }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch students count" }),
      { status: 500 }
    );
  }
}
