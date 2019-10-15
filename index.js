#!/usr/bin/env node

const fetch = require("node-fetch");
var argv = require("minimist")(process.argv.slice(2));

// Process credentials
let username, password, config;
// Try to load config.js but preferentially use command line arguments over config.js
try {
  config = require("./config.js");
  username = config.username;
  password = config.password;
} catch (err) {
  console.warn("Credentials not read from config.js file.");
}
// Prevent using both -u & --username
if (argv.u && argv.username)
  throw Error(
    "Both -u and --username options supplied. Use one or the other please."
  );
// Prevent using both -p & --password
if (argv.p && argv.password)
  throw Error(
    "Both -p and --password options supplied. Use one or the other please."
  );
// Load username & password from command line, if present
if (argv.u) username = argv.u;
if (argv.p) password = argv.p;

// Abort if a credential is missing
if (!username || !password) throw Error("Either username or password missing");

// Public IP Sources
// Must return ONLY the IP address in TEXT format!
const publicIpSources = [
  "https://ipv4.icanhazip.com/", // "74.174.209.49\n"
  "https://api.ipify.org/" // "74.174.209.49"
];

/**
 * Get the Public IP address by recursively trying URLs until IP successfully obtained
 * @param {string[]} ipSourceUrls Array of URLs to try to obtain public IP address
 * @param {number} urlIndexToRequest Index of URL array. Required for recursive call.
 */
async function getPublicIp(ipSourceUrls, urlIndexToRequest = 0) {
  try {
    const res = await fetch(ipSourceUrls[urlIndexToRequest]);
    if (res.ok) {
      const textOfResponse = await res.text();
      const cleanTextOfResponse = textOfResponse.trim();
      return cleanTextOfResponse;
    } else throw Error(`Response not OK. Status code was ${res.status}`);
  } catch (err) {
    const newUrlIndex = urlIndexToRequest + 1;
    if (newUrlIndex + 1 > ipSourceUrls.length)
      throw Error("Failed to obtain public IP Address.");
    return await getPublicIp(ipSourceUrls, newUrlIndex);
  }
}

async function postDNSOMatic(publicIp, username, password) {
  //  Send Public IP to DNS-O-Matic
  const hostnamesToChange = "all.dnsomatic.com";

  const post = `https://${username}:${password}@updates.dnsomatic.com/nic/update?hostname=${hostnamesToChange}&myip=${publicIp}&wildcard=NOCHG&mx=NOCHG&backmx=NOCHG`;
  try {
    const res = await fetch(post);
    const resText = await res.text();
    const resTextTrim = resText.trim();
    return resTextTrim;
  } catch (err) {
    console.error(err);
  }
}

// Main
// IIFE because top-level await isn't available yet.
(async () => {
  try {
    // Get public IP address
    const publicIp = await getPublicIp(publicIpSources);
    console.log(`Public IP is: ${publicIp}`);
    const dnsOMaticReply = await postDNSOMatic(publicIp, username, password);
    console.log("DNS-O-Matic Server responded with: " + dnsOMaticReply);
  } catch (err) {
    console.error(err);
  }
})();
