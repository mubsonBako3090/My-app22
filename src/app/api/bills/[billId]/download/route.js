import connectDB from "@/lib/database";
import Bill from "@/models/Bills";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const bill = await Bill.findById(params.billId).populate(
      "user",
      "firstName lastName email accountNumber"
    );

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Return JSON instead of PDF (client will generate PDF)
    return NextResponse.json(bill);
  } catch (error) {
    console.error("Download bill error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bill data" },
      { status: 500 }
    );
  }
}
