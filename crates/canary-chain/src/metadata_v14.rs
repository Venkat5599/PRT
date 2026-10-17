//! Decoder for `RuntimeMetadataV14`, the format PortaldotV3 emits.
//!
//! V14 replaces V13's type-name strings with a portable type registry. This
//! module resolves that registry back into readable type names and maps the
//! result onto the same structural model as V13 (`MetadataV13`), so `diff`,
//! `hazards` and `compare` work unchanged across both versions, including
//! mainnet (V13) against V3 (V14).

use std::collections::HashMap;

use anyhow::{bail, Context};

use crate::metadata_v13::{Call, Constant, Event, MetadataV13, Module, Reader, StorageEntry};

const HASHERS: [&str; 7] =
    ["Blake2_128", "Blake2_256", "Blake2_128Concat", "Twox128", "Twox256", "Twox64Concat", "Identity"];

const PRIMITIVES: [&str; 15] =
    ["bool", "char", "str", "u8", "u16", "u32", "u64", "u128", "u256", "i8", "i16", "i32", "i64", "i128", "i256"];

#[derive(Debug, Clone)]
struct Field {
    name: Option<String>,
    ty: u32,
    type_name: Option<String>,
}

#[derive(Debug, Clone)]
struct Variant {
    name: String,
    fields: Vec<Field>,
    index: u8,
}

#[derive(Debug, Clone)]
enum TypeDef {
    Composite(Vec<Field>),
    Variant(Vec<Variant>),
    Sequence(u32),
    Array(u32, u32),
    Tuple(Vec<u32>),
    Primitive(u8),
    Compact(u32),
    BitSequence,
}

#[derive(Debug, Clone)]
struct Type {
    path: Vec<String>,
    params: Vec<Option<u32>>,
    def: TypeDef,
}

/// The portable type registry, indexed by type id.
struct Registry(HashMap<u32, Type>);

impl Reader<'_> {
    fn id(&mut self) -> anyhow::Result<u32> {
        u32::try_from(self.compact()?).context("type id out of range")
    }

    fn u32_le(&mut self) -> anyhow::Result<u32> {
        Ok(u32::from_le_bytes(self.take(4)?.try_into().expect("4 bytes")))
    }
}

fn field(r: &mut Reader) -> anyhow::Result<Field> {
    let name = r.option(|r| r.string())?;
    let ty = r.id()?;
    let type_name = r.option(|r| r.string())?;
    r.docs()?;
    Ok(Field { name, ty, type_name })
}

fn type_def(r: &mut Reader) -> anyhow::Result<TypeDef> {
    Ok(match r.u8()? {
        0 => TypeDef::Composite(r.vec(field)?),
        1 => TypeDef::Variant(r.vec(|r| {
            let name = r.string()?;
            let fields = r.vec(field)?;
            let index = r.u8()?;
            r.docs()?;
            Ok(Variant { name, fields, index })
        })?),
        2 => TypeDef::Sequence(r.id()?),
        3 => {
            let len = r.u32_le()?;
            TypeDef::Array(len, r.id()?)
        }
        4 => TypeDef::Tuple(r.vec(|r| r.id())?),
        5 => {
            let p = r.u8()?;
            if p as usize >= PRIMITIVES.len() {
                bail!("invalid primitive {p}");
            }
            TypeDef::Primitive(p)
        }
        6 => TypeDef::Compact(r.id()?),
        7 => {
            r.id()?;
            r.id()?;
            TypeDef::BitSequence
        }
        t => bail!("invalid type definition tag {t}"),
    })
}

fn registry(r: &mut Reader) -> anyhow::Result<Registry> {
    let types = r.vec(|r| {
        let id = r.id()?;
        let path = r.vec(|r| r.string())?;
        let params = r.vec(|r| {
            r.string()?;
            r.option(|r| r.id())
        })?;
        let def = type_def(r)?;
        r.docs()?;
        Ok((id, Type { path, params, def }))
    })?;
    Ok(Registry(types.into_iter().collect()))
}

impl Registry {
    fn get(&self, id: u32) -> anyhow::Result<&Type> {
        self.0.get(&id).with_context(|| format!("unknown type id {id}"))
    }

    /// Human-readable name, e.g. `Vec<AccountId32>` or `BoundedVec<u8, ..>`.
    fn name(&self, id: u32) -> String {
        self.name_at(id, 0)
    }

