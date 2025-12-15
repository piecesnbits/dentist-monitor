import WebsiteMonitor from "./WebsiteMonitor.js";

const monitor = new WebsiteMonitor({
  url: "https://tandenmondzorg.be/geel",
  selector: "h2", 
  expectedText: "Tijdelijke patiëntenstop"
  // No stateFile needed anymore
});

const run = async () => {
  console.log("Checking website...");
  
  const isOpen = await monitor.isPatientStopRemoved();

  if (isOpen) {
    console.log("🚨 ALERT: The 'Patient Stop' text is GONE! Slots might be available.");
    // Exit with error code 1 to turn the GitHub Action RED and send you an email
    process.exit(1); 
  }

  console.log("No change. Patient stop text is still there.");
  // Exit with 0 (Success) so GitHub stays Green and doesn't spam you
  process.exit(0);
};

run();