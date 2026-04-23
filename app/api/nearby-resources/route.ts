import { NextRequest, NextResponse } from "next/server";

type ResourceType =
  | "hospital"
  | "clinic"
  | "pharmacy"
  | "police"
  | "veterinary"
  | "warehouse"
  | "blackstore";

interface ResourcePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: ResourceType;
  address: string;
  phone: string;
  description: string;
}

const CURATED_MUMBAI_RESOURCES: ResourcePoint[] = [
  {
    id: "curated-h-1",
    name: "KEM Hospital",
    lat: 19.0022,
    lng: 72.8417,
    type: "hospital",
    address: "Parel, Mumbai",
    phone: "+91-22-2410-7000",
    description: "Major tertiary care hospital with emergency trauma facilities.",
  },
  {
    id: "curated-h-2",
    name: "Sion Hospital",
    lat: 19.0429,
    lng: 72.8618,
    type: "hospital",
    address: "Sion West, Mumbai",
    phone: "+91-22-2407-6381",
    description: "Large municipal hospital with 24x7 emergency services.",
  },
  {
    id: "curated-h-3",
    name: "Apollo Hospitals Navi Mumbai",
    lat: 19.0288,
    lng: 73.0297,
    type: "hospital",
    address: "Parsik Hill Road, Belapur, Navi Mumbai",
    phone: "+91-22-6280-6280",
    description: "Multi-speciality emergency hospital serving Navi Mumbai.",
  },
  {
    id: "curated-p-1",
    name: "Nair Hospital Police Chowky",
    lat: 18.9697,
    lng: 72.8193,
    type: "police",
    address: "Mumbai Central, Mumbai",
    phone: "+91-22-2308-1270",
    description: "Nearest police post for hospital zone and emergency response.",
  },
  {
    id: "curated-p-2",
    name: "Belapur Police Station",
    lat: 19.0156,
    lng: 73.0384,
    type: "police",
    address: "CBD Belapur, Navi Mumbai",
    phone: "+91-22-2757-1555",
    description: "Police station with rapid response support in CBD area.",
  },
  {
    id: "curated-v-1",
    name: "Crown Vet - Pet Hospital",
    lat: 19.0601,
    lng: 72.8354,
    type: "veterinary",
    address: "Khar West, Mumbai",
    phone: "+91-22-2648-0099",
    description: "Animal emergency and veterinary care center.",
  },
  {
    id: "curated-d-1",
    name: "Heads Up For Tails - Dog Food Store",
    lat: 19.1294,
    lng: 72.8252,
    type: "pharmacy",
    address: "Lokhandwala, Andheri West, Mumbai",
    phone: "+91-11-4084-5100",
    description: "Reliable dog food and pet supplies source.",
  },
  {
    id: "curated-c-1",
    name: "Sanjeevani Clinic",
    lat: 19.0883,
    lng: 72.9057,
    type: "clinic",
    address: "Ghatkopar, Mumbai",
    phone: "+91-22-2501-1020",
    description: "General emergency clinic for first response stabilization.",
  },
];

const MOCK_SPECIAL_RESOURCES = [
  {
    id: "mock-wh-1",
    name: "Flood Rescue Main Warehouse",
    latOffset: 0.018,
    lngOffset: -0.02,
    type: "warehouse" as ResourceType,
    address: "Sector 19 Supply Yard",
    phone: "+91-22-4000-3101",
    description: "Mock reserve for ropes, boats, life jackets, and pumps.",
  },
  {
    id: "mock-wh-2",
    name: "Rapid Boats Equipment Depot",
    latOffset: -0.02,
    lngOffset: 0.025,
    type: "warehouse" as ResourceType,
    address: "Riverside Logistics Hub",
    phone: "+91-22-4000-3188",
    description: "Mock depot for inflatable boats and rescue electronics.",
  },
  {
    id: "mock-bs-1",
    name: "Blackstore Emergency Reserve Alpha",
    latOffset: 0.013,
    lngOffset: 0.014,
    type: "blackstore" as ResourceType,
    address: "Restricted Relief Storage Zone",
    phone: "+91-22-9999-1001",
    description: "Mock high-priority restricted stock for extreme scenarios.",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "Missing valid lat/lng" }, { status: 400 });
    }

    const radius = 6000;
    const overpassQuery = `
[out:json][timeout:20];
(
  node(around:${radius},${lat},${lng})[amenity=hospital];
  node(around:${radius},${lat},${lng})[amenity=clinic];
  node(around:${radius},${lat},${lng})[amenity=pharmacy];
  node(around:${radius},${lat},${lng})[amenity=police];
  node(around:${radius},${lat},${lng})[shop=pet];
  node(around:${radius},${lat},${lng})[amenity=veterinary];
  way(around:${radius},${lat},${lng})[amenity=hospital];
  way(around:${radius},${lat},${lng})[amenity=clinic];
  way(around:${radius},${lat},${lng})[amenity=pharmacy];
  way(around:${radius},${lat},${lng})[amenity=police];
  way(around:${radius},${lat},${lng})[shop=pet];
  way(around:${radius},${lat},${lng})[amenity=veterinary];
);
out center 60;
`;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: overpassQuery,
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ resources: [] }, { status: 200 });
    }

    const data = await response.json();
    const resources =
      (data.elements || [])
        .map((el: any) => {
          const tags = el.tags || {};
          const pointLat = el.lat ?? el.center?.lat;
          const pointLng = el.lon ?? el.center?.lon;
          if (!pointLat || !pointLng) return null;

          let type: ResourceType = "clinic";
          if (tags.amenity === "hospital") type = "hospital";
          else if (tags.amenity === "clinic") type = "clinic";
          else if (tags.amenity === "pharmacy") type = "pharmacy";
          else if (tags.amenity === "police") type = "police";
          else if (tags.amenity === "veterinary" || tags.shop === "pet") type = "veterinary";

          return {
            id: `osm-${el.type}-${el.id}`,
            name: tags.name || tags.brand || tags.operator || "Emergency Resource",
            lat: pointLat,
            lng: pointLng,
            type,
            address: [tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", "),
            phone: tags.phone || tags["contact:phone"] || "N/A",
            description:
              type === "hospital"
                ? "Nearby hospital emergency support."
                : type === "police"
                ? "Nearby police response point."
                : type === "veterinary"
                ? "Nearby veterinary / animal support."
                : "Nearby emergency support resource.",
          };
        })
        .filter(Boolean) ?? [];

    const unique = Array.from(new Map(resources.map((r: any) => [r.id, r])).values());
    const withMock = [
      ...CURATED_MUMBAI_RESOURCES,
      ...unique,
      ...MOCK_SPECIAL_RESOURCES.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        lat: lat + r.latOffset,
        lng: lng + r.lngOffset,
        address: r.address,
        phone: r.phone,
        description: r.description,
      })),
    ];

    return NextResponse.json({ resources: withMock }, { status: 200 });
  } catch (error) {
    console.error("Nearby resources error:", error);
    return NextResponse.json({ resources: [] }, { status: 200 });
  }
}
