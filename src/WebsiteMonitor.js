import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export default class WebsiteMonitor {
  constructor({ url, selector, expectedText }) {
    this.url = url;
    this.selector = selector;
    this.expectedText = expectedText;
  }

  async fetchText() {
    try {
      const response = await fetch(this.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load page: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const dom = new JSDOM(html);
      
      // Select the specific element
      const element = dom.window.document.querySelector(this.selector);

      // If the element (H2) exists, return its text. 
      // If it doesn't exist, return a distinctive string to prevent false positives.
      return element ? element.textContent.trim() : "ELEMENT_NOT_FOUND";
    } catch (error) {
      console.error("Error fetching page:", error);
      return "ERROR";
    }
  }

  async isPatientStopRemoved() {
    const text = await this.fetchText();
    
    // Safety check: If the scraper failed or couldn't find the H2 tag, 
    // do NOT say slots are available.
    if (text === "ERROR" || text === "ELEMENT_NOT_FOUND") {
      console.log(`Warning: Could not find selector '${this.selector}' or page failed to load.`);
      return false; 
    }

    // Check if the text contains the "Stop" message
    const hasStopText = text.toLowerCase().includes(this.expectedText.toLowerCase());

    // If "Stop" text is missing, it means slots might be open!
    return !hasStopText;
  }
}