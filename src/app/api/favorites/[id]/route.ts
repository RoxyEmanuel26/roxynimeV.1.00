import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE - Remove from favorites
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
        const favorite = await prisma.favorite.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (!favorite) {
            return NextResponse.json(
                { error: "Favorite not found" },
                { status: 404 }
            );
        }

        await prisma.favorite.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing from favorites:", error);
        return NextResponse.json(
            { error: "Failed to remove from favorites" },
            { status: 500 }
        );
    }
}
