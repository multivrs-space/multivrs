use anyhow::{Result, bail};
use base64::Engine;
use base64::engine::general_purpose::STANDARD as BASE64;
use builder_core::{ArtifactPayload, BuildOutputPayload};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};

use crate::api::{ApiClient, Deployment};

/// Files sent in parallel when uploading a build.
const UPLOAD_CONCURRENCY: usize = 16;

#[derive(Serialize)]
struct ArtifactMetadataPayload<'a> {
    #[serde(rename = "artifactHash")]
    artifact_hash: &'a str,
    target: &'a str,
    output: &'a BuildOutputPayload,
    files: Vec<ArtifactFileMetadata<'a>>,
}

#[derive(Serialize)]
struct ArtifactFileMetadata<'a> {
    path: &'a str,
    hash: &'a str,
    size: usize,
}

#[derive(Deserialize)]
struct PrepareArtifactResponse {
    uploads: Vec<BlobUpload>,
}

#[derive(Deserialize)]
struct BlobUpload {
    hash: String,
    url: String,
}

impl ApiClient {
    pub(crate) fn deploy_artifact(
        &self,
        project_id: &str,
        deployment_id: &str,
        artifact: &ArtifactPayload,
    ) -> Result<Deployment> {
        let metadata = ArtifactMetadataPayload {
            artifact_hash: &artifact.artifact_hash,
            target: &artifact.target,
            output: &artifact.output,
            files: artifact
                .files
                .iter()
                .map(|file| ArtifactFileMetadata {
                    path: &file.path,
                    hash: &file.hash,
                    size: file.size,
                })
                .collect(),
        };
        let prefix = format!("/api/projects/{project_id}/deployments/{deployment_id}/artifact");
        let prepared: PrepareArtifactResponse =
            self.post_idempotent(&format!("{prefix}/prepare"), &metadata)?;
        // Uploads wait on the network, not the CPU: run many at once, not one per core.
        let pool = rayon::ThreadPoolBuilder::new()
            .num_threads(UPLOAD_CONCURRENCY)
            .build()?;
        pool.install(|| {
            prepared.uploads.par_iter().try_for_each(|upload| {
                let file = artifact
                    .files
                    .iter()
                    .find(|file| file.hash == upload.hash)
                    .ok_or_else(|| anyhow::anyhow!("Missing local blob {}", upload.hash))?;
                let bytes = BASE64.decode(&file.contents_base64)?;
                self.put_blob(&upload.url, bytes)
            })
        })?;
        self.post_idempotent(&format!("{prefix}/complete"), &metadata)
    }

    fn put_blob(&self, path: &str, body: Vec<u8>) -> Result<()> {
        let url = if path.starts_with("http://") || path.starts_with("https://") {
            path.to_string()
        } else {
            format!("{}{}", self.base_url, path)
        };
        // Blobs are content-addressed, so sending one twice is harmless.
        for (attempt, delay) in std::iter::once(None)
            .chain(crate::api::RETRY_DELAYS.iter().map(Some))
            .enumerate()
        {
            if let Some(delay) = delay {
                std::thread::sleep(*delay);
            }
            match self
                .http
                .put(&url)
                .bearer_auth(&self.token)
                .body(body.clone())
                .send()
            {
                Ok(response) if response.status().is_success() => return Ok(()),
                Ok(response) => bail!("a file upload was refused ({})", response.status()),
                Err(error)
                    if crate::api::is_transient(&error)
                        && attempt < crate::api::RETRY_DELAYS.len() => {}
                Err(error) => return Err(crate::api::describe(&error)),
            }
        }
        bail!("a file upload didn't finish")
    }
}
