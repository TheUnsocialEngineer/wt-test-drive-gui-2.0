// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  fetch_vehicles: () => ipcRenderer.invoke('fetch_vehicles'),
  fetch_missions: () => ipcRenderer.invoke('fetch_user_missions'),
  appendJsonData: (newObject) => ipcRenderer.invoke('append-json-data', newObject),
  checkStartup: () => ipcRenderer.invoke('startup-check'),
  updateVehicle: (vehicle, mission) => ipcRenderer.invoke('update_vehicle', vehicle, mission),
  updateVehicleBlkPath: (selectedVehicleId) => ipcRenderer.invoke("update_vehicle_blk_path", selectedVehicleId),
  updateMissionFile: (mission, selectedVehicleId, lastSelected) =>ipcRenderer.invoke("update_mission_file", mission, selectedVehicleId, lastSelected),
  getLastSelected: () => ipcRenderer.invoke("get_last_selected"),
  updateLastSelected: (selectedVehicleId) => ipcRenderer.invoke("update_last_selected", selectedVehicleId),
  fetchEnemies:(selectedMission) => ipcRenderer.invoke("fetch_enemies",selectedMission),
  savemissiondetails:(updatedmissionDetails) => ipcRenderer.mission(update_mission_details,updatedmissionDetails)
});
