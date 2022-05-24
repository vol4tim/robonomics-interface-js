import mh from "multihashing-async";
import CID from "cids";

export function mergedeep(current, updates) {
  for (let key of Object.keys(updates)) {
    if (
      !Object.prototype.hasOwnProperty.call(current, key) ||
      typeof updates[key] !== "object"
    )
      current[key] = updates[key];
    else mergedeep(current[key], updates[key]);
  }
  return current;
}

export function hexToCid(hex) {
  const digest = Buffer.from(hex.slice(2), "hex");
  const combined = mh.multihash.encode(digest, "sha2-256");
  const cid = new CID(0, "dag-pb", combined);
  return cid.toString();
}

export function cidToHex(cid) {
  return (
    "0x" +
    Buffer.from(mh.multihash.decode(new CID(cid).multihash).digest).toString(
      "hex"
    )
  );
}
