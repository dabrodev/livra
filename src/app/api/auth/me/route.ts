
import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getOrCreateUser();
        // Return public user info + role
        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        });
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
