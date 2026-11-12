FROM docker.io/library/rust:1.90-bookworm AS cli-builder

ENV CARGO_HTTP_TIMEOUT=600
ENV CARGO_HTTP_LOW_SPEED_LIMIT=1
WORKDIR /source
COPY Cargo.toml Cargo.lock ./
COPY packages/builder-core packages/builder-core
COPY packages/cli packages/cli
COPY packages/cli-auth packages/cli-auth
COPY packages/cli-config packages/cli-config
COPY packages/firewall-core packages/firewall-core
COPY packages/routing-matcher-wasm packages/routing-matcher-wasm
RUN cargo build --locked --release -p cli

FROM docker.io/cloudflare/sandbox:0.10.3

USER root
# No Rust toolchain in the machine: it was ~1.3 GB of every cold start, and
# customer builds don't use it (swift-rust ships a prebuilt Linux binary).
ENV PATH=/root/.bun/bin:/usr/local/bin:/usr/bin:/bin
# Pinned publisher: runtime deploys never resolve wrangler from a customer's node_modules.
RUN bun install -g wrangler@4.152.0 && /root/.bun/bin/wrangler --version
# The CLI changes most often, so it goes last: a CLI-only change rebuilds and
# uploads just this small layer.
COPY --from=cli-builder /source/target/release/multivrs /usr/local/bin/multivrs
RUN multivrs --version && /usr/local/bin/bun --version

WORKDIR /workspace
