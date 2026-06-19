import { NextResponse } from "next/server";
import {
  buildCourseResourceSections,
  type CourseId,
} from "@/lib/courseStorageCatalog";

const VALID_COURSES = new Set<CourseId>([
  "appliedfinance",
  "business",
  "directtax",
  "indirecttax",
]);

/** GET /api/course-resources?course=appliedfinance */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const course = searchParams.get("course") as CourseId | null;

    if (!course || !VALID_COURSES.has(course)) {
      return NextResponse.json(
        {
          error:
            "Provide a valid course query: appliedfinance, business, directtax, or indirecttax.",
        },
        { status: 400 }
      );
    }

    const sections = await buildCourseResourceSections(course);
    return NextResponse.json({ course, sections });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    console.error("course-resources GET:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
