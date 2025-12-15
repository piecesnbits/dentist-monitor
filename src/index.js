import WebsiteMonitor from "./WebsiteMonitor.js";

const monitor = new WebsiteMonitor({
  url: "https://tandenmondzorg.be/geel",
  selector: "h2",
  expectedText: "Tijdelijke patiëntenstop",
  stateFile: "state.hash",
});

const run = async () => {
  const changed = await monitor.hasChanged();
  const removed = await monitor.patientsStopRemoved();

  if (changed || removed) {
    console.log("Website status changed");
    process.exit(1); // signal GitHub Actions
  }

  console.log("No change detected");
};

run();
