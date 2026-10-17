//! Decoder for `RuntimeMetadataV13`, the format Portaldot runtimes emit.
//!
//! V13 describes types as strings, so this yields a structural view
//! (modules, calls, events, storage, constants, errors) that is enough to diff
//! two runtimes and to look up pallet/call indices for extrinsic encoding.

use anyhow::{bail, Context};
use serde::Serialize;

pub(crate) struct Reader<'a> {
    pub(crate) b: &'a [u8],
    pub(crate) pos: usize,
}

impl<'a> Reader<'a> {
    pub(crate) fn take(&mut self, n: usize) -> anyhow::Result<&'a [u8]> {
        if self.pos + n > self.b.len() {
            bail!("unexpected end of metadata at byte {}", self.pos);
        }
        let s = &self.b[self.pos..self.pos + n];
        self.pos += n;
        Ok(s)
    }

    pub(crate) fn u8(&mut self) -> anyhow::Result<u8> {
        Ok(self.take(1)?[0])
    }

    pub(crate) fn compact(&mut self) -> anyhow::Result<u64> {
        let first = self.u8()?;
        Ok(match first & 0b11 {
            0 => (first >> 2) as u64,
            1 => (u16::from_le_bytes([first, self.u8()?]) >> 2) as u64,
            2 => {
                let rest = self.take(3)?;
                (u32::from_le_bytes([first, rest[0], rest[1], rest[2]]) >> 2) as u64
            }
            _ => {
                let len = (first >> 2) as usize + 4;
                if len > 8 {
                    bail!("compact integer too large");
                }
                let mut buf = [0u8; 8];
                buf[..len].copy_from_slice(self.take(len)?);
                u64::from_le_bytes(buf)
            }
        })
    }

    pub(crate) fn bytes(&mut self) -> anyhow::Result<Vec<u8>> {
        let n = self.compact()? as usize;
        Ok(self.take(n)?.to_vec())
    }

    pub(crate) fn string(&mut self) -> anyhow::Result<String> {
        String::from_utf8(self.bytes()?).context("metadata string is not utf-8")
    }

    pub(crate) fn vec<T>(&mut self, mut f: impl FnMut(&mut Self) -> anyhow::Result<T>) -> anyhow::Result<Vec<T>> {
        let n = self.compact()? as usize;
        (0..n).map(|_| f(self)).collect()
    }

    pub(crate) fn option<T>(&mut self, f: impl FnOnce(&mut Self) -> anyhow::Result<T>) -> anyhow::Result<Option<T>> {
        match self.u8()? {
            0 => Ok(None),
            1 => f(self).map(Some),
            t => bail!("invalid Option tag {t}"),
        }
    }

    pub(crate) fn docs(&mut self) -> anyhow::Result<()> {
        self.vec(|r| r.string()).map(|_| ())
    }
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct Call {
    pub name: String,
    pub args: Vec<(String, String)>,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct Event {
    pub name: String,
    pub args: Vec<String>,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct StorageEntry {
    pub name: String,
    /// Human-readable shape, e.g. `map Blake2_128Concat AccountId => AccountInfo<..>`.
    pub shape: String,
    pub optional: bool,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct Constant {
    pub name: String,
    pub ty: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Module {
    pub name: String,
    pub index: u8,
    pub storage_prefix: Option<String>,
    pub storage: Vec<StorageEntry>,
    pub calls: Option<Vec<Call>>,
    pub events: Option<Vec<Event>>,
    pub constants: Vec<Constant>,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct MetadataV13 {
    pub modules: Vec<Module>,
    pub extrinsic_version: u8,
    pub signed_extensions: Vec<String>,
}

impl MetadataV13 {
    pub fn module(&self, name: &str) -> Option<&Module> {
        self.modules.iter().find(|m| m.name == name)
    }

    /// `(pallet_index, call_index)` for encoding a call.
    pub fn call_index(&self, pallet: &str, call: &str) -> Option<(u8, u8)> {
        let m = self.module(pallet)?;
        let i = m.calls.as_ref()?.iter().position(|c| c.name == call)?;
        Some((m.index, i as u8))
    }

    pub fn constant(&self, pallet: &str, name: &str) -> Option<&Constant> {
        self.module(pallet)?.constants.iter().find(|c| c.name == name)
    }
}

const HASHERS: [&str; 7] =
    ["Blake2_128", "Blake2_256", "Blake2_128Concat", "Twox128", "Twox256", "Twox64Concat", "Identity"];

fn hasher(r: &mut Reader) -> anyhow::Result<String> {
    let i = r.u8()? as usize;
    HASHERS.get(i).map(|s| s.to_string()).with_context(|| format!("invalid hasher {i}"))
}

fn storage_entry(r: &mut Reader) -> anyhow::Result<StorageEntry> {
    let name = r.string()?;
    let optional = r.u8()? == 0;
    let shape = match r.u8()? {
        0 => format!("plain {}", r.string()?),
        1 => {
            let h = hasher(r)?;
            let (k, v) = (r.string()?, r.string()?);
            r.u8()?; // unused flag
            format!("map {h} {k} => {v}")
        }
        2 => {
            let h1 = hasher(r)?;
            let (k1, k2, v) = (r.string()?, r.string()?, r.string()?);
            let h2 = hasher(r)?;
            format!("double_map {h1} {k1}, {h2} {k2} => {v}")
        }
        3 => {
            let keys = r.vec(|r| r.string())?;
            let hashers = r.vec(hasher)?;
            let v = r.string()?;
            format!("nmap ({}) [{}] => {v}", keys.join(", "), hashers.join(", "))
        }
        t => bail!("invalid storage entry type {t} for {name}"),
    };
    r.bytes()?; // default value
    r.docs()?;
    Ok(StorageEntry { name, shape, optional })
}

fn module(r: &mut Reader) -> anyhow::Result<Module> {
    let name = r.string()?;
    let storage = r.option(|r| {
        let prefix = r.string()?;
        let entries = r.vec(storage_entry)?;
        Ok((prefix, entries))
    })?;
    let calls = r.option(|r| {
        r.vec(|r| {
            let name = r.string()?;
            let args = r.vec(|r| Ok((r.string()?, r.string()?)))?;
            r.docs()?;
            Ok(Call { name, args })
        })
    })?;
    let events = r.option(|r| {
        r.vec(|r| {
            let name = r.string()?;
            let args = r.vec(|r| r.string())?;
            r.docs()?;
            Ok(Event { name, args })
        })
    })?;
    let constants = r.vec(|r| {
        let name = r.string()?;
        let ty = r.string()?;
        let value = format!("0x{}", hex::encode(r.bytes()?));
        r.docs()?;
        Ok(Constant { name, ty, value })
    })?;
    let errors = r.vec(|r| {
        let n = r.string()?;
        r.docs()?;
        Ok(n)
    })?;
    let index = r.u8()?;
    let (storage_prefix, storage) = match storage {
        Some((p, e)) => (Some(p), e),
        None => (None, Vec::new()),
    };
    Ok(Module { name, index, storage_prefix, storage, calls, events, constants, errors })
}

/// Decode full prefixed metadata bytes (`b"meta"`, version 13, payload).
pub fn decode(bytes: &[u8]) -> anyhow::Result<MetadataV13> {
    let fp = crate::metadata::fingerprint(bytes)?;
    if fp.version != 13 {
        bail!("expected metadata V13, got V{}", fp.version);
    }
    let mut r = Reader { b: bytes, pos: 5 };
    let modules = r.vec(module)?;
    let extrinsic_version = r.u8()?;
    let signed_extensions = r.vec(|r| r.string())?;
    if r.pos != bytes.len() {
        bail!("{} trailing bytes after metadata", bytes.len() - r.pos);
    }
    Ok(MetadataV13 { modules, extrinsic_version, signed_extensions })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn s(v: &mut Vec<u8>, x: &str) {
        v.push((x.len() as u8) << 2);
        v.extend_from_slice(x.as_bytes());
    }

    #[test]
    pub(crate) fn compact_modes() {
        let mut r = Reader { b: &[0x04, 0x15, 0x01, 0x02, 0x00, 0x01, 0x00], pos: 0 };
        assert_eq!(r.compact().unwrap(), 1);
        assert_eq!(r.compact().unwrap(), 69);
        assert_eq!(r.compact().unwrap(), 16384);
    }

    #[test]
    fn decodes_minimal_module() {
        let mut v = b"meta\x0d".to_vec();
        v.push(1 << 2); // 1 module
        s(&mut v, "Balances");
        v.push(0); // no storage
        v.push(1); // calls: Some
        v.push(1 << 2); // 1 call
        s(&mut v, "transfer");
        v.push(1 << 2); // 1 arg
        s(&mut v, "dest");
        s(&mut v, "LookupSource");
        v.push(0); // docs
        v.push(0); // events: None
        v.push(1 << 2); // 1 constant
        s(&mut v, "ExistentialDeposit");
        s(&mut v, "Balance");
        v.push(16 << 2);
        v.extend_from_slice(&[1u8; 16]);
        v.push(0); // docs
        v.push(0); // errors
        v.push(5); // module index
        v.push(4); // extrinsic version
        v.push(1 << 2);
        s(&mut v, "CheckNonce");

        let md = decode(&v).unwrap();
        assert_eq!(md.call_index("Balances", "transfer"), Some((5, 0)));
        assert_eq!(md.constant("Balances", "ExistentialDeposit").unwrap().ty, "Balance");
        assert_eq!(md.signed_extensions, vec!["CheckNonce"]);
    }
}
