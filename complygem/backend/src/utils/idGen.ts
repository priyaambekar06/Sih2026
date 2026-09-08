let bidCounter = 1023;
let tenderCounter = 4001;

export function nextBidRefId(): string {
  bidCounter += 1;
  return `GEM/2026/B/${bidCounter}`;
}

export function nextTenderId(): string {
  tenderCounter += 1;
  return `GEM/2026/T/${tenderCounter}`;
}
