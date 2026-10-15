// INJECTED REGRESSION: simulate a faulty balance migration on a local dev node.
//
// Credits an account with extra free balance via sudo `system.setStorage`
// WITHOUT touching Balances.TotalIssuance — the exact effect of a migration that
// mis-converts legacy balances. Dev nodes only; refuses anything that is not a
// `Development` chain. Usage: bun src/inject.ts ws://127.0.0.1:9945 [planck] [account]

import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";

const [ws = "ws://127.0.0.1:9945", amount = "100000000000000000", who = "//Ferdie"] = process.argv.slice(2);

await cryptoWaitReady();
const api = await ApiPromise.create({
  provider: new WsProvider(ws),
  noInitWarn: true,
  types: { DispatchErrorModule: "DispatchErrorModuleU8" },
});
const chain = (await api.rpc.system.chain()).toString();
if (chain !== "Development") {
  console.error(`refusing to inject into non-development chain "${chain}"`);
  process.exit(64);
}

const keyring = new Keyring({ type: "sr25519", ss58Format: 42 });
const sudo = keyring.addFromUri("//Alice");
const target = keyring.addFromUri(who).address;

const key = api.query.system.account.key(target);
const info: any = await api.query.system.account(target);
const tampered = api.createType("AccountInfo", {
  ...info.toJSON(),
  data: { ...info.data.toJSON(), free: info.data.free.toBn().add(api.createType("Balance", amount).toBn()) },
});

await new Promise<void>((resolve, reject) => {
  api.tx.sudo
    .sudo(api.tx.system.setStorage([[key, tampered.toHex()]]))
    .signAndSend(sudo, ({ status, dispatchError }) => {
      if (dispatchError) reject(new Error(dispatchError.toString()));
      if (status.isInBlock) resolve();
    })
    .catch(reject);
});

console.log(JSON.stringify({
  injected: "faulty-migration",
  chain,
  account: target,
  credited_planck: amount,
  total_issuance_unchanged: (await api.query.balances.totalIssuance()).toString(),
}));
await api.disconnect();
