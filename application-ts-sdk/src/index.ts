import { createServer } from "./server";
import { Queue } from "bullmq";
import { logger } from "./util/logger";
import { initJobQueue, initJobQueueWorker } from "./util/jobs";
let jobQueue: Queue | undefined;
let jobQueueWorker;

async function main() {
  const app = await createServer();

  // // Dev Purpose
  // const wallet = await createWallet(rootadmin);
  // const gateway = await createGateway(wallet, demouser);
  // const network = await getNetwork(gateway);
  // const contract = await getContract(network);

  jobQueue = initJobQueue();
  jobQueueWorker = initJobQueueWorker(app);
  app.locals.jobq = jobQueue;
}

main().catch(async (err) => {
  if (jobQueueWorker != undefined) {
    await jobQueue.close();
  }
  if (jobQueue != undefined) {
    await jobQueue.close();
  }
});
