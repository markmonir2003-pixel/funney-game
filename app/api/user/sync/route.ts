import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { progressData } = await req.json();
    
    // Update user's public metadata with their game progress
    // Clerk has an 8KB limit for publicMetadata, which is enough for our StorageData
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        gameProgress: progressData,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync error:", error);
    return new NextResponse("Error syncing data", { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const progressData = user.publicMetadata.gameProgress || null;
    
    return NextResponse.json({ progressData });
  } catch (error) {
    console.error("Fetch error:", error);
    return new NextResponse("Error fetching data", { status: 500 });
  }
}
