import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, firstName } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const apiKey = process.env.BREVO_API_KEY;
        const listId = process.env.BREVO_LIST_ID ? parseInt(process.env.BREVO_LIST_ID) : 2;

        if (!apiKey) {
            console.error("BREVO_API_KEY is missing");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Brevo API endpoint for creating a contact
        const url = "https://api.brevo.com/v3/contacts";

        const options = {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "api-key": apiKey,
            },
            body: JSON.stringify({
                email: email,
                updateEnabled: true,
                listIds: [listId],
                attributes: {
                    FIRSTNAME: firstName || "", // Pass First Name
                    SOURCE: "Livra_Landing_Page"
                }
            }),
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Brevo API Error:", errorData);
            return NextResponse.json({ error: "Failed to add to waitlist" }, { status: response.status });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Waitlist API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
