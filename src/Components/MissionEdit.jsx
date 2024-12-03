import React from "react";

const MissionEditModal = ({
  show,
  onClose,
  missionDetails,
  onSave,
  handleInputChange,
}) => {
  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: "block" }} aria-hidden="false">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Mission Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
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
                  placeholder={missionDetails.name || "Enter mission name"}
                  defaultValue={missionDetails.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="missionEnvironment" className="form-label">
                  Environment
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="missionEnvironment"
                  name="environment"
                  placeholder={missionDetails.environment || "Enter environment"}
                  defaultValue={missionDetails.environment}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="missionWeather" className="form-label">
                  Weather
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="missionWeather"
                  name="weather"
                  placeholder={missionDetails.weather || "Enter weather"}
                  defaultValue={missionDetails.weather}
                  onChange={handleInputChange}
                />
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
                  placeholder={missionDetails.description || "Enter description"}
                  defaultValue={missionDetails.description}
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
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSave}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionEditModal;
