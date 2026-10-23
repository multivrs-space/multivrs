FROM node:24.22.1-bookworm-slim AS node

FROM docker.io/oven/bun:1.3.5-debian

# Debian's nodejs package is not a patched release. CVE-2026-111497 is fixed in 24.22.1.
COPY --from=node /usr/local/bin/node /usr/local/bin/node

RUN apt-get update \
  && apt-get install --yes --no-install-recommends python3 ruby ruby-bundler ca-certificates \
  && node --version | grep -qx 'v24.22.1' \
  && rm -rf /var/lib/apt/lists/* \
  && useradd --create-home --uid 10001 runtime \
  && mkdir -p /runtime \
  && chown runtime:runtime /runtime

USER runtime
WORKDIR /runtime
ENTRYPOINT ["sleep", "infinity"]
