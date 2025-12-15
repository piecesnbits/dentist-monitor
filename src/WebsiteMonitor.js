import crypto from "crypto";
import fs from "fs";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export default class WebsiteMonitor {
  constructor({ url, selector, expectedText, stateFile }) {
    this.url = url;
    this.selector = selector;
    this.expectedText = expectedText;
    this.stateFile = stateFile;
  }

  async fetchText() {

    const response = await fetch(this.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    }
    });
    const html = await response.text();

    const dom = new JSDOM(html);
    const element = dom.window.document.querySelector(this.selector);

    return element ? element.textContent.trim() : "";
  }

  hash(value) {
    return crypto.createHash("sha256").update(value).digest("hex");
  }

  loadPreviousHash() {
    return fs.existsSync(this.stateFile)
      ? fs.readFileSync(this.stateFile, "utf8")
      : null;
  }

  saveHash(hash) {
    fs.writeFileSync(this.stateFile, hash);
  }

  async hasChanged() {
    const text = await this.fetchText();
    const currentHash = this.hash(text);
    const previousHash = this.loadPreviousHash();

    this.saveHash(currentHash);

    return previousHash !== null && previousHash !== currentHash;
  }

  async patientsStopRemoved() {
    const text = (await this.fetchText()).toLowerCase();
    return !text.includes(this.expectedText.toLowerCase());
  }
}
