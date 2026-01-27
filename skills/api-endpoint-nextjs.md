---
name: Next.js API Route (App Router)
description: Create a type-safe Next.js Route Handler.
dependencies: "next, zod"
---

## Guidelines
- Use \`NextResponse\`.
- Use \`zod\` for request validation.
- Handle errors gracefully.
- Check authentication if needed.

## Template
\`\`\`typescript
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Perform database operation here
    // const user = await db.user.create({ ... })

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
\`\`\`
