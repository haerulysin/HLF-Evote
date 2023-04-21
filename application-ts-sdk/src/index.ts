import { createServer } from "./server";
import {
  createWallet,
  createGateway,
  getNetwork,
  getContract,
  evaluateTransaction,
} from "./fabric";
import { createHash } from "crypto";
const rootadmin = {
  credentials: {
    certificate:
      "-----BEGIN CERTIFICATE-----\nMIICdzCCAh6gAwIBAgIUSBU0W40NIM5cQCJc0mX8TbqPXcswCgYIKoZIzj0EAwIw\ncjELMAkGA1UEBhMCSUQxFTATBgNVBAgTDENlbnRyYWwgSmF2YTERMA8GA1UEBxMI\nQmFueXVtYXMxGjAYBgNVBAoTEWV2b3RlLmV4YW1wbGUuY29tMR0wGwYDVQQDExRj\nYS5ldm90ZS5leGFtcGxlLmNvbTAeFw0yMzA0MjEwMTUzMDBaFw0yNDA0MjAwMTU4\nMDBaMHMxCzAJBgNVBAYTAklEMRUwEwYDVQQIEwxDZW50cmFsIEphdmExETAPBgNV\nBAcTCEJhbnl1bWFzMRowGAYDVQQKExFldm90ZS5leGFtcGxlLmNvbTEOMAwGA1UE\nCxMFYWRtaW4xDjAMBgNVBAMTBWFkbWluMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD\nQgAENdPwYcE/Txrx/ly1E1Nqd8c7dqXsdTpiOaJq5PZwGA/Xby1U5Rwvw1/P9hhm\nVn/Co9Sb8MYUhl0TUhezUnyYSKOBkDCBjTAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T\nAQH/BAIwADAdBgNVHQ4EFgQUiC5Hm4PkjcgzCIN6VfeB9C0WhGowHwYDVR0jBBgw\nFoAUddc4zLhmBOX9iYOYcvmxrAh8AX4wLQYDVR0RBCYwJIIPREVTS1RPUC02NzZB\nSEJFghFldm90ZS5leGFtcGxlLmNvbTAKBggqhkjOPQQDAgNHADBEAiBR8go0R9NM\n+5nmswMckuwm80ZyYyHY8mUyXGtO3yE3OQIgBQEvKh06vctTY71Z+Nnm+ifTggU+\ngOgI7wUciKT/umA=\n-----END CERTIFICATE-----",
    privateKey:
      "-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg/58QoQTWmPU9Ybno\nGP5yX/E7/OcbVYWLfYd6lmZGeqihRANCAAQ10/BhwT9PGvH+XLUTU2p3xzt2pex1\nOmI5omrk9nAYD9dvLVTlHC/DX8/2GGZWf8Kj1JvwxhSGXRNSF7NSfJhI\n-----END PRIVATE KEY-----\n",
  },
  mspId: "SampleOrg",
  type: "X.509",
};

const adminclient = {
  credentials: {
    certificate:
      "-----BEGIN CERTIFICATE-----\nMIIC2jCCAoGgAwIBAgIUBDrx/pdDSxfoe3rdJzSGMKXvudkwCgYIKoZIzj0EAwIw\ncjELMAkGA1UEBhMCSUQxFTATBgNVBAgTDENlbnRyYWwgSmF2YTERMA8GA1UEBxMI\nQmFueXVtYXMxGjAYBgNVBAoTEWV2b3RlLmV4YW1wbGUuY29tMR0wGwYDVQQDExRj\nYS5ldm90ZS5leGFtcGxlLmNvbTAeFw0yMzA0MjEwMTUzMDBaFw0yNDA0MjAwMjA3\nMDBaMHgxCzAJBgNVBAYTAklEMRUwEwYDVQQIEwxDZW50cmFsIEphdmExETAPBgNV\nBAcTCEJhbnl1bWFzMRowGAYDVQQKExFldm90ZS5leGFtcGxlLmNvbTEOMAwGA1UE\nCxMFYWRtaW4xEzARBgNVBAMTCmV2b3RlYWRtaW4wWTATBgcqhkjOPQIBBggqhkjO\nPQMBBwNCAARRjmmDlcmjqkB4UwlJOEwSyr48VedD+1k1r6tjWaIVhJQrch3gGqM8\nt92bpYSqywgR/NQYWDyT7NomcbVn2wC7o4HuMIHrMA4GA1UdDwEB/wQEAwIHgDAM\nBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBQqwxV4tIOGjEtmlz5fy2o6tRbDzDAfBgNV\nHSMEGDAWgBR11zjMuGYE5f2Jg5hy+bGsCHwBfjAtBgNVHREEJjAkgg9ERVNLVE9Q\nLTY3NkFIQkWCEWV2b3RlLmV4YW1wbGUuY29tMFwGCCoDBAUGBwgBBFB7ImF0dHJz\nIjp7ImhmLkFmZmlsaWF0aW9uIjoiIiwiaGYuRW5yb2xsbWVudElEIjoiZXZvdGVh\nZG1pbiIsImhmLlR5cGUiOiJhZG1pbiJ9fTAKBggqhkjOPQQDAgNHADBEAiAQ7d94\nWqYBT20RBdcp4Sr2p4bpnWwJWKhDh3UJlAhPSwIgAOJB45d5M/gmoJIawAsnJKZn\nyqXNHHsywblS3xDS+uQ=\n-----END CERTIFICATE-----",
    privateKey:
      "-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgcge6Sy1dsFJC7zXw\nNor+eok/BG7Kuo3e4U2e1LkN3FKhRANCAARRjmmDlcmjqkB4UwlJOEwSyr48VedD\n+1k1r6tjWaIVhJQrch3gGqM8t92bpYSqywgR/NQYWDyT7NomcbVn2wC7\n-----END PRIVATE KEY-----",
  },
  mspId: "SampleOrg",
  type: "X.509",
};

const demouser = createHash("sha256")
  .update(JSON.stringify(rootadmin))
  .digest("hex");

console.log(`Dev Contract Auth : ${demouser}`);
async function main() {

  // Dev Purpose
  const wallet = await createWallet(rootadmin);
  const gateway = await createGateway(wallet, demouser);
  const network = await getNetwork(gateway);
  const contract = await getContract(network);
  const app = await createServer();
  app.locals[`${demouser}_Contract`] = contract;

}

main();
