const { execSync } = require('child_process');
const fs = require('fs');

const adb = '"C:\\Users\\Adrian Xavier Moral\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe"';

function run(cmd) {
  console.log('Running:', cmd);
  return execSync(`${adb} ${cmd}`).toString();
}

function sleep(ms) {
  execSync(`powershell -command "Start-Sleep -Milliseconds ${ms}"`);
}

function tap(x, y) {
  run(`shell input tap ${x} ${y}`);
  sleep(1000);
}

function swipe(x1, y1, x2, y2) {
  run(`shell input swipe ${x1} ${y1} ${x2} ${y2}`);
  sleep(1000);
}

function screenshot(filename) {
  run(`exec-out screencap -p > screenshots/${filename}.png`);
  console.log(`Saved ${filename}.png`);
}

function dumpXML() {
  run(`shell uiautomator dump`);
  run(`pull /sdcard/window_dump.xml .`);
  return fs.readFileSync('window_dump.xml', 'utf8');
}

function findAndTap(text) {
  const xml = dumpXML();
  // Look for text or content-desc that includes the text
  const regex = new RegExp(`(text|content-desc)="[^"]*${text}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`, 'i');
  const match = xml.match(regex);
  if (match) {
    const x = Math.floor((parseInt(match[2]) + parseInt(match[4])) / 2);
    const y = Math.floor((parseInt(match[3]) + parseInt(match[5])) / 2);
    tap(x, y);
    return true;
  }
  console.log('Could not find:', text);
  return false;
}

console.log('Dismissing any keyboards or popups...');
run(`shell input keyevent 4`);
sleep(1000);
run(`shell input keyevent 4`);
sleep(1000);

console.log('Re-opening Expo Go to the active project...');
run(`shell am start -a android.intent.action.VIEW -d "exp://10.0.2.2:8081" host.exp.exponent`);
sleep(12000); // 12 seconds to ensure the JavaScript bundle downloads and app renders

console.log('Starting App Automation...');
sleep(2000);  

// 1. CDRRMO FLOW
console.log('--- CDRRMO FLOW ---');
findAndTap('LGU Officer');
sleep(1000);
findAndTap('Quick Fill Demo');
sleep(1000);
screenshot('LGU_1_Login_Filled');

findAndTap('Access Dashboard');
sleep(4000); 
screenshot('LGU_2_Map_Home');

// Open a node
tap(540, 1000); // Tap middle of map
sleep(2000);
swipe(540, 2000, 540, 500); // Scroll down
sleep(1000);
screenshot('LGU_3_NodeDetail_AI_Controls');

// Go back
tap(110, 228); // Back button approx
sleep(2000);

// Nodes Tab (NetworkTab)
tap(354, 2253); 
sleep(2000);
screenshot('LGU_4_SensorNetwork');

// Alerts Tab
tap(540, 2253);
sleep(2000);
screenshot('LGU_5_LiveAlerts');

// Analytics Tab
tap(727, 2253);
sleep(2000);
screenshot('LGU_6_ESGAnalytics');

// Log out (Click the profile logout button instead of restarting)
tap(913, 2253); // Profile tab
sleep(1000);
swipe(540, 2000, 540, 500); // Scroll down
sleep(1000);
findAndTap('Terminate Secure Session');
sleep(4000); // Wait for login screen to appear

// 2. CITIZEN FLOW
console.log('--- CITIZEN FLOW ---');
findAndTap('Citizen');
sleep(1000);
screenshot('Citizen_1_Login_Toggle');

findAndTap('View Flood Status');
sleep(5000);
screenshot('Citizen_2_Home_Dashboard');

tap(354, 2253); // Map tab (2nd tab)
sleep(2000);
screenshot('Citizen_3_Map');

// Click node as citizen
tap(540, 1000);
sleep(3000);
swipe(540, 2000, 540, 500); // Scroll down
sleep(1000);
screenshot('Citizen_4_NodeDetail_NoControls');
tap(110, 228); // Back
sleep(2000);

tap(727, 2253); // Alerts tab (4th tab)
sleep(2000);
screenshot('Citizen_5_Alerts');

tap(913, 2253); // Data tab (5th tab)
sleep(2000);
screenshot('Citizen_6_Data');

console.log('Automation Complete! Screenshots saved in /screenshots folder.');
