const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');  // Import the fs module
const { console } = require('node:inspector');
const os = require('os');
const {parseFile} = require('./parser/parse')
var nodeConsole = require('console');
const {downloadFile} = require('./downloader')
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      enableRemoteModule: false, // Ensure remote module is disabled
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: './public/icons/png/image.png',
    title: "Warthunder Test Drive Gui"
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// Function to fetch game type and appropriate install path from the config
const get_game_install_path = () => {
  const appDataPath = path.join(app.getPath('userData'), 'config.json');
  try {
    const configData = fs.readFileSync(appDataPath, 'utf-8');
    const config = JSON.parse(configData);

    if (config.game_type === 'warthunder') {
      return config.warthunder_install_path; // Return War Thunder install path
    } else if (config.game_type === 'steam') {
      return config.steam_install_path; // Return Steam install path
    } else {
      //myConsole.error('Unknown game type:', config.game_type);
      return null;
    }
  } catch (err) {
    //myConsole.error('Error reading config file:', err);
    return null;
  }
};

// Function to check if config file exists
const check_config_file = () => {
  const appDataPath = path.join(app.getPath('userData'), 'config.json');
  return fs.existsSync(appDataPath);
};

// Function to create the config file with default values
const set_config = () => {
  const appDataPath = path.join(app.getPath('userData'), 'config.json');
  const defaultConfig = {
    "game_type": "",
    "warthunder_install_path": "",
    "steam_install_path": "",
    "has_run": false,
  };

  try {
    fs.writeFileSync(appDataPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
    //myConsole.log('Config file created with new layout.');
  } catch (err) {
    //myConsole.error('Error creating config file:', err);
  }
};

// Function to check if the War Thunder installation path exists and return path
const check_warthunder_install_path = () => {
  const platform = os.platform(); // Get the operating system platform
  const username = os.userInfo().username; // Get the current username
  let wtPath;

  // Log the OS and username for debugging
  //myConsole.log('Current OS:', platform);
  //myConsole.log('Current username:', username);

  if (platform === 'win32') {
    // Windows-specific War Thunder path
    wtPath = path.join('C:', 'Users', username, 'AppData', 'Local', 'WarThunder');
    //myConsole.log('Checking WarThunder path (Windows):', wtPath);
  } else if (platform === 'darwin') {
    // macOS-specific War Thunder path
    wtPath = '/Applications/WarThunderLauncher.app/Contents/WarThunder.app/Contents/Resources/game';
    //myConsole.log('Checking WarThunder path (macOS):', wtPath);
  } else if (platform === 'linux') {
    // Unix/Linux-specific War Thunder path (if applicable)
    wtPath = '/usr/share/games/warThunder';
    //myConsole.log('Checking WarThunder path (Unix/Linux):', wtPath);
  } else {
    //myConsole.log('Unsupported operating system. Skipping WarThunder path check.');
    return { success: false, path: null };
  }

  // Check if the directory exists
  try {
    if (fs.existsSync(wtPath)) {
      //myConsole.log('WarThunder path exists!');
      return { success: true, path: wtPath }; // Return success and path if it exists
    } else {
      //myConsole.log('WarThunder path does not exist.');
      return { success: false, path: null }; // Return false and null if not found
    }
  } catch (err) {
    //myConsole.error('Error checking WarThunder path:', err);
    return { success: false, path: null };
  }
};

// Function to recursively find all .blk files in the UserMissions directory and its subdirectories
function findFilesByType(directory, fileType) {
  let results = [];

  // Function to read through the directory and find files
  function readDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      // If it's a directory, recurse into it
      if (stat.isDirectory()) {
        readDirectory(filePath);
      } else {
        // If it's a file and matches the extension, add it to results
        if (path.extname(file).toLowerCase() === fileType.toLowerCase()) {
          results.push(filePath);
        }
      }
    });
  }

  // Start the search from the specified directory
  readDirectory(directory);
  return results;
}

// Function to update the config with the found .blk file paths
const update_user_missions_in_config = async (blkFiles) => {
  const appDataPath = path.join(app.getPath('userData'), 'config.json');

  try {
    // Read the existing config file
    const configData = fs.readFileSync(appDataPath, 'utf-8');
    const config = JSON.parse(configData);

    // Ensure the missions array exists in the config
    if (!Array.isArray(config.missions)) {
      config.missions = [];
    }

    // Process each .blk file and update the missions array
    for (const blkFile of blkFiles) {
      try {
        // Check if the mission's filePath already exists in the missions array
        const missionExists = config.missions.some(
          (mission) => mission.filePath === blkFile
        );

        if (!missionExists) {
          const parsedOutput = await parseFile(blkFile); // Run the parse.js function on the .blk file
          
          // Add the new mission to the missions array
          config.missions.push({
            filePath: blkFile,
            missionData: parsedOutput.missionData || {}, // Assuming parseFile outputs missionData
            tankModels: parsedOutput.tankModels || [],  // Assuming parseFile outputs tankModels
          });

          ////myConsole.log(`Parsed and added mission: ${blkFile}`);
        } else {
          ////myConsole.log(`Mission already exists, skipping: ${blkFile}`);
        }
      } catch (err) {
        //myConsole.error(`Error parsing .blk file: ${blkFile}`, err);
      }
    }

    // Write the updated config back to the file
    fs.writeFileSync(appDataPath, JSON.stringify(config, null, 2), 'utf-8');
    ////myConsole.log('Config updated with parsed missions.');
  } catch (err) {
    //myConsole.error('Error updating config file:', err);
  }
};


