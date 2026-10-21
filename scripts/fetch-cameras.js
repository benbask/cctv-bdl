/**
 * Ambil daftar kamera dari API Seribu Wajah (Diskominfo Kota Bandar Lampung)
 * dan simpan sebagai snapshot statis ke cameras.json.
 *
 * API-nya tidak mengirim header Access-Control-Allow-Origin pada response GET,
 * jadi browser tidak bisa memanggilnya langsung dari domain lain. Karena itu
 * datanya dibekukan di sini lalu dimuat same-origin oleh index.html.
 *
 * Jalankan: node scripts/fetch-cameras.js
 */

const fs = require("fs");
const path = require("path");

const API_URL = "https://api-newseribuwajah.bandarlampungkota.go.id/cctvs";
const API_KEY = "ParkirIlegalDetectKey2026";
const OUT = path.join(__dirname, "..", "cameras.json");

async function main() {
  const res = await fetch(API_URL, { headers: { "x-api-key": API_KEY } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const raw = await res.json();
  if (!Array.isArray(raw)) throw new Error("Format response tidak dikenali");

  const cameras = raw
    .filter((c) => !c.isHidden)
    .map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      address: c.address || "",
      status: c.status || "unknown",
      latitude: Number(c.latitude),
      longitude: Number(c.longitude),
      kelurahan: c.kelurahan && c.kelurahan.name ? c.kelurahan.name : "",
      kecamatan:
        c.kelurahan && c.kelurahan.kecamatan ? c.kelurahan.kecamatan.name : ""
    }))
    .filter((c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));

  const payload = {
    source: "https://seribuwajah.bandarlampungkota.go.id",
    updatedAt: new Date().toISOString(),
    count: cameras.length,
    cameras
  };

  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`Tersimpan ${cameras.length} kamera -> ${OUT}`);
}

main().catch((err) => {
  console.error("Gagal:", err.message);
  process.exit(1);
});
