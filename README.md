# [DNS-O-Matic](https://www.dnsomatic.com/wiki/api) Node JS Client

Node CLI Application to submit your network's public IP address to DNS-O-Matic.

Public IP sources:

- https://ipv4.icanhazip.com/
- https://api.ipify.org/

## DNS-O-Matic Credentials

Can supply either:

- Config.js at project root: export an object with `username` & `password` strings

```js
const credentials = {
  username: "example@example.com",
  password: "yourPassword"
};
module.exports = credentials;
```

- Arguments on the command line
  - `-u` or `--username`
  - `-p` or `--password`

## DNS-O-Matic Options

- Cannot supply individual hostnames. Hostname argument `all.dnsomatic.com` always supplied to API.
