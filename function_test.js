const fs = require('fs');
const path = require('path');
const os = require('os');

// Simulate app.getPath('userData') by using a local path for testing
const getAppDataPath = () => path.join(__dirname, 'test_data');

// Function to check if the config file exists
const check_config_file = () => {
  const appDataPath = path.join(getAppDataPath(), 'config.json');
  return fs.existsSync(appDataPath);
};

// Function to create the config file with default values
const set_config = () => {
  const appDataPath = path.join(getAppDataPath(), 'config.json');
  const defaultConfig = {
    "game_type": "",
    "warthunder_install_path": "",
    "steam_install_path": "",
    "user_vehicle_path": "",
    "has_run": true,
    "custom_mission_path": "",
    "last_selected": "ussr_pantsyr_s1"
  };

  try {
    fs.mkdirSync(getAppDataPath(), { recursive: true });
    fs.writeFileSync(appDataPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
    console.log('Config file created.');
  } catch (err) {
    console.error('Error creating config file:', err);
  }
};

// Function to update a specific config value
const update_config = (key, value) => {
  const appDataPath = path.join(getAppDataPath(), 'config.json');

  try {
    const configData = fs.readFileSync(appDataPath, 'utf-8');
    const config = JSON.parse(configData);

    if (config.hasOwnProperty(key)) {
      config[key] = value;
      fs.writeFileSync(appDataPath, JSON.stringify(config, null, 2), 'utf-8');
      console.log(`Config updated: ${key} = ${value}`);
    } else {
      console.log(`Key "${key}" does not exist in the config.`);
    }
  } catch (err) {
    console.error('Error updating config file:', err);
  }
};

// Function to check if the War Thunder installation path exists and return path
const check_warthunder_install_path = () => {
  const username = os.userInfo().username;

  // Log the username and the constructed path for debugging
  console.log('Current username:', username);

  // Build the WarThunder path for the user
  const wtPath = path.join('C:', 'Users', username, 'AppData', 'Local', 'WarThunder');

  // Log the path being checked for debugging
  console.log('Checking WarThunder path:', wtPath);

  // Check if the directory exists
  try {
    if (fs.existsSync(wtPath)) {
      console.log('WarThunder path exists!');
      return { success: true, path: wtPath };  // Return success and path if it exists
    } else {
      console.log('WarThunder path does not exist.');
      return { success: false, path: null };  // Return false and null if not found
    }
  } catch (err) {
    console.error('Error checking WarThunder path:', err);
    return { success: false, path: null };
  }
};

// Main startup function
const startup = () => {
  // Step 1: Check if config file exists
  if (check_config_file()) {
    console.log('Config file exists.');

    // Step 2: Check has_run in the config
    const hasRun = check_has_run();

    if (hasRun) {
      console.log('has_run is true. Continuing...');
    } else {
      console.log('has_run is false. Updating to true...');
      update_config('has_run', true);  // Update 'has_run' to true

      // Step 3: Check if War Thunder path exists and get the path
      const { success, path: warthunderPath } = check_warthunder_install_path();
      
      // Log the path returned by check_warthunder_install_path
      console.log('War Thunder install path check result:', { success, warthunderPath });

      if (success && warthunderPath) {
        console.log('War Thunder installation found at:', warthunderPath);

        // Update the game_type and warthunder_install_path in the config
        update_config('game_type', 'warthunder');
        update_config('warthunder_install_path', warthunderPath);
      } else {
        console.log('War Thunder installation not found.');
      }
    }
  } else {
    // Step 4: Create the config file if it doesn't exist
    console.log('Config file does not exist. Creating...');
    set_config();
  }
};

// Usage
startup();
