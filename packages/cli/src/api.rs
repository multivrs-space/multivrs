use anyhow::{Result, bail};
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

/// Uploads can be large and a dev server may compile a route on first use.
const REQUEST_TIMEOUT: Duration = Duration::from_secs(300);
const CONNECT_TIMEOUT: Duration = Duration::from_secs(15);
pub(crate) const RETRY_DELAYS: [Duration; 2] = [Duration::from_secs(2), Duration::from_secs(5)];

/// A network failure in words a customer can act on, without URLs.
pub(crate) fn describe(error: &reqwest::Error) -> anyhow::Error {
    if error.is_timeout() {
        anyhow::anyhow!("the Multivrs API didn't answer in time")
    } else if error.is_connect() {
        anyhow::anyhow!("couldn't reach the Multivrs API")
    } else {
        anyhow::anyhow!("the request to the Multivrs API failed")
    }
}

/// Worth trying again: the request never got a clear answer.
pub(crate) fn is_transient(error: &reqwest::Error) -> bool {
    error.is_timeout() || error.is_connect() || error.is_request()
}

#[derive(Debug, Deserialize)]
struct ApiErrorBody {
    error: ApiErrorMessage,
}

#[derive(Debug, Deserialize)]
struct ApiErrorMessage {
    message: String,
}

#[derive(Debug, Deserialize)]
pub(crate) struct Deployment {
    pub(crate) id: String,
    pub(crate) url: Option<String>,
}

pub(crate) struct ApiClient {
    pub(crate) base_url: String,
    pub(crate) token: String,
    pub(crate) http: Client,
}

impl ApiClient {
    pub(crate) fn new(token: String) -> Self {
        Self {
            base_url: std::env::var("MULTIVRS_API_URL")
                .unwrap_or_else(|_| "http://localhost:3000".to_string())
                .trim_end_matches('/')
                .to_string(),
            token,
            http: Client::builder()
                .timeout(REQUEST_TIMEOUT)
                .connect_timeout(CONNECT_TIMEOUT)
                .build()
                .unwrap_or_else(|_| Client::new()),
        }
    }

    pub(crate) fn create_deployment(&self, project_id: &str, target: &str) -> Result<Deployment> {
        self.post(
            &format!("/api/projects/{project_id}/deployments"),
            &serde_json::json!({ "target": target }),
        )
    }

    pub(crate) fn update_status(
        &self,
        project_id: &str,
        deployment_id: &str,
        status: &str,
        message: Option<&str>,
    ) -> Result<Deployment> {
        let body = match message {
            Some(message) => serde_json::json!({ "status": status, "message": message }),
            None => serde_json::json!({ "status": status }),
        };
        self.post(
            &format!("/api/projects/{project_id}/deployments/{deployment_id}/status"),
            &body,
        )
    }

    pub(crate) fn append_log(
        &self,
        project_id: &str,
        deployment_id: &str,
        level: &str,
        message: &str,
    ) -> Result<serde_json::Value> {
        self.post(
            &format!("/api/projects/{project_id}/deployments/{deployment_id}/logs"),
            &serde_json::json!({ "level": level, "message": crate::deploy::truncate_log(message) }),
        )
    }

    /// POST that may be retried: only for requests that are safe to repeat.
    pub(crate) fn post_idempotent<T: for<'de> Deserialize<'de>, B: Serialize>(
        &self,
        path: &str,
        body: &B,
    ) -> Result<T> {
        self.post_with(path, body, true)
    }

    pub(crate) fn post<T: for<'de> Deserialize<'de>, B: Serialize>(
        &self,
        path: &str,
        body: &B,
    ) -> Result<T> {
        self.post_with(path, body, false)
    }

    fn post_with<T: for<'de> Deserialize<'de>, B: Serialize>(
        &self,
        path: &str,
        body: &B,
        retry: bool,
    ) -> Result<T> {
        let mut attempt = 0;
        let response = loop {
            match self
                .http
                .post(format!("{}{}", self.base_url, path))
                .bearer_auth(&self.token)
                .json(body)
                .send()
            {
                Ok(response) => break response,
                Err(error) if retry && is_transient(&error) && attempt < RETRY_DELAYS.len() => {
                    std::thread::sleep(RETRY_DELAYS[attempt]);
                    attempt += 1;
                }
                Err(error) => return Err(describe(&error)),
            }
        };
        let status = response.status();
        if !status.is_success() {
            let message = response
                .json::<ApiErrorBody>()
                .map(|body| body.error.message)
                .unwrap_or_else(|_| format!("request failed ({status})"));
            bail!(message);
        }
        response.json().map_err(|error| describe(&error))
    }
}
