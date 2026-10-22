pub mod bypass;
pub mod evaluate;
pub mod schema;

pub use bypass::{
    FirewallBypassPayload, constant_time_eq, create_firewall_bypass_token, hmac_sha256,
    verify_firewall_bypass_token,
};
pub use evaluate::evaluate_firewall;
pub use schema::{
    ConditionOp, ConditionType, ConditionValue, FirewallAction, FirewallCondition,
    FirewallDecision, FirewallRequest, FirewallRule,
};

use serde::{Deserialize, Serialize};
use std::mem;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EvaluateInput {
    rules: Vec<FirewallRule>,
    request: FirewallRequest,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VerifyBypassInput {
    token: String,
    secret: String,
    expected_project_id: String,
    expected_path: String,
    #[serde(default)]
    current_time_ms: Option<u64>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateBypassInput {
    payload: FirewallBypassPayload,
    secret: String,
}

#[derive(Serialize)]
struct CreateBypassOutput {
    token: Option<String>,
    error: Option<String>,
}

#[unsafe(no_mangle)]
pub extern "C" fn alloc(length: usize) -> *mut u8 {
    let mut bytes = Vec::<u8>::with_capacity(length);
    let pointer = bytes.as_mut_ptr();
    mem::forget(bytes);
    pointer
}

#[unsafe(no_mangle)]
/// Releases a buffer previously returned by [`alloc`].
///
/// # Safety
///
/// `pointer` must come from `alloc(length)`, must not have been released, and
/// `length` must be the exact capacity originally requested.
pub unsafe extern "C" fn dealloc(pointer: *mut u8, length: usize) {
    if !pointer.is_null() {
        drop(unsafe { Vec::from_raw_parts(pointer, 0, length) });
    }
}

#[unsafe(no_mangle)]
/// Evaluates a JSON-encoded `{ "rules": [...], "request": {...} }` and returns a packed buffer.
///
/// # Safety
///
/// `pointer` must reference a readable allocation containing at least `length`
/// bytes for the duration of this call. The returned buffer must be released
/// with [`dealloc`] after the caller has copied its contents.
pub unsafe extern "C" fn evaluate_firewall_json(pointer: *const u8, length: usize) -> u64 {
    let bytes = unsafe { std::slice::from_raw_parts(pointer, length) };
    let output = serde_json::from_slice::<EvaluateInput>(bytes)
        .map(|input| evaluate_firewall(&input.rules, &input.request))
        .and_then(|result| serde_json::to_vec(&result))
        .unwrap_or_else(|_| b"{\"action\":\"allow\"}".to_vec());
    pack_output(output)
}

#[unsafe(no_mangle)]
/// Verifies a JSON-encoded `{ "token": "...", "secret": "...", "expectedProjectId": "...", "expectedPath": "...", "currentTimeMs": 123 }`.
/// Returns 1 if valid, 0 otherwise.
///
/// # Safety
///
/// `pointer` must reference a readable allocation containing at least `length`
/// bytes for the duration of this call.
pub unsafe extern "C" fn verify_bypass_token_json(pointer: *const u8, length: usize) -> i32 {
    let bytes = unsafe { std::slice::from_raw_parts(pointer, length) };
    let Ok(input) = serde_json::from_slice::<VerifyBypassInput>(bytes) else {
        return 0;
    };
    let now = input.current_time_ms.unwrap_or(0);
    if verify_firewall_bypass_token(
        &input.token,
        &input.secret,
        &input.expected_project_id,
        &input.expected_path,
        now,
    ) {
        1
    } else {
        0
    }
}

#[unsafe(no_mangle)]
/// Creates a bypass token from a JSON-encoded `{ "payload": {...}, "secret": "..." }`.
///
/// # Safety
///
/// `pointer` must reference a readable allocation containing at least `length`
/// bytes for the duration of this call.
pub unsafe extern "C" fn create_bypass_token_json(pointer: *const u8, length: usize) -> u64 {
    let bytes = unsafe { std::slice::from_raw_parts(pointer, length) };
    let result = match serde_json::from_slice::<CreateBypassInput>(bytes) {
        Ok(input) => match create_firewall_bypass_token(&input.payload, &input.secret) {
            Ok(token) => CreateBypassOutput {
                token: Some(token),
                error: None,
            },
            Err(err) => CreateBypassOutput {
                token: None,
                error: Some(err),
            },
        },
        Err(err) => CreateBypassOutput {
            token: None,
            error: Some(err.to_string()),
        },
    };
    let output = serde_json::to_vec(&result).unwrap_or_default();
    pack_output(output)
}

fn pack_output(mut output: Vec<u8>) -> u64 {
    output.shrink_to_fit();
    let length = output.len() as u64;
    let pointer = output.as_mut_ptr() as u64;
    mem::forget(output);
    (length << 32) | pointer
}
