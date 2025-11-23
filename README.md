# 🤖 SnapBot-V2: High-Resilience Snapchat Web Automation

This project is a custom-built, highly resilient Node.js bot designed to automate the Snapchat Web interface. It uses **Puppeteer-Extra** with the **Stealth Plugin** to maintain Snap Streaks by automating the entire capture, post-processing, and sending sequence.

The core development focus of this version was to defeat the dynamic and unstable CSS selectors unique to Snapchat's live web environment.

## 🌟 Features

*   **Snapstreak Maintenance:** Executes the full workflow: Login, Camera Activation, Snap Capture, and Recipient Selection.
*   **High Resilience:** Logic is specifically engineered with dynamic waits and attribute-based selectors to bypass unstable class names.
*   **Modal Dismissal Loop:** Robustly handles recurring pop-ups (like the "Heads up!" permission modal) that often break standard bots.
*   **Session Persistence:** Utilizes `userDataDir` to save cookies, session tokens, and granted permissions, making all subsequent runs much faster and more reliable.
*   **Headless Debugging:** Configured to run in a visible browser for easy real-time troubleshooting.

## 🛠️ Setup Guide

### Prerequisites

1.  **Node.js:** Latest LTS version.
2.  **Git:** (Recommended for managing the project).

### Installation

1.  **Open your Terminal** and navigate to your project directory.
2.  **Install all dependencies:**
    ```bash
    npm install
    ```

### Configuration

You must configure two files: `config.js` and `package.json`.

#### 1. `config.js` (Required)

Create or update your `config.js` with your specific account credentials and recipient list.

```javascript
// config.js

const config = {
    // ⚠️ REQUIRED: Your Snapchat Credentials
    USERNAME: "YOUR_SNAPCHAT_USERNAME", 
    PASSWORD: "YOUR_SNAPCHAT_PASSWORD",

    // REQUIRED: Recipients (exact usernames)
    RECIPIENTS: [
        "friend_username_1",
        "friend_username_2"
    ],

    // OPTIONAL: Snap settings
    SNAP_IMAGE_PATH: null, // Set to a path (e.g., 'snap.jpg') to send a custom image
    CAPTION: "SnapStreak Bot Test! 🤖", 
    
    // Internal: Persistent data location (saves session, cookies, permissions)
    USER_DATA_PATH: "./user_data", 
};

module.exports = config;
2. package.json (Ensure Correct Dependencies)
Ensure your dependencies block matches the reliable versions developed during this project:
code
JSON
{
  "name": "cleansnapbot",
  "version": "1.0.0",
  "description": "A minimal Snapchat automation bot.",
  "main": "snap.js",
  "scripts": {
    "start": "node snap.js"
  },
  "dependencies": {
    "puppeteer": "^22.0.0",
    "puppeteer-extra": "^3.3.6",
    "puppeteer-extra-plugin-stealth": "^2.11.2"
  }
}
🚀 Running the Bot
Open your Terminal in the project directory.
Run the bot:
code
Bash
npm start
First Run Protocol (Crucial for Saving Session)
The first run requires a final manual step to persist your session and permissions:
Bot Fails (Expected): The bot will launch, log in successfully, and fail at the Send To Button (the last unresolved selector).
Save the Session: Manually close the Chromium window (by clicking the 'X' button) to trigger Chromium to save your session data, cookies, and granted permissions to the ./user_data folder.
Second Run: Run npm start again. The bot will load the saved session and skip the login and initial permission modals entirely.
🛑 Current Failure Point & Solution
The bot is currently failing at the very last step due to an outdated selector:
Roadblock	Selector in Code (snap.js)	Status
Final Send Button (Paper Plane)	button.YatIx.fGS78.eKaL7.Bnaur	❌ CRITICAL FAILURE POINT
Next Step: Fix the Send Button
The only remaining task is to fix the final selector:
Use the Open Browser: Look at the Chromium window that the bot left open (frozen on the Snap Preview screen).
Inspect the Element: Right-click the Paper Plane Icon and select "Inspect" to get the current HTML for the <button>.
Replace the Selector: Update the SELECTORS.SEND_BUTTON line in snap.js with the new, working class or attribute selector.