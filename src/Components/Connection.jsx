import React, { useEffect, useState } from 'react';
import { Container, Card } from 'react-bootstrap';
import MapChart from './MapChart.jsx'; // Import MapChart component

function Connection({ ip }) {
  const [ipData, setIpData] = useState(null);

  // Fetch IP data when the component mounts or when `ip` changes
  useEffect(() => {
    if (ip) {
      window.electron.getIpData(ip)  // Call the Electron function to fetch data for the specific IP
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setIpData(data[0]);  // Use the first element of the array if it's an array
          } else {
            setIpData(null);  // Handle case where no valid data is returned
          }
        })
        .catch((error) => {
          console.error('Error fetching IP data:', error);
          setIpData(null);  // Handle error by setting ipData to null
        });
    }
  }, [ip]); // Effect depends on the `ip` prop

  if (!ipData) return <p className="text-center">Loading IP details...</p>;

  // Prepare data for MapChart based on IP's location
  const mapData = [{
    ip: ipData.ip,
    loc: ipData.loc
  }];

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      {/* Center the content vertically and horizontally */}
      <div className="w-100">
        
        {/* Map Section */}
        <Card className="mb-2 shadow-lg">
          <Card.Body>
            <MapChart data={mapData} />
          </Card.Body>
        </Card>

        {/* IP Details Section */}
        <Card className="shadow-lg">
          <Card.Body>
            <h1 className="display-4 text-center mb-4">{ipData.ip}</h1>
            <p className="text-muted text-center">{ipData.hostname || "No hostname available"}</p>
            <hr />
            <div className="text-center mb-3">
              <h5 className="mt-2">
                {ipData.country_name} {ipData.country_flag?.emoji}
              </h5>
              <p className="text-muted">
                {ipData.continent?.name} ({ipData.continent?.code})
              </p>
            </div>
            <div className="text-center">
              <p><strong>Location:</strong> {ipData.city}, {ipData.region}, {ipData.country}</p>
              <p><strong>Coordinates:</strong> {ipData.latitude}, {ipData.longitude}</p>
              <p><strong>Organization:</strong> {ipData.org}</p>
              <p><strong>Timezone:</strong> {ipData.timezone}</p>
              <p><strong>Postal Code:</strong> {ipData.postal}</p>
              <p><strong>Currency:</strong> {ipData.country_currency?.code} ({ipData.country_currency?.symbol})</p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Connection;
