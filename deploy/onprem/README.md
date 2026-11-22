# Mosaic OMS on-prem box

Runs Mosaic OMS on a single Linux machine at the church instead of AWS.
Auth0 stays as-is. The database is MySQL in a container on the box.

```
 developer pushes to main
        │
        ├─► GitHub Actions builds image ──► ghcr.io/milesressler/mosaic-oms:main
        │
        └─► deploy/onprem/** (scripts + config) stays in git
                                   ▲
 church box (every 5 min, outbound only) ──┘  git pull + docker pull
        │   changed? → backup DB → deploy → health check → rollback if unhealthy
        ▼
  caddy (HTTPS) or cloudflared ─► app :8080 ─► mysql (/var/lib/mosaic/mysql)
```

The box only makes **outbound** connections. Nothing needs to reach into the
church network to deploy or reconfigure it.

---

## For the church admin

### Install (once)

You need: Ubuntu 22.04/24.04 or Debian 12, 2+ CPU cores, 4 GB+ RAM, 20 GB+ disk.

```bash
curl -fsSL https://raw.githubusercontent.com/milesressler/mosaic-oms/main/deploy/onprem/install.sh | sudo bash
```

It asks for:

1. **Hostname**: the address people type, e.g. `portal.mosaicstreetministry.com`.
   Point that DNS name at the church's public IP (caddy) or set it up in
   Cloudflare (cloudflared).
2. **caddy or cloudflared**:
   * `caddy`: forward ports **80 and 443** on the router to this box. Certificates are automatic.
   * `cloudflared`: no router changes. Needs a Cloudflare Tunnel token from the developer.
3. **Email**: for certificate expiry notices (caddy only).
4. **Tailscale**: say yes if the developer may need to help remotely.

At the end it prints a **public key** (`age1...`). Send it to the developer.
It is not a password and it's fine to email.

### Day to day

There's nothing to do. Updates install themselves, and the database is backed up every night.

| Command | What it does |
|---|---|
| `mosaic status` | Running version, health, last backup |
| `sudo mosaic logs app` | Live app logs (Ctrl-C to quit) |
| `sudo mosaic restart` | Restart everything |
| `sudo mosaic rollback` | Go back to the previous version if a new one misbehaves |
| `sudo mosaic backup` | Take a database backup now |
| `sudo mosaic override` | Change a setting locally (wins over the developer's config) |

Backups are in `/var/lib/mosaic/backups` (30 days kept). **Copy them off the
box regularly** (USB drive, NAS, cloud). A dead disk with no offsite copy loses
everything.

### Where things live

| Path | What |
|---|---|
| `/etc/mosaic/box.env` | This box's settings and generated DB passwords. Keep private. |
| `/etc/mosaic/age.key` | Key that unlocks the developer's encrypted settings. Keep private; back it up. |
| `/etc/mosaic/override.env` | Your local overrides (`mosaic override`) |
| `/var/lib/mosaic/mysql` | The database |
| `/var/lib/mosaic/backups` | Nightly dumps |
| `/opt/mosaic/src` | Managed copy of the code. **Don't edit**: it is reset on every update. |

---

## For the developer

### One-time setup

1. **Make the image pullable.** After the first run of `.github/workflows/onprem-image.yml`,
   open the `mosaic-oms` package on GitHub → Package settings → change visibility to **Public**.
   It contains nothing secret. If you'd rather keep it private, put a PAT with
   `read:packages` in `REGISTRY_USER`/`REGISTRY_TOKEN` in the box's `/etc/mosaic/box.env`.

2. **Create your own age key** (once, on your laptop):
   ```bash
   brew install sops age          # or apt install age + sops release binary
   age-keygen -o ~/.config/sops/age/keys.txt
   ```

3. **Fill in `config/.sops.yaml`** with your public key and the box's key (from
   the installer output or `mosaic status`).

4. **Create the secrets file:**
   ```bash
   cd deploy/onprem/config
   cp secrets.example.env secrets.env   # fill in real values (copy from the ECS task)
   sops encrypt -i secrets.env
   git add .sops.yaml secrets.env && git commit -m "On-prem secrets" && git push
   ```
   Also uncomment and fill the required non-secret values in `config/app.env`.

5. **Auth0**: add `https://<hostname>/callback` to Allowed Callback URLs and
   `https://<hostname>` to Allowed Logout URLs / Web Origins of the SPA app.
   (Not needed if the box takes over `portal.mosaicstreetministry.com`.)

6. **Move the data** from RDS:
   ```bash
   mysqldump -h <rds-host> -u <user> -p --single-transaction --set-gtid-purged=OFF \
     --routines --triggers mosaicoms | gzip > mosaic.sql.gz
   scp mosaic.sql.gz box:/tmp/ && ssh box sudo mosaic restore /tmp/mosaic.sql.gz
   ```
   `restore` strips RDS `DEFINER`/GTID lines, so the dump imports cleanly.

### Shipping code

Push to `main`. Actions builds `ghcr.io/milesressler/mosaic-oms:main`; the box
notices within ~5 minutes. Before switching it takes a DB backup, then waits up to 10
minutes for `/api/actuator/health` to report `UP`. If it never does, it rolls back
to the last good version and holds the bad one back until you push again.

Check what's deployed from anywhere: `https://<hostname>/api/actuator/info`
(git commit). With `DEPLOY_WEBHOOK_URL` set, every deploy, rollback, and failed
backup is posted to Slack.

### Changing config remotely

All remote configuration is **git**. Nothing listens for inbound connections.

| Change | How |
|---|---|
| Non-secret setting | Edit `config/app.env`, push |
| Secret / API key | `sops deploy/onprem/config/secrets.env` (opens decrypted in `$EDITOR`), push |
| Rotate who can decrypt | Edit `.sops.yaml`, `sops updatekeys config/secrets.env`, push |
| Emergency shell | `tailscale ssh <box>` (if installed) |

Any Spring property works. Write it in env-var form: `auth0.clientId` →
`AUTH0_CLIENTID`, `mosaic.oms.something-else` → `MOSAIC_OMS_SOMETHINGELSE`.

Precedence, lowest to highest: `application.yml` → `config/app.env` →
`config/secrets.env` → box `/etc/mosaic/override.env`.

**Why it's safe in a public repo:** `secrets.env` values are encrypted to
specific age public keys; only your laptop and the box's `/etc/mosaic/age.key`
can decrypt them. Key *names* are visible, values are not. If you'd rather
not publish even ciphertext, move `config/` to a private repo and give the box a
read-only deploy key. The scripts only need `MOSAIC_SRC` to point at a
checkout containing `deploy/onprem/`.

**Trust boundary:** the box runs whatever is on `main` of this repo (scripts as
root, image as the app). Protect `main` with branch protection. That's the
same trust you already give the AWS pipeline.
