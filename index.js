#!/usr/bin/env node
const requestPromise = require("request-promise-native");

// Get Public IP
const publicIpSources = [
  "https://ipv4.icanhazip.com/", // "74.174.209.49\n"
  "https://api.ipify.org/" // "74.174.209.49"
];

async function postDNSOMatic(publicIp) {
  //  Send Public IP to DNS-O-Matic
  const username = "";
  const password = "";
  const yourhostname = "all.dnsomatic.com";
  const ipaddress = "";
  const post = `https://${username}:${password}@updates.dnsomatic.com/nic/update?hostname=${yourhostname}&myip=${ipaddress}&wildcard=NOCHG&mx=NOCHG&backmx=NOCHG`;
  try {
    const response = await requestPromise(post);
    return response;
  } catch (err) {
    console.error(err);
  }
}

function logNetworkErrorToUser(error) {
  console.error("Public IP address source failed.");
  console.error(error);
}

// TODO Fix this manual looping-type thing with promises
// TODO Input credentials from process.env
(async () => {
  try {
    // First Public IP source
    const ipSource = publicIpSources[0];
    console.log(`Obtaining public IP address from ${ipSource}`);
    const publicIp = await requestPromise(ipSource);
    console.log(`Public IP is: ${publicIp}`);
    const res = await postDNSOMatic(publicIp);
    console.log("DNS-O-Matic Server responded with: " + res);
    return;
  } catch (err) {
    logNetworkErrorToUser(err);
  }
  // Fallback IP source. Only runs after an error in the first source.
  try {
    const ipSource = publicIpSources[1];
    console.log(`Obtaining public IP address from ${ipSource}`);
    const publicIp = await requestPromise(ipSource);
    console.log(`Public IP is: ${publicIp}`);
    const res = await postDNSOMatic(publicIp);
    console.log("DNS-O-Matic Server responded with: " + res);
  } catch (err) {
    logNetworkErrorToUser(err);
  }
})();
