import CID from "cids";
import mh from "multihashing-async";

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

export function stringToHex(str) {
  const strBuf = Buffer.from(str.toString(), "utf-8");
  if (strBuf.length > 32) {
    throw new Error("max 32");
  }
  const bag = Buffer.alloc(32);
  const fill = Buffer.concat([bag, strBuf]);
  const buf = Buffer.from(fill).slice(fill.length - 32, fill.length);
  return "0x" + buf.toString("hex");
}

export function hexToString(hex) {
  return Buffer.from(hex.slice(2), "hex").toString();
}
