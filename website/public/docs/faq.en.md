# FAQ

This page collects the most frequently asked questions from the community.
Click a question to expand the answer.

---

### AdClaw vs OpenClaw: Feature Comparison

Please check the [Comparison](/docs/comparison) page for detailed feature comparison.

### How to install AdClaw

AdClaw supports multiple installation methods. See
[Quick Start](https://adclaw.agentscope.io/docs/quickstart) for details:

1. One-line installer (sets up Python automatically)

```
# macOS / Linux:
curl -fsSL https://adclaw.agentscope.io/install.sh | bash
# Windows (PowerShell):
irm https://adclaw.agentscope.io/install.ps1 | iex
# For latest instructions, refer to docs and prefer pip if needed.
```

2. Install with pip

Python version requirement: >= 3.10, < 3.14

```
pip install adclaw
```

3. Install with Docker

If Docker is installed, run the following commands and then open
`http://127.0.0.1:8088/` in your browser:

```
docker pull citedy/adclaw:latest
docker run -p 8088:8088 -v adclaw-data:/app/working citedy/adclaw:latest
```

> **⚠️ Special Notice for Windows Enterprise LTSC Users**
>
> If you are using Windows LTSC or an enterprise environment governed by strict security policies, PowerShell may run in **Constrained Language Mode**, potentially causing the following issue:
>
> 1. **If using CMD (.bat): Script executes successfully but fails to write to `Path`**
>
>    The script completes file installation. Due to **Constrained Language Mode**, it cannot automatically update environment variables. Manually configure as follows:
>
>    - **Locate the installation directory**:
>      - Check if `uv` is available: Enter `uv --version` in CMD. If a version number appears, **only configure the AdClaw path**. If you receive the prompt `'uv' is not recognized as an internal or external command, operable program or batch file,` configure both paths.
>      - uv path (choose one based on installation location; use if step 1 fails): Typically `%USERPROFILE%\.local\bin`, `%USERPROFILE%\AppData\Local\uv`, or the `Scripts` folder within your Python installation directory
>      - AdClaw path: Typically located at `%USERPROFILE%\.adclaw\bin`.
>    - **Manually add to the system's Path environment variable**:
>      - Press `Win + R`, type `sysdm.cpl` and press Enter to open System Properties.
>      - Click “Advanced” -> “Environment Variables”.
>      - Under “System variables”, locate and select `Path`, then click “Edit”.
>      - Click “New”, enter both directory paths sequentially, then click OK to save.
>
> 2. **If using PowerShell (.ps1): Script execution interrupted**
>
> Due to **Constrained Language Mode**, the script may fail to automatically download `uv`.
>
> - **Manually install uv**: Refer to the [GitHub Release](https://github.com/astral-sh/uv/releases) to download `uv.exe` and place it in `%USERPROFILE%\.local\bin` or `%USERPROFILE%\AppData\Local\uv`; or ensure Python is installed and run `python -m pip install -U uv`.
> - **Configure `uv` environment variables**: Add the `uv` directory and `%USERPROFILE%\.adclaw\bin` to your system's `Path` variable.
> - **Re-run the installation**: Open a new terminal and execute the installation script again to complete the `AdClaw` installation.
> - **Configure the `AdClaw` environment variable**: Add `%USERPROFILE%\.adclaw\bin` to your system's `Path` variable.

### How to update AdClaw

To update AdClaw, use the method matching your installation type:

1. If installed via one-line script, re-run the installer to upgrade.

2. If installed via pip, run:

```
pip install --upgrade adclaw
```

3. If installed from source, pull the latest code and reinstall:

```
cd AdClaw
git pull origin main
pip install -e .
```

4. If using Docker, pull the latest image and restart the container:

```
docker pull citedy/adclaw:latest
docker run -p 8088:8088 -v adclaw-data:/app/working citedy/adclaw:latest
```

After upgrading, restart the service with `adclaw app`.

### How to initialize and start AdClaw service

Recommended quick initialization:

```bash
adclaw init --defaults
```

Start service:

```bash
adclaw app
```

The default Console URL is `http://127.0.0.1:8088/`. After quick init, you can
open Console and customize settings. See
[Quick Start](https://adclaw.agentscope.io/docs/quickstart).

### Open-source repository

AdClaw is open source. Official repository:
`https://github.com/agentscope-ai/AdClaw`

### Where to check latest version upgrade details

You can check version changes in AdClaw GitHub
[Releases](https://github.com/agentscope-ai/AdClaw/releases).

### How to configure models

In Console, go to **Settings -> Models**. See
[Console -> Models](https://adclaw.agentscope.io/docs/console#models) for
details.

- Cloud models: fill provider API key (ModelScope, DashScope, or custom), then
  choose the active model.
- Local models: supports `llama.cpp`, `MLX`, and Ollama. After download, select
  the active model on the same page.

You can also use `adclaw models` CLI commands for configuration, download, and
switching. See
[CLI -> Models and Environment Variables -> adclaw models](https://adclaw.agentscope.io/docs/cli#adclaw-models).

### How to manage Skills

Go to **Agent -> Skills** in Console. You can enable/disable Skills, create
custom Skills, and import Skills from Skills Hub. See
[Skills](https://adclaw.agentscope.io/docs/skills).

### How to configure MCP

Go to **Agent -> MCP** in Console. You can enable/disable/delete/create MCP
clients there. See [MCP](https://adclaw.agentscope.io/docs/mcp).

### Common error

1. Error pattern: `You didn't provide an API key`

Error detail:

```
Error: Unknown agent error: AuthenticationError: Error code: 401 - {'error': {'message': "You didn't provide an API key. You need to provide your API key in an Authorization header using Bearer auth (i.e. Authorization: Bearer YOUR_KEY). ", 'type': 'invalid_request_error', 'param': None, 'code': None}, 'request_id': 'xxx'}
```

Cause 1: model API key is not configured. Get an API key and configure it in
**Console -> Settings -> Models**.

Cause 2: key is configured but still fails. In most cases, one of the
configuration fields is incorrect (for example `base_url`, `api key`, or model
name).

AdClaw supports API keys obtained via DashScope Coding Plan. If it still fails,
please check:

- whether `base_url` is correct;
- whether the API key is copied completely (no extra spaces);
- whether the model name exactly matches the provider value (case-sensitive).

Reference for the correct key acquisition flow:
https://help.aliyun.com/zh/model-studio/coding-plan-quickstart#2531c37fd64f9

---

### How to get support when errors occur

To speed up troubleshooting and fixes, please create an issue in the AdClaw
GitHub repository and include complete error information:
https://github.com/agentscope-ai/AdClaw/issues

In many Console errors, a detailed error file path is included. For example:

Error: Unknown agent error: AuthenticationError: Error code: 401 - {'error': {'message': "You didn't provide an API key. You need to provide your API key in an Authorization header using Bearer auth (i.e. Authorization: Bearer YOUR_KEY). ", 'type': 'invalid_request_error', 'param': None, 'code': None}, 'request_id': 'xxx'}(Details: /var/folders/.../adclaw_query_error_qzbx1mv1.json)

Please upload that file (for example
`/var/folders/.../adclaw_query_error_qzbx1mv1.json`) together with your current
model provider, model name, and exact AdClaw version.
