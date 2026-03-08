import { NextResponse } from "next/server";
import { getAllProviderInfo } from "@/lib/providers";

export async function GET() {
    const providers = getAllProviderInfo();
    return NextResponse.json({
        status: "success",
        data: providers,
    });
}
