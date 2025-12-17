import DownloadBillButton from "@/components/DownloadBillButton";

export default function BillPage({ billId }) {
  return (
    <div>
      <h1>Your Bill</h1>
      <DownloadBillButton billId={billId} />
    </div>
  );
}