// Main startup function
const startup = () => {
  const appDataPath = path.join(app.getPath('userData'), 'config.json');
  const vehcilespath = path.join(app.getPath('userData'), 'vehicles.json');
  const parsepypath = path.join(app.getPath('userData'), 'parse.py');
  downloadFile("https://raw.githubusercontent.com/TheUnsocialEngineer/WT-TEST-DRIVE-ASSETS/refs/heads/main/vehicles.json",vehcilespath)
  downloadFile("https://raw.githubusercontent.com/TheUnsocialEngineer/WT-TEST-DRIVE-ASSETS/refs/heads/main/parse.py",parsepypath)
  // Step 1: Check if config file exists
  if (check_config_file()) {
    //myConsole.log('Config file exists.');

    try {
      const configData = fs.readFileSync(appDataPath, 'utf-8');
      const config = JSON.parse(configData);

      // Step 2: Check has_run in the config
      if (!config.has_run) {
        ////myConsole.log('has_run is false. Updating to true...');

        // Step 3: Check if War Thunder path exists and get the path
        const { success, path: warthunderPath } = check_warthunder_install_path();

        if (success && warthunderPath) {
          ////myConsole.log('War Thunder installation found at:', warthunderPath);

          // Update the game_type and warthunder_install_path in the config
          config.game_type = 'warthunder';
          config.warthunder_install_path = warthunderPath;
          const  vehicleblkpath= path.join(warthunderPath,'content','pkg_local','gameData','units','tankmodels','userVehicles','us_m2a4.blk');
          config.vehicleblkpath=vehicleblkpath;
        } else {
          //myConsole.log('War Thunder installation not found.');
        }

        // Update has_run to true
        config.has_run = true;
        fs.writeFileSync(appDataPath, JSON.stringify(config, null, 2), 'utf-8');
      }
      // Step 4: Fetch and update missions (regardless of has_run value)
      //myConsole.log('Fetching and updating missions...');
      const installPath = get_game_install_path();
      if (installPath) {
        //myConsole.log('Game install path:', installPath);
        const blkFiles = findFilesByType(path.join(installPath, 'usermissions'), '.blk');
        if (blkFiles.length > 0) {
          update_user_missions_in_config(blkFiles); // Update config with blk file paths
        } else {
          //myConsole.log('No .blk files found.');
        }
      } else {
        //myConsole.log('No install path found.');
      }
    } catch (err) {
      //myConsole.error('Error reading config file:', err);
    }
  } else {
    // Step 5: Create the config file if it doesn't exist
    //myConsole.log('Config file does not exist. Creating...');
    set_config();
  }
};

// Call the startup function
startup();

// Handler for fetching vehicles
ipcMain.handle('fetch_vehicles', async () => {
  const appDataPath = path.join(app.getPath('userData'), 'vehicles.json');
  ////myConsole.log('Fetching vehicles from:', appDataPath); // Log the path for debugging

  try {
    // Read the vehicles.json file from the appData path
    const vehiclesData = fs.readFileSync(appDataPath, 'utf-8');
    
    // Parse the JSON data and return it
    const vehicles = JSON.parse(vehiclesData);
    ////myConsole.log('Fetched vehicles data:'); // Log the data for debugging
    return vehicles;
  } catch (err) {
    //myConsole.error('Error reading vehicles.json:', err);
    throw new Error(err);
  }
});

// Handler to fetch user missions from config.json
ipcMain.handle('fetch_user_missions', async () => {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  ////myConsole.log('Fetching user missions from:', configPath);

  try {
    // Read the config.json file
    const configData = fs.readFileSync(configPath, 'utf-8');

    // Parse the JSON data
    const config = JSON.parse(configData);

    // Ensure 'missions' exists and extract the necessary data
    if (config.missions && Array.isArray(config.missions)) {
      const missions = config.missions.map(mission => ({
        filePath: mission.filePath,
        missionData: mission.missionData,
        tankModels: mission.tankModels
      }));

      ////myConsole.log('User missions fetched successfully:', missions);
      return missions;
    } else {
      //myConsole.warn('No missions found in config.json');
      return [];
    }
  } catch (err) {
    //myConsole.error('Error reading user missions:', err);
    throw new Error('Failed to fetch user missions');
  }
});

