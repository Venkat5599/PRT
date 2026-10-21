;; Minimal counter contract for pallet-contracts v3 (schedule v4, seal0 API).
;;
;; Hand-written so the corpus needs no ink!/cargo-contract toolchain that matches
;; Portaldot's 2021 runtime. Storage holds one u64 under the all-zero key.
;;   deploy: counter = 0
;;   call:   counter += 1, emit ContractEmitted(counter as u64 LE), return it
;; Build: bash tests/contracts/build.sh
(module
  (import "seal0" "seal_get_storage" (func $get_storage (param i32 i32 i32) (result i32)))
  (import "seal0" "seal_set_storage" (func $set_storage (param i32 i32 i32)))
  (import "seal0" "seal_deposit_event" (func $deposit_event (param i32 i32 i32 i32)))
  (import "seal0" "seal_return" (func $return (param i32 i32 i32)))
  (import "env" "memory" (memory 1 1))

  ;; [0, 32)  storage key (zeroed)
  ;; [32, 40) counter value, u64 little endian
  ;; [40, 44) out_len for seal_get_storage

  (func (export "deploy")
    (i64.store (i32.const 32) (i64.const 0))
    (call $set_storage (i32.const 0) (i32.const 32) (i32.const 8))
  )

  (func (export "call")
    (i32.store (i32.const 40) (i32.const 8))
    ;; ReturnCode 0 = found; anything else leaves the counter at 0.
    (if (i32.ne (call $get_storage (i32.const 0) (i32.const 32) (i32.const 40)) (i32.const 0))
      (then (i64.store (i32.const 32) (i64.const 0))))
    (i64.store (i32.const 32) (i64.add (i64.load (i32.const 32)) (i64.const 1)))
    (call $set_storage (i32.const 0) (i32.const 32) (i32.const 8))
    (call $deposit_event (i32.const 0) (i32.const 0) (i32.const 32) (i32.const 8))
    (call $return (i32.const 0) (i32.const 32) (i32.const 8))
  )
)
