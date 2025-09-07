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
  return rawAddress.trim();
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
    const searchResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(mainAddress)}`,
      { headers: { "User-Agent": "AddressChecker/1.0 bishtnishant007@gmail.com" } }
    );
    const searchData = await searchResponse.json();
  
    if (searchData.length > 0) {
      const result = searchData[0];
      const detailsResponse = await fetch(
        `https://nominatim.openstreetmap.org/details.php?place_id=${result.place_id}&format=json`,
        { headers: { "User-Agent": "AddressChecker/1.0 (your-email@example.com)" } }
      );
      const detailsData = await detailsResponse.json();
      const osmPostcode =
        detailsData.address?.postcode || result.address?.postcode;
  
      if (osmPostcode) {
        if (osmPostcode === pincode) {
          return res.json({
            valid: true,
            source: "OSM",
            display_name: result.display_name,
            location: { lat: result.lat, lon: result.lon },
            fullAddress: `${mainAddress}, ${pincode}`
          });
        } else {
          return res.json({
            valid: false,
            reason: `Pincode mismatch. OSM returned ${osmPostcode}, but user entered ${pincode}`,
            fullAddress: `${mainAddress}, ${pincode}`
          });
        }
      } else {
        return res.json({
          valid: true, 
          source: "OSM",
          note: "Address found but pincode could not be verified",
          display_name: result.display_name,
          location: { lat: result.lat, lon: result.lon },
          fullAddress: `${mainAddress}, ${pincode}`
        });
      }
    } else {
      return res.json({
        valid: false,
        reason: "Address not found in dataset or OSM",
        fullAddress: `${mainAddress}, ${pincode}`
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ valid: false, reason: "Server error" });
  }
  
  
});

app.listen(5000,()=> console.log("server is running"));
