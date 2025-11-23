// snap.js (CommonJS Syntax - FINAL ROBUST VERSION with 'X' Close Fix)

const puppeteer = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");
const fs = require("fs/promises");
const config = require("./config.js"); // Import config file

// Apply stealth plugin to avoid basic bot detection
puppeteer.use(Stealth());

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

// --- UTILITY FUNCTION: DYNAMICALLY CLICKS THE CENTER OF AN ELEMENT (Not used here, but kept for reliability) ---
async function dynamicClick(page, selector, timeout = 10000) {
    const elementHandle = await page.waitForSelector(selector, { visible: true, timeout });
    const box = await elementHandle.boundingBox();

    if (!box) {
        throw new Error(`Element ${selector} visible but bounding box is null.`);
    }
    
    const clickX = box.x + (box.width / 2);
    const clickY = box.y + (box.height / 2);

    await page.mouse.click(clickX, clickY);
    console.log(`[Dynamic Click] Clicked ${selector} at (${Math.round(clickX)}, ${Math.round(clickY)}).`);
}
// --- END UTILITY FUNCTION ---

// --- GLOBAL DIAGNOSTIC FLAG ---
function attachConsoleListener(page) {
    page.on('console', msg => {
        // Log all console output for full debug
    });
}

// --- SELECTORS (ALL CONFIRMED AND CORRECTLY MAPPED) ---
const SELECTORS = {
    // Login Selectors
    LOGIN_BUTTON_MAIN_PAGE: 'button[title="Log in"], a[href*="login"]',
    USERNAME_INPUT: '#ai_input', 
    PASSWORD_INPUT: '#password',
    USERNAME_SUBMIT_BUTTON: 'button[type="submit"][color="3"]', 
    PASSWORD_SUBMIT_BUTTON: 'button[data-testid="password-submit-button"]', 
    
    // FINAL FIX FOR POST-LOGIN MODAL (The 'Got it!' button)
    GOT_IT_BUTTON: '.NRgbw.eKaL7.Bnaur.re7ND', // Retained for a potential final check
    HEADS_UP_CLOSE_BUTTON: 'svg.cV8g1[aria-label="close"]', // NEW FIX: The 'X' icon on the modal

    // Camera Selectors
    CAMERA_ACTIVATE_BUTTON: 'button.qJKfS', 
    SNAP_CAPTURE_BUTTON: 'button.FBYjn.gK0xL.W5dIq', 
    SEND_BUTTON: 'button.YatIx.fGS78.eKaL7.Bnaur', 
    // Recipient selection
    RECIPIENT_LIST_ITEM: 'div[role="listitem"]', 
    FINAL_SEND_BUTTON: 'button[type="submit"]',
};

