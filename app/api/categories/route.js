import { NextResponse } from "next/server";

const categoriesByType = {
  product: [
    "Electronics",
    "Apparel",
    "Home & Garden",
    "Beauty",
    "Fitness",
    "Toys",
    "Automotive",
    "Office Supplies",
  ],
  service: [
    "Consulting",
    "Wellness",
    "Creative",
    "Home Services",
    "Events",
    "Education",
    "Technology",
    "Marketing",
  ],
  rental: [
    "Equipment",
    "Housing",
    "Vehicles",
    "Event Spaces",
    "Tools",
    "Recreational Gear",
  ],
};

export async function GET(request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type")?.toLowerCase() || "product";
  const categories = categoriesByType[type] ?? categoriesByType.product;
  return NextResponse.json({ type, categories });
}
