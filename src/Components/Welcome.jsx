import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Assuming you have a custom CSS file for full-frame styling.

const countryNames = [
  "USA",
  "Germany",
  "USSR",
  "Great Britain",
  "Japan",
  "China",
  "Italy",
  "France",
  "Sweden",
  "Israel",
];

function Welcome() {
  const [activeCountry, setActiveCountry] = useState("USSR");
  const [vehicles, setVehicles] = useState([]); // State to store vehicles data for the selected country
  const [vehiclesData, setVehiclesData] = useState(null); // State to store the entire vehicles data for debugging
  const [missions, setMissions] = useState([]); // State to store user missions
  const [selectedMission, setSelectedMission] = useState(""); // State to store the selected mission
  const [selectedVehicleWeapons, setSelectedVehicleWeapons] = useState(""); // State to store selected vehicle's weapons
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility
  const [selectedVehicle, setSelectedVehicle] = useState(null); // State to store selected vehicle data
  const [showStartPrompt, setShowStartPrompt] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [enemies, setEnemies] = useState([]);
  const [missionDetails, setMissionDetails] = useState(null); // Store mission details

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMissionDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const saveMissionChanges = async (updatedMissionDetails) => {
    console.log("Updated mission details:", updatedMissionDetails);
    if (!updatedMissionDetails) {
      console.error("Mission details don't exist");
      return;
    } else {
      console.log("Mission details exist");
    }
    setMissionDetails(updatedMissionDetails); // Update state with new details
  
    try {
      if (updatedMissionDetails === undefined) {
        console.error("Updated mission details are undefined");
        return;
      }
      console.log("they still exist at this point",updatedMissionDetails);
      const response = await window.electron.savemissiondetails(selectedMission,updatedMissionDetails,selectedMissionData.filePath);
      if (response.success) {
        console.log("Mission details saved successfully");
      } else {
        console.error("Failed to save mission details:", response.message);
      }
    } catch (error) {
      console.error("Error saving mission details:", error);
    }
  };


  const fetchEnemies = async (selectedMission) => {
    try {
      const tankModels = await window.electron.fetchEnemies(selectedMission)
      console.log("Tank Models:", tankModels);
      setEnemies(tankModels)
    } catch (error) {
      console.error("Error fetching tank models:", error.message);
    }
  };

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };


  // Function to fetch vehicles when the active country changes
  const fetchVehicles = async (country) => {
    //console.log("Selected country:", country);
    try {
      const fetchedVehiclesData = await window.electron.fetch_vehicles();
      setVehiclesData(fetchedVehiclesData); // Store entire fetched data for debugging
      const countryVehicles = fetchedVehiclesData[country] || [];
      setVehicles(countryVehicles);
    } catch (error) {
      //console.error("Error fetching vehicles:", error);
    }
  };

  // Function to fetch missions
  const fetchMissions = async () => {
    try {
      const fetchedMissions = await window.electron.fetch_missions();
      setMissions(fetchedMissions);
    } catch (error) {
      //console.error("Error fetching missions:", error);
    }
  };

  // Fetch vehicles when the component mounts or activeCountry changes
  useEffect(() => {
    fetchVehicles(activeCountry);
  }, [activeCountry]);

  // Fetch enemies when the component mounts or activeCountry changes
  useEffect(() => {
    fetchEnemies(selectedMission);
  }, [selectedMission]);

  // Fetch missions on component mount
  useEffect(() => {
    fetchMissions();
  }, []);

  const handleMissionChange = async (e) => {
    const selectedMissionName = e.target.value;
    setSelectedMission(selectedMissionName);
    setShowStartPrompt(false);
  
    // Find the selected mission data
    const missionData = missions.find(
      (mission) => mission.missionData?.mission?.locName === selectedMissionName
    );
    console.log(missionData)
    if (missionData) {
      // Find the vehicle with the name "You"
      const playerVehicle = missionData.tankModels?.find(
        (vehicle) => vehicle.name === "\"You\"" || vehicle.name === "You"
      );
      console.log(playerVehicle)
      if (playerVehicle) {
        try {
          // Update the selected vehicle state
          setSelectedVehicle(playerVehicle);
          console.log(playerVehicle)
          setSelectedVehicleWeapons(playerVehicle.weapons);

          //set mission details state

            setMissionDetails({
            locName: typeof missionData.missionData.mission.locName === 'string' ? missionData.missionData.mission.locName : JSON.parse(missionData.missionData.mission.locName),
            type: typeof missionData.missionData.mission.type === 'string' ? missionData.missionData.mission.type : JSON.parse(missionData.missionData.mission.type),
            level: typeof missionData.missionData.mission.level === 'string' ? missionData.missionData.mission.level : JSON.parse(missionData.missionData.mission.level),
            chapter: typeof missionData.missionData.mission.chapter === 'string' ? missionData.missionData.mission.chapter : JSON.parse(missionData.missionData.mission.chapter),
            environment: typeof missionData.missionData.mission.environment === 'string' ? missionData.missionData.mission.environment : JSON.parse(missionData.missionData.mission.environment),
            weather: typeof missionData.missionData.mission.weather === 'string' ? missionData.missionData.mission.weather : JSON.parse(missionData.missionData.mission.weather),
            locDesc: typeof missionData.missionData.mission.locDesc === 'string' ? missionData.missionData.mission.locDesc : JSON.parse(missionData.missionData.mission.locDesc),
            campaign: typeof missionData.missionData.mission.campaign === 'string' ? missionData.missionData.mission.campaign : JSON.parse(missionData.missionData.mission.campaign),
            });
          console.log(environment,weather)
          // Update the `last_selected` in config.json
          const response = await window.electron.updateLastSelected(playerVehicle.weapons);
          const response2 = await window.electron.updateVehicleBlkPath((playerVehicle.weapons).replace("_default",""));
          // Update the `last_selected` in config.json
          const response3 = await window.electron.updateLastSelected(playerVehicle.weapons);
          if (response.success) {
            //console.log(response.message); // Log success message
          } else {
            //console.error(response.message); // Log error message
          }
        } catch (error) {
          //console.error("Error updating last_selected:", error);
        }
      } else {
        //console.error("No vehicle with the name 'You' found in the mission data.");
      }
    } else {
      //console.error("Selected mission data not found.");
    }
  };

  // Find the selected mission by its locName
  const selectedMissionData = missions.find(
    (mission) => mission.missionData?.mission?.locName === selectedMission
  );

  // Find the selected vehicle (name = "You") from the mission data
  useEffect(() => {
    if (selectedMissionData) {
      const selectedVehicle = selectedMissionData.tankModels?.find(
        (model) => model.name === "\"You\""
      );
      if (selectedVehicle) {
        setSelectedVehicleWeapons(selectedVehicle.weapons); // Set the weapons for editing
        setSelectedVehicle(selectedVehicle); // Store selected vehicle for further actions
      }
    }
  }, [selectedMissionData]);

  // Handle modal open
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Handle modal close
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle modal open
  const openeditModal = () => {
    setIsEditModalOpen(true);
  };

  // Handle modal close
  const closeeditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleVehicleSelect = async (vehicle, mission) => {
  try {
    setSelectedVehicleWeapons(vehicle.vehicle); // Update weapons state

    //console.log("before icpmain: ", vehicle); // Log the entire vehicle object
    //console.log("before icpmain: ", mission);

    // Step 1: Update vehicle in configuration
    const responseVehicle = await window.electron.updateVehicle(vehicle, mission);

    if (responseVehicle.success) {
      //console.log(responseVehicle.message); // Success message for vehicle update
    } else {
      //console.log(responseVehicle.message); // Error message for vehicle update
      return; // Stop execution if vehicle update fails
    }

    // Step 2: Update the vehicle BLK file path
    ////console.log(vehicle.vehicle)
    const responseVehicleblk = await window.electron.updateVehicleBlkPath(vehicle.vehicle);

    if (responseVehicleblk.success) {
      //console.log(responseVehicleblk.message); // Success message for BLK path update
    } else {
      //console.log(responseVehicleblk.message); // Error message for BLK path update
      return; // Stop execution if BLK path update fails
    }

    // Step 3: Fetch lastSelected from config
    const { success: lastSelectedSuccess, lastSelected, message: lastSelectedMessage } =
      await window.electron.getLastSelected();

    if (!lastSelectedSuccess) {
      //console.error(lastSelectedMessage);
      return; // Stop execution if fetching lastSelected fails
    }

    // Step 4: Update the mission file
    const selectedVehicleId = vehicle.ammo_type.name;
    //console.log("ammo type: ",selectedVehicleId)
    const responseMission = await window.electron.updateMissionFile(mission, selectedVehicleId, lastSelected);
    const responseLastSelected = await window.electron.updateLastSelected(selectedVehicleId);
    if (responseMission.success) {
      //console.log(responseMission.message); // Success message for mission file update
    } else {
      //console.log(responseMission.message); // Error message for mission file update
    }
  } catch (error) {
    //console.error("Error while selecting vehicle:", error);
  }

  closeModal(); // Close modal at the end
};


