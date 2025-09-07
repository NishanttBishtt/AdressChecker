import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());
const dataset = [
  { pincode: "110001", address: "Connaught Place, New Delhi" },
  { pincode: "201010", address: "Ramprastha Greens, Vaishali" },
  { pincode: "110002", address: "Janpath Market, New Delhi" }
];
function cleanAddress(rawAddress) {
  return rawAddress.trim().replace(/\s+/g, " ");
}
app.post("/api/validate-address", async (req, res) => {
  let { mainAddress, pincode } = req.body;

  if (!mainAddress || !pincode) {
    return res.json({ valid: false, reason: "Address or pincode missing" });
  }

  mainAddress = cleanAddress(mainAddress);
  pincode = pincode.trim();
  const found = dataset.find(
    (entry) =>
      entry.pincode === pincode &&
      entry.address.toLowerCase() === mainAddress.toLowerCase()
  );

  if (found) {
    return res.json({ valid: true, source: "dataset", fullAddress: `${mainAddress}, ${pincode}` });
  }
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(mainAddress + ", " + pincode)}`
    );
    const data = await response.json();

    if (data.length > 0) {
      return res.json({
        valid: true,
        source: "OSM",
        display_name: data[0].display_name,
        location: { lat: data[0].lat, lon: data[0].lon },
        fullAddress: `${mainAddress}, ${pincode}`
      });
    } else {
      return res.json({ valid: false, reason: "Address not found in dataset or OSM", fullAddress: `${mainAddress}, ${pincode}` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ valid: false, reason: "Server error" });
  }
});

app.listen(5000,()=> console.log("server is running"));
