import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE - Remove a watch history entry
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Verify ownership before deleting
        const entry = await prisma.watchHistory.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (!entry) {
            return NextResponse.json(
                { error: "History entry not found" },
                { status: 404 }
            );
        }

        await prisma.watchHistory.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting watch history:", error);
        return NextResponse.json(
            { error: "Failed to delete watch history" },
            { status: 500 }
        );
    }
}
