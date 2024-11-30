import React, { useEffect, useState } from 'react';
import Connection from './Connection.jsx';  // Import the Connection component
import { Modal, Button } from 'react-bootstrap';  // Import Bootstrap components

function Connections() {
  const [ips, setIps] = useState([]);  // Store the IPs
  const [selectedIp, setSelectedIp] = useState(null);  // Track the selected IP for the connection detail view
  const [showModal, setShowModal] = useState(false);  // Track modal visibility
  const [ws, setWs] = useState(null);  // WebSocket instance

  // Fetch IP data when the component mounts
  useEffect(() => {
    // Fetch IP data from the JSON file
    window.electron.getIpData()
      .then((data) => {
        setIps(data);  // Set the IP data in state
      })
      .catch((error) => {
        console.error('Error fetching IP data:', error);
      });

    // Open WebSocket connection to localhost:8080
    const socket = new WebSocket('ws://192.168.1.106:8080');

    socket.onopen = () => {
      console.log('WebSocket connected');
      socket.send(JSON.stringify({ command: 'concheck' }));  // Send concheck command
      console.log("concheck sent")
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.ip) {
          setIps((prevIps) => [...prevIps, data]);  // Append new data to IPs array

          // Append valid response to the JSON file
          window.electron.appendJsonData(data)
            .then((response) => {
              if (response.success) {
                console.log('Data appended successfully to JSON file');
              } else {
                console.error('Failed to append data to JSON file:', response.error);
              }
            })
            .catch((error) => console.error('Error appending JSON data:', error));
        }
      } catch (error) {
        console.error('Invalid WebSocket message format:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(socket);

    // Clean up WebSocket on component unmount
    return () => {
      socket.close();
    };
  }, []);  // Empty dependency array ensures this runs only once on component mount

  // Handle card click to show IP details in modal
  const handleCardClick = (ipInfo) => {
    setSelectedIp(ipInfo);  // Set the selected IP info
    setShowModal(true);  // Show the modal
  };

  // Close the modal
  const handleCloseModal = () => {
    setShowModal(false);  // Hide the modal
    setSelectedIp(null);  // Clear the selected IP info
  };

  return (
    <div className="container-fluid">
      <header className="text-center my-5">
        <h2 className="display-4">Active Connections</h2>
        <p className="lead text-muted">Detected IP addresses with active connections</p>
      </header>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {ips.length > 0 ? (
          ips.map((ipInfo, index) => (
            <div className="col" key={index}>
              <div
                className="card h-100 text-center shadow-sm rounded-lg cursor-pointer"
                onClick={() => handleCardClick(ipInfo)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <h5 className="card-title">{ipInfo.ip}</h5>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col">
            <div className="card text-center">
              <div className="card-body">
                <p className="text-muted">No IP data available.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for displaying the Connection component */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Connection Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Render the Connection component if an IP is selected */}
          {selectedIp && <Connection ip={selectedIp.ip} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Connections;