return (
  <div className="app-container d-flex flex-column min-vh-100">
    
    {/* Title Bar */}
    <header className="bg-dark text-white text-center py-3 header">
      <h1 className="display-6">War Thunder Test Driver</h1>
    </header>

    {/* Mission Selector Section */}
    <div className="py-2 border-bottom">
      <div className="dropdown me-3">
        <select
          className="form-select"
          value={selectedMission}
          onChange={handleMissionChange}
        >
          <option value="" disabled>
            Select Mission
          </option>
          {missions.map((mission, index) => (
            <option key={index} value={mission.missionData.mission.locName}>
              {typeof mission.missionData.mission.locName === 'string'
                ? mission.missionData.mission.locName.replace('"', '').replace('"', '')
                : JSON.parse(mission.missionData.mission.locName).replace('"', '')}
            </option>
          ))}
        </select>
      </div>
    </div>
    {/* Mission Details Section */}
    <div className="container my-4 mission-info">
      {selectedMissionData && (
        <>
          <div className="text-white mb-4">
            <h1>Mission Manager</h1>
            <h5>Mission: {typeof selectedMissionData.missionData.mission.locName === 'string' ? selectedMissionData.missionData.mission.locName : JSON.parse(selectedMissionData.missionData.mission.locName)}</h5>
            <h5>Mission Path: {selectedMissionData.filePath}</h5>
          </div>
          <div className="row g-4">
            {/* Mission Details Cards */}
            <div className="col-md-6">
              <div className="card bg-dark text-white h-100">
                <div className="card-body">
                  <h6 className="card-title"></h6>
                  <p><strong>Type:</strong> {typeof selectedMissionData.missionData.mission.type === 'string' ? selectedMissionData.missionData.mission.type.replace('"', '').replace('"', '') : JSON.parse(selectedMissionData.missionData.mission.type.replace('"', '').replace('"', ''))}</p>
                  <p><strong>Level:</strong> {typeof selectedMissionData.missionData.mission.level === 'string' ? selectedMissionData.missionData.mission.level : JSON.parse(selectedMissionData.missionData.mission.level)}</p>
                  <p><strong>Environment:</strong> {typeof selectedMissionData.missionData.mission.environment === 'string' ? selectedMissionData.missionData.mission.environment : JSON.parse(selectedMissionData.missionData.mission.environment)}</p>
                  <p><strong>Weather:</strong> {typeof selectedMissionData.missionData.mission.weather === 'string' ? selectedMissionData.missionData.mission.weather : JSON.parse(selectedMissionData.missionData.mission.weather)}</p>
                  <p><strong>Description:</strong> {typeof selectedMissionData.missionData.mission.locDesc === 'string' ? selectedMissionData.missionData.mission.locDesc.replace('"', '').replace('"', '') : JSON.parse(selectedMissionData.missionData.mission.locDesc.replace('"', '').replace('"', ''))}</p>
                  <p><strong>Campaign:</strong> {typeof selectedMissionData.missionData.mission.campaign === 'string' ? selectedMissionData.missionData.mission.campaign : JSON.parse(selectedMissionData.missionData.mission.campaign)}</p>
                </div>
                <div className="card-footer"> 
                <div className="text-center">
                   <button className="btn btn-outline-secondary btn-lg px-4" onClick={openEditModal}>  Edit Mission</button>
                  </div>
                  </div>
              </div>
            </div>
            <div className="col-md-6">
              {selectedVehicle && (
                <div className="card bg-dark text-white h-100">
                  <div className="card-body">
                    <h5>Selected Vehicle (You):</h5>
                    <p><strong>Name:</strong> {selectedVehicle.vehicle}</p>
                    <p><strong>Weapons:</strong> {selectedVehicleWeapons}</p>
                     <div className="tank-image">
                        {/* <img src="https://static.encyclopedia.warthunder.com/images/germ_pzkpfw_35t.png" alt="test"/> */}
                     </div>
                    <div className="text-center">
                      <button
                        className="btn btn-outline-secondary btn-lg px-4"
                        onClick={openModal}
                      >
                        Edit Vehicle
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="container" style={{padding:50}}>
            <div className="card bg-dark text-white h-100">
              <div className="text-white mb-4">
                <h1 style={{padding:10}}>Enemies</h1>
              </div>
              <div className="card-body enemy-display">
                {/* Display enemies */}
                <div className="row mt-4">
                  {enemies.length > 0 ? (
                    enemies
                      .filter((enemy) => JSON.parse(enemy.name) !== 'You')
                      .map((enemy, index) => (
                      <div className="col-sm-12 col-md-6 col-lg-4 mb-3" key={index}>
                        {/* Card for each enemy */}
                        <div className="card">
                          <div className="card-body">
                          <h5 className="card-title">{typeof enemy.name === 'string' ? enemy.name : JSON.parse(enemy.name)}</h5>
                            <p className="card-text">
                              <strong>Class:</strong> {typeof enemy.unit_class === 'string' ? enemy.unit_class : JSON.parse(enemy.unit_class)}
                            </p>
                            <p className="card-text">
                              <strong>Weapons:</strong> {typeof enemy.weapons === 'string' ? enemy.weapons : JSON.parse(enemy.weapons)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No enemies to display for this mission.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>

    {/* Main Content Section */}
    <main className="flex-grow-1 main">
      {showStartPrompt && (
        <div className="start-screen d-flex justify-content-center align-items-center">
          <h1 className="display-1 text-white">SELECT A MISSION TO BEGIN</h1>
        </div>
      )}
    </main>

    {/* Footer */}
    <footer className="bg-dark text-white text-center py-3">
      <p className="mb-0">&copy; 2024 War Thunder Test Driver. All rights reserved.</p>
    </footer>


    <div>

      {isEditModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          aria-hidden="false"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Mission Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeEditModal}
                  aria-label="Close"
                >
                  X
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="missionName" className="form-label">
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="missionName"
                      name="name"
                      placeholder={missionDetails.locName || "Enter mission name"}
                      defaultValue={missionDetails.locName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="missionEnvironment" className="form-label">
                      Environment
                    </label>
                    <select
                      className="form-select"
                      id="missionEnvironment"
                      name="Environment"
                      onChange={handleInputChange}
                    >
                      <option value="just not needed here">{selectedMissionData.missionData.mission.environment}</option>
                      <option value="Day">Day</option>
                      <option value="noon">Noon</option>
                      <option value="morning">Morning</option>
                      <option value="evening">Evening</option>
                      <option value="night">Night</option>
                      <option value="dusk">Dusk</option>
                      <option value="dawn">Dawn</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="missionWeather" className="form-label">
                      Weather
                    </label>
                    <select
                      type="text"
                      className="form-control"
                      id="missionWeathert"
                      name="Weather"
                      onChange={handleInputChange}>
                        <option value="just not needed here">{selectedMissionData.missionData.mission.weather}</option>
                        <option value="clear">clear</option>
                        <option value="good">good</option>
                        <option value="hazy">hazy</option>
                        <option value="cloudy">cloudy</option>
                        <option value="cloudy_windy">cloudy_windy</option>
                        <option value="thin_clouds">thin_clouds</option>
                        <option value="thin_clouds_storm">thin_clouds_storm</option>
                        <option value="poor">poor</option>
                        <option value="mist">mist</option>
                        <option value="overcast">overcast</option>
                        <option value="blind">blind</option>
                        <option value="rain">rain</option>
                        <option value="storm">storm</option>
                        <option value="thunder">thunder</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="missionDescription" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="missionDescription"
                      name="description"
                      rows="3"
                      placeholder={
                        missionDetails.locDesc || "Enter description"
                      }
                      defaultValue={typeof missionDetails.locDesc === 'string' ? missionDetails.locDesc.replace('"', '').replace('"', '') : JSON.parse(missionDetails.locDesc.replace('"', '').replace('"', ''))}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="missionCampaign" className="form-label">
                      Campaign
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="missionCampaign"
                      name="campaign"
                      placeholder={missionDetails.campaign || "Enter campaign"}
                      defaultValue={missionDetails.campaign}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="missionCampaign" className="form-label">
                    Chapter
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="missionChapter"
                      name="chapter"
                      placeholder={missionDetails.chapter || "Enter campaign"}
                      defaultValue={missionDetails.chapter}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    saveMissionChanges(missionDetails);
                    closeEditModal();
                    }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    

    {/* Modal for Vehicle Selector */}
    {isModalOpen && (
      <div className="modal fade show" style={{ display: "block" }} aria-hidden="false">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Select Vehicle</h5>
              <button type="button" className="btn-close" onClick={closeModal}>
                X
              </button>
            </div>

            {/* Tabs Section for Country Selector */}
            <div className="modal-body">
              <div className="bg-light border-bottom mb-4">
                <div className="container py-2">
                  <ul className="nav nav-tabs justify-content-center">
                    {countryNames.map((country) => (
                      <li className="nav-item" key={country}>
                        <button
                          className={`nav-link ${activeCountry === country ? "active" : ""}`}
                          onClick={() => setActiveCountry(country)}
                          style={{ cursor: "pointer" }}
                        >
                          {country}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Vehicle Buttons Grid */}
              <div className="row row-cols-1 row-cols-md-3 g-4">
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle, index) => (
                    <div className="col" key={index}>
                      <button
                        className="btn btn-primary w-100"
                        style={{
                          fontSize: "0.8rem",
                          padding: "20px",
                          textAlign: "center",
                        }}
                        onClick={() => handleVehicleSelect(vehicle, selectedMission)}
                      >
                        {vehicle.vehicle}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center w-100">No vehicles available for this country.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

export default Welcome;
