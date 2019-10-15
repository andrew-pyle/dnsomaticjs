#!/usr/bin/env node

const fetch = require("node-fetch");
const { username, password } = require("./config.js");

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
