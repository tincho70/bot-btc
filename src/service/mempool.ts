/* eslint-disable @typescript-eslint/no-explicit-any */
import mempoolJS from "@mempool/mempool.js";
import { Block } from "@mempool/mempool.js/lib/interfaces/bitcoin/blocks";
import { Client } from "discord.js";

import { Debugger } from "debug";
import { logger } from "../helpers";

const error: Debugger = logger.extend("mempool").extend("error");
const debug: Debugger = logger.extend("mempool").extend("debug");

const watchMempool = async (client: Client) => {
  try {
    const {
      bitcoin: { websocket },
    } = mempoolJS({
      hostname: "mempool.space",
    });

    const ws = websocket.initServer({
      options: ["blocks", "stats"],
    });

    client.averageBlockTime = await getTimeAvg();
    if (!client.lastBlock) {
      const lastBlock = await getLastBlock();
      if (lastBlock) client.updateLastBlock(lastBlock);
    }

    ws.on("message", function incoming(data) {
      const res = JSON.parse(data.toString());

      if (res.block) {
        client.updateLastBlock(res.block);
      }

      if (res.fees) {
        client.fees = {
          economy: res.fees.economyFee,
          low: res.fees.hourFee,
          medium: res.fees.halfHourFee,
          high: res.fees.fastestFee,
          timestamp: Date.now(),
        };

        debug("Updated fees: ", client.fees);
        client.updateTicker();
      }
    });
  } catch (err) {
    error("Error in watchMempool: ", err);
  }
};

const getLastBlock = async (): Promise<Block | null> => {
  try {
    const {
      bitcoin: { blocks },
    } = mempoolJS();

    const getBlocks = (await blocks.getBlocks({
      start_height: undefined,
    })) as any;

    return getBlocks ? getBlocks[0] : null;
  } catch (err) {
    error("Error in getLastBlock: ", err);
    return null;
  }
};

const getTimeAvg = async (): Promise<number | null> => {
  try {
    const {
      bitcoin: { difficulty },
    } = mempoolJS();

    const difficultyAdjustment = await difficulty.getDifficultyAdjustment();
    return difficultyAdjustment.timeAvg;
  } catch (err) {
    error(err);
    return null;
  }
};

export default watchMempool;