ipcMain.handle("update_vehicle", async (event, vehicle, mission) => {
  ////myConsole.log("vehicle updater started");
  ////myConsole.log("vehicle:", vehicle); // Log the entire vehicle object
  ////myConsole.log("mission:", mission); // Log the mission name

  try {
    // Read and parse the config.json file
    const configFilePath = path.join(app.getPath('userData'), 'config.json');
    const config = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));
    ////myConsole.log("config: ", config);

    // Find the mission with the matching locName
    const missionData = config.missions.find((m) => m.missionData.mission.locName === mission);
    ////myConsole.log("mission data: ", missionData);

    if (missionData) {
      // Mission found, now find the corresponding tank model by name
      const tankModel = missionData.tankModels.find((tank) => tank.name === `"You"`);
      ////myConsole.log("tankModel: ", tankModel);

      if (tankModel) {
        // Update the weapons value of the tank model with the ammo_type name
        tankModel.weapons = vehicle.ammo_type.name;  // Use ammo_type.name directly

        // Save the updated config back to the JSON file
        fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));

        return { success: true, message: "Vehicle updated successfully" };
      } else {
        return { success: false, message: "Vehicle not found in mission" };
      }
    } else {
      return { success: false, message: "Mission not found" };
    }
  } catch (error) {
    ////myConsole.error("Error updating vehicle:", error);
    return { success: false, message: "Failed to update vehicle", error };
  }
});

ipcMain.handle("update_vehicle_blk_path", async (event, selectedVehicleId) => {
  try {
    // Path to config.json in userData
    const configFilePath = path.join(app.getPath("userData"), "config.json");

    // Load the config file
    const config = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));
    
    // Get the user_vehicle_path from the config
    const userVehiclePath = config["vehicleblkpath"];
    if (!userVehiclePath || !fs.existsSync(userVehiclePath)) {
      throw new Error("user_vehicle_path not set or file does not exist");
    }

    // Read the file content
    const fileData = fs.readFileSync(userVehiclePath, "utf-8").split("\n");

    // Iterate through the lines and update the include statement
    const updatedData = fileData.map((line) => {
      if (line.trim().startsWith("include")) {
        return `include "#/develop/gameBase/gameData/units/tankModels/${selectedVehicleId.replace('"',"").replace("\\","").replace("/","")}.blk"`;
      }
      return line;
    });

    // Write the updated content back to the file
    fs.writeFileSync(userVehiclePath, updatedData.join("\n"), "utf-8");

    //myConsole.log(`Updated user vehicle file: ${userVehiclePath}`);

    // Return success response
    return { success: true, message: "Vehicle .blk path updated successfully" };
  } catch (error) {
    //myConsole.error("Error updating user vehicle file:", error);
    return { success: false, message: "Failed to update vehicle .blk path", error: error.message };
  }
});

ipcMain.handle("update_mission_file", async (event, mission, selectedVehicleId, lastSelected) => {
  //myConsole.log(lastSelected.replace('"',""))
  //myConsole.log(selectedVehicleId.replace('"',""))
  try {
    // Fetch config file path
    const configFilePath = path.join(app.getPath("userData"), "config.json");
    const config = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));

    // Find the mission with the given locName
    const missionData = config.missions.find((m) => m.missionData.mission.locName === mission);

    if (!missionData) {
      return { success: false, message: "Mission not found in config" };
    }

    const missionFilePath = missionData.filePath;

    // Read the mission file
    const lines = fs.readFileSync(missionFilePath, "utf-8").split("\n");

    // Update the weapons field
    const updatedLines = lines.map((line) =>
      line.includes(`weapons:t=`)
        ? `    weapons:t="${selectedVehicleId.replace('"', "").replace('\\', "")}"`
        : line
    );

    // Write the updated content back to the file
    fs.writeFileSync(missionFilePath, updatedLines.join("\n"), "utf-8");

    console.log(`Updated mission file: ${missionFilePath}`);
    return { success: true, message: "Mission file updated successfully" };
  } catch (error) {
    console.error("Error updating mission file:", error);
    return { success: false, message: "Failed to update mission file", error: error.message };
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle("get_last_selected", async () => {
  try {
    const configFilePath = path.join(app.getPath("userData"), "config.json");
    const config = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));
    return { success: true, lastSelected: config.last_selected };
  } catch (error) {
    console.error("Error fetching lastSelected from config:", error);
    return { success: false, message: "Failed to fetch lastSelected", error: error.message };
  }
});

ipcMain.handle("update_last_selected", async (event, selectedVehicleId) => {
  try {
    // Get the path to the config file
    const configFilePath = path.join(app.getPath("userData"), "config.json");

    // Read and parse the config file
    const config = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));

    // Update the `lastSelected` field
    config.last_selected = selectedVehicleId;

    // Write the updated config back to the file
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), "utf-8");

    console.log(`Updated lastSelected to: ${selectedVehicleId}`);
    return { success: true, message: "lastSelected updated successfully" };
  } catch (error) {
    console.error("Error updating lastSelected:", error);
    return { success: false, message: "Failed to update lastSelected" };
  }
});



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
