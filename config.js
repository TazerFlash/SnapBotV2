// config.js (CommonJS Syntax)

const config = {
    // ⚠️ REQUIRED: Your Snapchat Credentials
    USERNAME: "niggnator_2182", 
    PASSWORD: "Redefine21",

    // REQUIRED: Recipients (use the exact usernames you want to send the streak to)
    RECIPIENTS: [
        "rohan_2182"
    ],

    // OPTIONAL: Snap settings
    SNAP_IMAGE_PATH: null, 
    CAPTION: "SnapStreak Bot Test! 🤖", 
    
    // NEW: Path for the persistent Chromium user data (session, cookies, permissions)
    USER_DATA_PATH: "./user_data", 
};

module.exports = config;