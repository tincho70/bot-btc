const HALVING_EPOCH = 210000; // halving is at 210000 block
const DIFFICULTY_EPOCH = 2016; // at
const TARGET_BLOCK_TIME = 600000; // ms, 10 min

const calculateHalvingData = (
  currentAverageBlockTime: number | null,
  lastBlockHeight: number
) => {
  const blocksToNextHalving = calculateBlocksToHalving(lastBlockHeight);

  const blocksInCurrentDifficulty = Math.min(
    blocksToNextHalving,
    calculateBlocksToDifficultyAdjustment(lastBlockHeight)
  );

  const avgBlockTime = currentAverageBlockTime ?? TARGET_BLOCK_TIME;

  const estimatedAverageForCurrentDifficulty = Math.round(
    ((HALVING_EPOCH - blocksInCurrentDifficulty) * avgBlockTime +
      blocksInCurrentDifficulty * TARGET_BLOCK_TIME) /
      HALVING_EPOCH
  );

  const otherBlocks = blocksToNextHalving - blocksInCurrentDifficulty;

  const timeToHalving =
    blocksInCurrentDifficulty * estimatedAverageForCurrentDifficulty +
    otherBlocks * TARGET_BLOCK_TIME;

  const estimatedDate = new Date(Date.now() + timeToHalving);

  //const currentHalving = calculateCurrentHalving(lastBlockHeight);

  const data = {
    blocksToNextHalving,
    timeToHalving,
    estimatedDate,
  };

  return data;
};

function calculateBlocksToHalving(lastBlockHeight: number) {
  // HALVING_EPOCH - blocks in current halving
  return HALVING_EPOCH - (lastBlockHeight % HALVING_EPOCH);
}

function calculateBlocksToDifficultyAdjustment(lastBlockHeight: number) {
  // DIFFICULTY_EPOCH - blocks in current difficulty;
  return DIFFICULTY_EPOCH - (lastBlockHeight % DIFFICULTY_EPOCH);
}

export default calculateHalvingData;
