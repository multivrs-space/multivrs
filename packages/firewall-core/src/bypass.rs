use base64::Engine;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FirewallBypassPayload {
    pub expires_at: u64,
    pub path_prefix: String,
    pub project_id: String,
    pub subject: String,
}

/// Computes HMAC-SHA256 according to RFC 2104.
pub fn hmac_sha256(key: &[u8], data: &[u8]) -> [u8; 32] {
    let mut key_block = [0u8; 64];
    if key.len() > 64 {
        let hash = Sha256::digest(key);
        key_block[..32].copy_from_slice(&hash);
    } else {
        key_block[..key.len()].copy_from_slice(key);
    }

    let mut ipad = [0u8; 64];
    let mut opad = [0u8; 64];
    for i in 0..64 {
        ipad[i] = key_block[i] ^ 0x36;
        opad[i] = key_block[i] ^ 0x5c;
    }

    let mut inner = Sha256::new();
    inner.update(ipad);
    inner.update(data);
    let inner_hash = inner.finalize();

    let mut outer = Sha256::new();
    outer.update(opad);
    outer.update(inner_hash);
    outer.finalize().into()
}

/// Constant-time slice comparison to prevent timing side-channel attacks.
pub fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut diff = 0u8;
    for (&x, &y) in a.iter().zip(b.iter()) {
        diff |= x ^ y;
    }
    diff == 0
}

/// Creates a signed firewall bypass token in format: `<base64url_payload>.<base64url_sig>`.
pub fn create_firewall_bypass_token(
    payload: &FirewallBypassPayload,
    secret: &str,
) -> Result<String, String> {
    let json_bytes = serde_json::to_vec(payload).map_err(|e| e.to_string())?;
    let body_b64 = URL_SAFE_NO_PAD.encode(json_bytes);
    let sig = hmac_sha256(secret.as_bytes(), body_b64.as_bytes());
    let sig_b64 = URL_SAFE_NO_PAD.encode(sig);
    Ok(format!("{body_b64}.{sig_b64}"))
}

/// Verifies a signed firewall bypass token against expected project, path prefix, and expiration.
pub fn verify_firewall_bypass_token(
    token: &str,
    secret: &str,
    expected_project_id: &str,
    expected_path: &str,
    current_time_ms: u64,
) -> bool {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 2 {
        return false;
    }
    let body_b64 = parts[0];
    let sig_b64 = parts[1];

    let Ok(sig_bytes) = URL_SAFE_NO_PAD.decode(sig_b64) else {
        return false;
    };

    let expected_sig = hmac_sha256(secret.as_bytes(), body_b64.as_bytes());
    if !constant_time_eq(&sig_bytes, &expected_sig) {
        return false;
    }

    let Ok(body_bytes) = URL_SAFE_NO_PAD.decode(body_b64) else {
        return false;
    };

    let Ok(payload) = serde_json::from_slice::<FirewallBypassPayload>(&body_bytes) else {
        return false;
    };

    if payload.expires_at <= current_time_ms {
        return false;
    }

    if payload.project_id != expected_project_id {
        return false;
    }

    matches_path(expected_path, &payload.path_prefix)
}

fn matches_path(path: &str, prefix: &str) -> bool {
    let clean = prefix.trim_end_matches('/');
    if prefix == "/" || clean.is_empty() {
        return true;
    }
    path == clean || path.starts_with(&format!("{clean}/"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rfc4231_test_case_1() {
        // RFC 4231 Test Case 1:
        // Key = 0x0b repeated 20 times
        // Data = "Hi There"
        // Digest = b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7
        let key = [0x0bu8; 20];
        let data = b"Hi There";
        let sig = hmac_sha256(&key, data);
        let hex_sig: String = sig.iter().map(|b| format!("{b:02x}")).collect();
        assert_eq!(
            hex_sig,
            "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7"
        );
    }

    #[test]
    fn creates_and_verifies_bypass_token() {
        let payload = FirewallBypassPayload {
            expires_at: 2000000000000,
            path_prefix: "/admin".to_string(),
            project_id: "prj_123".to_string(),
            subject: "test-user".to_string(),
        };

        let secret = "super-secret-key-32-bytes-long!";
        let token = create_firewall_bypass_token(&payload, secret).unwrap();

        // Valid verification
        assert!(verify_firewall_bypass_token(
            &token,
            secret,
            "prj_123",
            "/admin/dashboard",
            1000000000000
        ));

        // Root prefix matches everything
        let root_payload = FirewallBypassPayload {
            expires_at: 2000000000000,
            path_prefix: "/".to_string(),
            project_id: "prj_123".to_string(),
            subject: "test-user".to_string(),
        };
        let root_token = create_firewall_bypass_token(&root_payload, secret).unwrap();
        assert!(verify_firewall_bypass_token(
            &root_token,
            secret,
            "prj_123",
            "/any/nested/path",
            1000000000000
        ));

        // Rejects tampered token
        let tampered = format!("{token}tamper");
        assert!(!verify_firewall_bypass_token(
            &tampered,
            secret,
            "prj_123",
            "/admin/dashboard",
            1000000000000
        ));

        // Rejects wrong project
        assert!(!verify_firewall_bypass_token(
            &token,
            secret,
            "prj_wrong",
            "/admin/dashboard",
            1000000000000
        ));

        // Rejects mismatched path
        assert!(!verify_firewall_bypass_token(
            &token,
            secret,
            "prj_123",
            "/public/assets",
            1000000000000
        ));

        // Rejects expired token
        assert!(!verify_firewall_bypass_token(
            &token,
            secret,
            "prj_123",
            "/admin/dashboard",
            3000000000000
        ));
    }
}
