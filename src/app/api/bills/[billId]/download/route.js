import connectDB from "@/lib/database";
import Bill from "@/models/Bills";
import { NextResponse } from "next/server";
import jsPDF from "jspdf";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const bill = await Bill.findById(params.billId).populate("user", "firstName lastName email accountNumber");
    if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });

    // Generate PDF
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Electric Utility Provider", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Bill Number: ${bill.billNumber}`, 20, 40);
    doc.text(`Customer: ${bill.user.firstName} ${bill.user.lastName}`, 20, 48);
    doc.text(`Email: ${bill.user.email}`, 20, 56);
    doc.text(`Account Number: ${bill.user.accountNumber}`, 20, 64);
    doc.text(`Amount Paid: $${bill.amountDue.toFixed(2)}`, 20, 72);
    doc.text(`Status: ${bill.status.toUpperCase()}`, 20, 80);
    doc.text(`Payment Date: ${bill.paidAt ? new Date(bill.paidAt).toLocaleDateString() : "N/A"}`, 20, 88);

    const pdfBytes = doc.output("blob");

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Bill_${bill.billNumber}.pdf`,
      },
    });
  } catch (error) {
    console.error("Download bill error:", error);
    return NextResponse.json({ error: "Failed to generate bill PDF" }, { status: 500 });
  }
}
