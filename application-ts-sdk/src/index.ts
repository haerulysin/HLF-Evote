import { createServer } from "./server";
import { logger } from "./util/logger";
async function main() {
  const app = await createServer();
  
  // Dev Purpose
  // const wallet = await createWallet(rootadmin);
  // const gateway = await createGateway(wallet, demouser);
  // const network = await getNetwork(gateway);
  // const contract = await getContract(network);
  // app.locals[`${demouser}_Contract`] = contract;
}

main();