    fn name_at(&self, id: u32, depth: usize) -> String {
        let Some(t) = self.0.get(&id) else { return format!("#{id}") };
        if depth > 6 {
            return t.path.last().cloned().unwrap_or_else(|| "..".into());
        }
        let sub = |id: u32| self.name_at(id, depth + 1);
        if let Some(last) = t.path.last() {
            let params: Vec<String> = t.params.iter().map(|p| p.map(sub).unwrap_or_else(|| "_".into())).collect();
            return if params.is_empty() { last.clone() } else { format!("{last}<{}>", params.join(", ")) };
        }
        match &t.def {
            TypeDef::Sequence(e) => format!("Vec<{}>", sub(*e)),
            TypeDef::Array(n, e) => format!("[{}; {n}]", sub(*e)),
            TypeDef::Tuple(xs) if xs.is_empty() => "()".into(),
            TypeDef::Tuple(xs) => format!("({})", xs.iter().map(|x| sub(*x)).collect::<Vec<_>>().join(", ")),
            TypeDef::Primitive(p) => PRIMITIVES[*p as usize].into(),
            TypeDef::Compact(e) => format!("Compact<{}>", sub(*e)),
            TypeDef::BitSequence => "BitVec".into(),
            TypeDef::Composite(fs) => format!("{{{}}}", fs.iter().map(|f| sub(f.ty)).collect::<Vec<_>>().join(", ")),
            TypeDef::Variant(_) => "enum".into(),
        }
    }

    /// Variants of an enum type, sorted by their encoded index.
    fn variants(&self, id: u32) -> anyhow::Result<Vec<Variant>> {
        match &self.get(id)?.def {
            TypeDef::Variant(v) => {
                let mut v = v.clone();
                v.sort_by_key(|x| x.index);
                Ok(v)
            }
            _ => bail!("type {id} is not an enum"),
        }
    }

    /// Prefer the source-level type name (`T::Balance`), as V13 did.
    fn field_type(&self, f: &Field) -> String {
        f.type_name.clone().unwrap_or_else(|| self.name(f.ty))
    }

    fn tuple_items(&self, id: u32) -> Option<Vec<u32>> {
        match &self.0.get(&id)?.def {
            TypeDef::Tuple(xs) => Some(xs.clone()),
            _ => None,
        }
    }
}

fn hasher(r: &mut Reader) -> anyhow::Result<String> {
    let i = r.u8()? as usize;
    HASHERS.get(i).map(|s| s.to_string()).with_context(|| format!("invalid hasher {i}"))
}

fn storage_entry(r: &mut Reader, reg: &Registry) -> anyhow::Result<StorageEntry> {
    let name = r.string()?;
    let optional = r.u8()? == 0;
    let shape = match r.u8()? {
        0 => format!("plain {}", reg.name(r.id()?)),
        1 => {
            let hashers = r.vec(hasher)?;
            let (key, value) = (r.id()?, r.id()?);
            let v = reg.name(value);
            let keys = match reg.tuple_items(key) {
                Some(items) if hashers.len() > 1 && items.len() == hashers.len() => items,
                _ => vec![key],
            };
            let keys: Vec<String> = keys.iter().map(|k| reg.name(*k)).collect();
            match hashers.len() {
                1 => format!("map {} {} => {v}", hashers[0], keys[0]),
                2 if keys.len() == 2 => format!("double_map {} {}, {} {} => {v}", hashers[0], keys[0], hashers[1], keys[1]),
                _ => format!("nmap ({}) [{}] => {v}", keys.join(", "), hashers.join(", ")),
            }
        }
        t => bail!("invalid storage entry type {t} for {name}"),
    };
    r.bytes()?; // default value
    r.docs()?;
    Ok(StorageEntry { name, shape, optional })
}

fn pallet(r: &mut Reader, reg: &Registry) -> anyhow::Result<Module> {
    let name = r.string()?;
    let storage = r.option(|r| {
        let prefix = r.string()?;
        let entries = r.vec(|r| storage_entry(r, reg))?;
        Ok((prefix, entries))
    })?;
    let calls = r.option(|r| r.id())?;
    let event = r.option(|r| r.id())?;
    let constants = r.vec(|r| {
        let name = r.string()?;
        let ty = reg.name(r.id()?);
        let value = format!("0x{}", hex::encode(r.bytes()?));
        r.docs()?;
        Ok(Constant { name, ty, value })
    })?;
    let error = r.option(|r| r.id())?;
    let index = r.u8()?;

    let calls = calls
        .map(|id| -> anyhow::Result<Vec<Call>> {
            Ok(reg
                .variants(id)?
                .into_iter()
                .map(|v| Call {
                    name: v.name,
                    args: v.fields.iter().map(|f| (f.name.clone().unwrap_or_default(), reg.field_type(f))).collect(),
                })
                .collect())
        })
        .transpose()?;
    let events = event
        .map(|id| -> anyhow::Result<Vec<Event>> {
            Ok(reg
                .variants(id)?
                .into_iter()
                .map(|v| Event { name: v.name, args: v.fields.iter().map(|f| reg.field_type(f)).collect() })
                .collect())
        })
        .transpose()?;
    let errors = match error {
        Some(id) => reg.variants(id)?.into_iter().map(|v| v.name).collect(),
        None => Vec::new(),
    };
    let (storage_prefix, storage) = match storage {
        Some((p, e)) => (Some(p), e),
        None => (None, Vec::new()),
    };
    Ok(Module { name, index, storage_prefix, storage, calls, events, constants, errors })
}