async function runBot() {
    console.log("Starting SnapBot...");

    // 1. Launch Browser 
    const browser = await puppeteer.launch({
        headless: false, 
        defaultViewport: { width: 1080, height: 1920 },
        userDataDir: config.USER_DATA_PATH,
        args: [
            '--disable-notifications',
            '--mute-audio'
        ]
    });

    const page = await browser.newPage();
    attachConsoleListener(page);
    
    const context = browser.defaultBrowserContext();
    await context.overridePermissions("https://web.snapchat.com", ["camera", "microphone"]); 

    try {
        await page.goto("https://www.snapchat.com/?original_referrer=none", { waitUntil: 'domcontentloaded' });

        // 2. Login
        console.log("Attempting Login...");
        
        // --- LOGIC: Complete Login (Unchanged) ---
        try {
            const mainLoginBtn = await page.waitForSelector(SELECTORS.LOGIN_BUTTON_MAIN_PAGE, { timeout: 10000 });
            await mainLoginBtn.click();
            console.log("✅ Clicked Main 'Log in' button.");
            await delay(3000); 
        } catch (e) {
             console.log("⚠️ Main login button not found, assuming direct access to form.");
        }

        await page.waitForSelector(SELECTORS.USERNAME_INPUT, { timeout: 30000 });
        await page.type(SELECTORS.USERNAME_INPUT, config.USERNAME, { delay: 100 });
        
        await page.waitForSelector(SELECTORS.USERNAME_SUBMIT_BUTTON, { timeout: 10000 }); 
        await page.click(SELECTORS.USERNAME_SUBMIT_BUTTON); 

        await page.waitForSelector(SELECTORS.PASSWORD_INPUT, { timeout: 30000 });
        await page.type(SELECTORS.PASSWORD_INPUT, config.PASSWORD, { delay: 100 });
        
        await page.waitForSelector(SELECTORS.PASSWORD_SUBMIT_BUTTON, { timeout: 10000 });
        await page.click(SELECTORS.PASSWORD_SUBMIT_BUTTON); 
        
        await delay(10000); 

        // --- NEW LOGIC: Close "Install Desktop App" Banner ---
        console.log("Checking for 'Install Desktop App' banner...");
        const BANNER_CLOSE_XPATH = '//button[.//svg[contains(@class, "zwwmh")]]'; 
        
        try {
            const [closeBannerButton] = await page.$x(BANNER_CLOSE_XPATH);
            if (closeBannerButton) {
                await closeBannerButton.click();
                console.log("✅ Closed 'Install Desktop App' banner.");
                await delay(1000); 
            } else {
                console.log("No 'Install Desktop App' banner found, proceeding.");
            }
        } catch (e) {
            console.log("Error during banner close check, proceeding.");
        }

        // --- NEW LOGIC: FORCE INTERACTION TO TRIGGER MODALS (Warming Click) ---
        console.log("Forcing interaction to trigger any delayed modals by clicking chat list...");
        try {
            const chatListSelector = 'div[role="list"]'; 
            await page.waitForSelector(chatListSelector, { timeout: 10000 });
            await page.click(chatListSelector);
            console.log("✅ Performed warming click on the chat list area.");
        } catch (e) {
            console.log("⚠️ Could not perform warming click, proceeding.");
        }

        // --- POP-UP HANDLING LOGIC: Click the 'X' Close Button on Modal (FINAL MODAL FIX) ---
        console.log("Checking for 'Heads up!' modal close button...");
        let modalAttempts = 0;
        const modalMaxAttempts = 3; 

        await delay(3000); // Initial delay after warming click

        while (modalAttempts < modalMaxAttempts) {
            try {
                // Wait for the 'X' button to appear on the modal
                const closeButton = await page.waitForSelector(SELECTORS.HEADS_UP_CLOSE_BUTTON, { visible: true, timeout: 1000 }); 
                
                if (closeButton) {
                    await closeButton.click(); 
                    console.log(`✅ Clicked 'X' to dismiss modal (Attempt ${modalAttempts + 1}/${modalMaxAttempts}).`);
                    await delay(1000); 
                } else {
                    break; 
                }
            } catch (e) {
                break; 
            }
            modalAttempts++;
        }
        
        if (modalAttempts > 0) {
             console.log("Modal dismissal attempts complete. Proceeding to camera.");
        } else {
             console.log("No 'Heads up!' modal detected.");
        }
        // --- END POP-UP HANDLING LOGIC ---


        // 3. Activate Camera (First Click)
        console.log("Activating Camera...");
        try {
            await page.waitForSelector(SELECTORS.CAMERA_ACTIVATE_BUTTON, { visible: true, timeout: 15000 });
            await page.click(SELECTORS.CAMERA_ACTIVATE_BUTTON);
            console.log("✅ Initial camera activated.");
            await delay(3000); 
        } catch (e) {
            console.log("⚠️ Initial camera button not found. Assuming camera is already live.");
        }

        // 4. Capture Snap (Second Click)
        console.log("Capturing Snap...");
        await page.waitForSelector(SELECTORS.SNAP_CAPTURE_BUTTON, { visible: true, timeout: 10000 });
        await page.click(SELECTORS.SNAP_CAPTURE_BUTTON);
        console.log("✅ Snap captured.");
        await delay(3000);

        // 5. Add Custom Image (Optional - COMPLEX, may fail)
        if (config.SNAP_IMAGE_PATH) {
            console.log(`Adding custom image from ${config.SNAP_IMAGE_PATH}...`);
        }
        
        // 6. Add Caption (Optional - COMPLEX, may fail)
        if (config.CAPTION) {
            const captionButton = 'button[title="Add a caption"]'; 
            const textarea = 'textarea[aria-label="Caption Input"]';
            try {
                await page.waitForSelector(captionButton, { timeout: 5000 });
                await page.click(captionButton);
                await page.waitForSelector(textarea, { timeout: 5000 });
                await page.type(textarea, config.CAPTION, { delay: 50 });
                console.log("✅ Caption added.");
                await delay(1000);
            } catch (e) {
                 console.warn(`❌ Failed to add caption. Selectors broken.`);
            }
        }
        
        // 7. Open Send To Modal
        console.log("Opening Send To modal...");
        // **THIS IS THE LAST UNCONFIRMED SELECTOR**
        await page.waitForSelector(SELECTORS.SEND_BUTTON, { timeout: 10000 }); 
        await page.click(SELECTORS.SEND_BUTTON);
        await delay(3000);

        // 8. Select Recipients and Send
        console.log("Selecting recipients and sending snap...");
        let recipientsSelected = 0;
        for (const recipient of config.RECIPIENTS) {
            const recipientSelector = `div[role="listitem"] span[title="${recipient}"]`;
            try {
                const recipientElement = await page.waitForSelector(recipientSelector, { timeout: 5000 });
                if (recipientElement) {
                    const parentDiv = await page.evaluateHandle(el => el.closest('div[role="listitem"]'), recipientElement);
                    if (parentDiv) {
                        await parentDiv.click();
                        console.log(`✅ Selected: ${recipient}`);
                        recipientsSelected++;
                    }
                }
            } catch (e) {
                console.warn(`❌ Could not find or click recipient: ${recipient}. Selector failure.`);
            }
        }
        
        if (recipientsSelected > 0) {
            // Final Send button (usually a submit button in the modal)
            await page.waitForSelector(SELECTORS.FINAL_SEND_BUTTON, { timeout: 10000 });
            await page.click(SELECTORS.FINAL_SEND_BUTTON); 
            console.log("✅ Final Send button clicked. Snap should be sent.");
        } else {
             console.warn("⚠️ No recipients were selected. Snap not sent.");
        }
        
        await delay(5000);
        
    } catch (error) {
        console.error("❌ Critical Bot Error:", error);
        console.log("⚠️ Bot failed. Leaving browser open for inspection. Close the browser manually to save session data.");
    } finally {
        // 9. Close Browser (REMOVED FOR DEBUGGING)
        console.log("Bot process complete. Window will remain open for inspection.");
        // await browser.close(); 
        console.log("Done.");
    }
}

runBot();