import WebsiteMonitor from "./WebsiteMonitor.js";
import fetch from "node-fetch"; // Make sure to import fetch

const monitor = new WebsiteMonitor({
  url: "https://tandenmondzorg.be/geel",
  selector: "h2",
  expectedText: "Tijdelijke patiëntenstop"
});

// Helper function to update Home Assistant
async function updateHomeAssistant(statusMessage) {
  const webhookUrl = process.env.HA_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log("No Home Assistant Webhook URL provided. Skipping update.");
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: statusMessage })
    });
    console.log(`Updated Home Assistant: ${statusMessage}`);
  } catch (error) {
    console.error("Failed to update Home Assistant:", error);
  }
}

const run = async () => {
  console.log("Checking website...");
  const isOpen = await monitor.isPatientStopRemoved();

  if (isOpen) {
    console.log("🚨 Slots might be available!");
    await updateHomeAssistant("OPEN"); 
    // We still exit with 1 to notify GitHub (optional, you can change to 0 if HA is enough)
    process.exit(1); 
  } else {
    console.log("No slots.");
    await updateHomeAssistant("Closed");
    process.exit(0);
  }
};

run();