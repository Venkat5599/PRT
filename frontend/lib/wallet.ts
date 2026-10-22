// Wallet adapter for the PortaldotV3 testnet: Substrate extensions (Talisman,
// SubWallet, Polkadot.js) through the standard `window.injectedWeb3` interface,
// and EVM wallets through `window.ethereum`. Balances are read straight from the
// V3 nodes; no wallet library, no server.
import { blake2b } from "@noble/hashes/blake2b";
import { Node } from "./canary";

export const V3 = {
  name: "PortaldotV3 Testnet",
  ws: "wss://test-node-v3.portaldot.dev",
  evmRpc: "https://test-evm-rpc-v3.portaldot.dev",
  explorer: "https://node-console.portaldot.dev",
  chainId: 420420777,
  symbol: "tPOT",
  decimals: 14,
};

export type WalletKind = "substrate" | "evm";
export type WalletInfo = { id: string; name: string; kind: WalletKind; install: string };
export type Connected = { wallet: WalletInfo; address: string; name?: string; accounts: string[] };

export const WALLETS: WalletInfo[] = [
  // Portaldot's own extension (polkadot-js fork); it injects under this exact key, space included.
  { id: "portaldot extension", name: "Portaldot", kind: "substrate", install: "https://chromewebstore.google.com/detail/cpdecangbhmfijmlmjglfcocfpaojceo" },
  { id: "talisman", name: "Talisman", kind: "substrate", install: "https://talisman.xyz/download" },
  { id: "subwallet-js", name: "SubWallet", kind: "substrate", install: "https://www.subwallet.app/download.html" },
  { id: "polkadot-js", name: "Polkadot.js", kind: "substrate", install: "https://polkadot.js.org/extension/" },
  { id: "evm", name: "MetaMask / EVM", kind: "evm", install: "https://metamask.io/download/" },
];

type Injected = { enable(origin: string): Promise<{ accounts: { get(): Promise<{ address: string; name?: string }[]> } }> };
type Eip1193 = { request(args: { method: string; params?: unknown[] }): Promise<any> };
const w = () => globalThis as unknown as { injectedWeb3?: Record<string, Injected>; ethereum?: Eip1193 };

export function installed(info: WalletInfo): boolean {
  return info.kind === "evm" ? !!w().ethereum : !!w().injectedWeb3?.[info.id];
}

export async function connect(info: WalletInfo): Promise<Connected> {
  if (info.kind === "substrate") {
    const ext = w().injectedWeb3?.[info.id];
    if (!ext) throw new Error(`${info.name} is not installed`);
    const api = await ext.enable("Portal Canary");
    const accounts = await api.accounts.get();
    if (!accounts.length) throw new Error(`${info.name} has no accounts shared with this site`);
    return { wallet: info, address: accounts[0].address, name: accounts[0].name, accounts: accounts.map((a) => a.address) };
  }
  const eth = w().ethereum;
  if (!eth) throw new Error("No EVM wallet found");
  const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
  await switchToV3(eth);
  return { wallet: info, address: accounts[0], accounts };
}

async function switchToV3(eth: Eip1193) {
  const chainId = `0x${V3.chainId.toString(16)}`;
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId }] });
  } catch (e) {
    // 4902: the wallet does not know the chain yet.
    if ((e as { code?: number }).code !== 4902) throw e;
    await eth.request({
      method: "wallet_addEthereumChain",
      params: [{ chainId, chainName: V3.name, rpcUrls: [V3.evmRpc], nativeCurrency: { name: V3.symbol, symbol: V3.symbol, decimals: 18 } }],
    });
  }
}

/* ---------- balances ---------- */

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58(s: string): Uint8Array {
  let n = 0n;
  for (const c of s) {
    const i = B58.indexOf(c);
    if (i < 0) throw new Error("invalid address");
    n = n * 58n + BigInt(i);
  }
  const bytes: number[] = [];
  while (n > 0n) { bytes.unshift(Number(n & 0xffn)); n >>= 8n; }
  for (const c of s) { if (c !== "1") break; bytes.unshift(0); }
  return new Uint8Array(bytes);
}

/** The 32-byte account id inside an SS58 address (1- or 2-byte prefix). */
export function accountId(ss58: string): Uint8Array {
  const raw = base58(ss58);
  const prefixLen = raw[0] & 0x40 ? 2 : 1;
  return raw.slice(prefixLen, prefixLen + 32);
}

const hex = (b: Uint8Array) => [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
// twox128("System") ++ twox128("Account")
const SYSTEM_ACCOUNT = "26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9";

export function formatUnits(v: bigint, decimals: number, places = 4): string {
  const base = 10n ** BigInt(decimals);
  const frac = ((v % base) * 10n ** BigInt(places)) / base;
  return `${(v / base).toLocaleString("en")}.${frac.toString().padStart(places, "0")}`;
}

/** Free balance in planck, from System.Account on the V3 node. */
export async function substrateBalance(address: string): Promise<bigint> {
  const id = accountId(address);
  const key = `0x${SYSTEM_ACCOUNT}${hex(blake2b(id, { dkLen: 16 }))}${hex(id)}`;
  const node = new Node(V3.ws, { timeout: 15000 });
  try {
    const raw = await node.call<string | null>("state_getStorage", [key]);
    if (!raw) return 0n;
    // AccountInfo: nonce, consumers, providers, sufficients (u32 each), then free: u128 LE.
    const b = raw.slice(2);
    let v = 0n;
    for (let i = 15; i >= 0; i--) v = (v << 8n) | BigInt(parseInt(b.slice(32 + i * 2, 34 + i * 2), 16));
    return v;
  } finally {
    node.close();
  }
}

/** EVM balance in wei (18 decimals) via the EVM RPC. */
export async function evmBalance(address: string): Promise<bigint> {
  const res = await fetch(V3.evmRpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getBalance", params: [address, "latest"] }),
  });
  const { result, error } = await res.json();
  if (error) throw new Error(error.message);
  return BigInt(result);
}

export async function balance(c: Connected): Promise<string> {
  return c.wallet.kind === "evm"
    ? `${formatUnits(await evmBalance(c.address), 18)} ${V3.symbol}`
    : `${formatUnits(await substrateBalance(c.address), V3.decimals)} ${V3.symbol}`;
}

export const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
