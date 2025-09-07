import React from 'react'
import { useState } from "react";
import "leaflet/dist/leaflet.css";

function Checker() {
    const [houseDetails, setHouseDetails] = useState(""); 
    const [mainAddress, setMainAddress] = useState(""); 
    const [pincode, setPincode] = useState(""); 
    const [result, setResult] = useState(null);
  
    const validateAddress = async () => {
      setResult(null);
      try {
        const response = await fetch("http://localhost:5000/api/validate-address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mainAddress, pincode }),
        });
  
        const data = await response.json();

        if (data.valid) {
          data.fullAddress = `${houseDetails}, ${mainAddress}, ${pincode}`;
        } else {
          data.fullAddress = `${houseDetails}, ${mainAddress}, ${pincode}`;
        }
  
        setResult(data);
      } catch (error) {
        setResult({ valid: false, reason: "Server error" });
      }
    };
  
    return (
      <div style={{ maxWidth: 500, margin: "50px auto" }}>
        <h2>Enter address</h2>
  
        <label>House / Flat No. & Floor:</label>
        <input
          type="text"
          value={houseDetails}
          onChange={(e) => setHouseDetails(e.target.value)}
          placeholder="House number & floor"
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <label>Main Address:</label>
        <input
          type="text"
          value={mainAddress}
          onChange={(e) => setMainAddress(e.target.value)}
          placeholder="enter full adress"
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <label>Pincode:</label>
        <input
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          placeholder="enter pincode"
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <button onClick={validateAddress}>submit</button>
        {result && (
          <div style={{ marginTop: "20px" }}>
            {result.valid ? (
              <div>
                <h4>Address Found!</h4>
              </div>) : (
                <div>
                 <h4>Address not found</h4>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
export default Checker
