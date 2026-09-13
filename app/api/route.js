import { NextResponse } from "next/server";

export async function GET() {
  const dataset = process.env.HF_DATASET_NAME || "pauljconrad/lending-club-dataset";
  const url = `https://datasets-server.huggingface.co/size?dataset=${encodeURIComponent(dataset)}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return NextResponse.json({
      ok:true,
      dataset,
      size:data.size,
      message:`Dataset connector is reachable. ${data.size?.num_rows ?? "Unknown"} rows reported.`
    });
  } catch (e) {
    return NextResponse.json({
      ok:false,
      dataset,
      message:"Could not reach the Hugging Face Dataset Viewer. Demo data is still available.",
      error:String(e.message || e)
    }, { status: 200 });
  }
}