/// Decode full prefixed metadata bytes (`b"meta"`, version 14, payload).
pub fn decode(bytes: &[u8]) -> anyhow::Result<MetadataV13> {
    let fp = crate::metadata::fingerprint(bytes)?;
    if fp.version != 14 {
        bail!("expected metadata V14, got V{}", fp.version);
    }
    let mut r = Reader { b: bytes, pos: 5 };
    let reg = registry(&mut r)?;
    let modules = r.vec(|r| pallet(r, &reg))?;
    r.id()?; // extrinsic type
    let extrinsic_version = r.u8()?;
    let signed_extensions = r.vec(|r| {
        let id = r.string()?;
        r.id()?;
        r.id()?;
        Ok(id)
    })?;
    r.id()?; // runtime type
    if r.pos != bytes.len() {
        bail!("{} trailing bytes after metadata", bytes.len() - r.pos);
    }
    Ok(MetadataV13 { modules, extrinsic_version, signed_extensions })
}

/// Decode V13 or V14 into the shared structural model.
pub fn decode_any(bytes: &[u8]) -> anyhow::Result<MetadataV13> {
    match crate::metadata::fingerprint(bytes)?.version {
        13 => crate::metadata_v13::decode(bytes),
        14 => decode(bytes),
        v => bail!("metadata V{v} is not supported (V13 and V14 are)"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn s(v: &mut Vec<u8>, x: &str) {
        v.push((x.len() as u8) << 2);
        v.extend_from_slice(x.as_bytes());
    }

    /// Registry: 0 = u128, 1 = enum Call { transfer(dest: u128 "T::Balance") }.
    fn minimal() -> Vec<u8> {
        let mut v = b"meta\x0e".to_vec();
        v.push(2 << 2); // 2 types
        // type 0: u128
        v.push(0);
        v.push(0); // path
        v.push(0); // params
        v.extend_from_slice(&[5, 7]); // Primitive u128
        v.push(0); // docs
        // type 1: enum Call
        v.push(1 << 2);
        v.push(1 << 2);
        s(&mut v, "Call");
        v.push(0); // params
        v.push(1); // Variant
        v.push(1 << 2); // 1 variant
        s(&mut v, "transfer");
        v.push(1 << 2); // 1 field
        v.push(1);
        s(&mut v, "value");
        v.push(0); // ty 0
        v.push(1);
        s(&mut v, "T::Balance");
        v.push(0); // field docs
        v.push(3); // variant index
        v.push(0); // variant docs
        v.push(0); // type docs
        // pallets
        v.push(1 << 2);
        s(&mut v, "Balances");
        v.push(1); // storage: Some
        s(&mut v, "Balances");
        v.push(1 << 2);
        s(&mut v, "TotalIssuance");
        v.push(1); // Default
        v.push(0); // Plain
        v.push(0); // ty 0
        v.push(16 << 2);
        v.extend_from_slice(&[0u8; 16]);
        v.push(0); // docs
        v.push(1); // calls: Some
        v.push(1 << 2); // ty 1
        v.push(0); // event: None
        v.push(1 << 2); // 1 constant
        s(&mut v, "ExistentialDeposit");
        v.push(0); // ty 0
        v.push(16 << 2);
        v.extend_from_slice(&[1u8; 16]);
        v.push(0); // docs
        v.push(0); // error: None
        v.push(5); // pallet index
        v.push(1 << 2); // extrinsic ty
        v.push(4); // version
        v.push(1 << 2);
        s(&mut v, "CheckNonce");
        v.push(0);
        v.push(0);
        v.push(0); // runtime ty
        v
    }

    #[test]
    fn decodes_minimal_v14() {
        let md = decode(&minimal()).unwrap();
        assert_eq!(md.call_index("Balances", "transfer"), Some((5, 0)));
        let call = &md.module("Balances").unwrap().calls.as_ref().unwrap()[0];
        assert_eq!(call.args, vec![("value".to_string(), "T::Balance".to_string())]);
        assert_eq!(md.constant("Balances", "ExistentialDeposit").unwrap().ty, "u128");
        assert_eq!(md.module("Balances").unwrap().storage[0].shape, "plain u128");
        assert_eq!(md.signed_extensions, vec!["CheckNonce"]);
    }

    #[test]
    fn decode_any_routes_by_version() {
        assert!(decode_any(&minimal()).is_ok());
        assert!(decode_any(b"meta\x0f").is_err());
    }
}
