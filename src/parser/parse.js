const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os =require("os")

// Load the mission and tank extraction functions
const {extractMissionSettings} = require("./extract_mission.js");
const {extractTankModelsFromJson} = require("./extract_tanks.js");

// Main function to parse the file
export async function parseFile(filePath) {
  try {
    // Ensure the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Call the Python parser.py script
    const outputJson = await runPythonParser(filePath);

    // Process the JSON with the provided functions
    const missionData = extractMissionSettings(outputJson);
    const tankModels = extractTankModelsFromJson(outputJson);

    // Build the final JSON structure
    const result = {
      filePath,
      missionData,
      tankModels,
    };

    // Log the final JSON structure to the console
    //console.log("Final JSON Output:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    //console.error("An error occurred:", error.message);
    process.exit(1);
  }
}

// Function to run the Python parser and return the JSON
function runPythonParser(filePath) {
  const username = os.userInfo().username; // Get the current username
  const parserpath =path.join('C:', 'Users', username, 'AppData', 'Roaming', 'warthunder-testdrive-gui',"parse.py");
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [parserpath, filePath]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
      }

      try {
        const parsedOutput = JSON.parse(output);
        resolve(parsedOutput);
      } catch (err) {
        reject(new Error(`Failed to parse JSON from Python output: ${err.message}`));
      }
    });
  });
}

// Main execution logic
//if (require.main === module) {
  //console.log(parseFile("C:\\Users\\mccus\\AppData\\Local\\WarThunder\\usermissions\\Ask3lad\\ask3lad_testdrive.blk"))
//}

