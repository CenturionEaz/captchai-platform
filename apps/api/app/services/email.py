"""
Email service using Resend API.
All email sending is SERVER-SIDE ONLY.
The RESEND_API_KEY is never exposed to the frontend.
"""
import logging
import os
from typing import Optional
import httpx

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM = f"{os.getenv('RESEND_FROM_NAME', 'CaptchaIQ Research')} <{os.getenv('RESEND_FROM_EMAIL', 'noreply@captchaiq.dev')}>"
RESEND_BASE_URL = "https://api.resend.com"


async def send_email(
    to: str,
    subject: str,
    html: str,
    reply_to: Optional[str] = None,
) -> dict:
    """Send a single email via Resend API."""
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — email not sent")
        return {"skipped": True}

    payload = {
        "from": RESEND_FROM,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    if reply_to:
        payload["reply_to"] = reply_to

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{RESEND_BASE_URL}/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=10.0,
        )
        response.raise_for_status()
        result = response.json()
        logger.info(f"Email sent to {to} — id: {result.get('id')}")
        return result


# ─── Email Templates ────────────────────────────────────────────────────────

def _base_template(content: str, preview: str = "") -> str:
    """Base cyberpunk-themed email layout."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CaptchaIQ Research</title>
  <meta name="color-scheme" content="dark" />
  {f'<meta name="description" content="{preview}" />' if preview else ""}
</head>
<body style="margin:0;padding:0;background:#020617;font-family:'Segoe UI',system-ui,sans-serif;">
  <!-- Preheader (invisible preview text) -->
  {f'<span style="display:none;max-height:0;overflow:hidden;">{preview}</span>' if preview else ""}

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding-bottom:32px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:12px;">
              <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#00d4ff,#8b5cf6);display:inline-block;text-align:center;line-height:40px;">
                <span style="color:white;font-size:20px;">👁</span>
              </div>
              <span style="color:white;font-size:20px;font-weight:900;letter-spacing:-0.5px;">CaptchaIQ</span>
            </div>
            <div style="color:#00d4ff;font-size:10px;font-weight:700;letter-spacing:4px;margin-top:4px;">RESEARCH PLATFORM</div>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:rgba(15,23,42,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px;backdrop-filter:blur(16px);">
            {content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding-top:32px;text-align:center;">
            <p style="color:#475569;font-size:12px;margin:0;">
              CaptchaIQ Research Platform · Authorized research use only
            </p>
            <p style="color:#334155;font-size:11px;margin:8px 0 0;">
              <a href="https://captchaiq.dev/ethics" style="color:#334155;">Ethics Policy</a> ·
              <a href="https://captchaiq.dev/security" style="color:#334155;">Security</a> ·
              <a href="https://captchaiq.dev/unsubscribe" style="color:#334155;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def welcome_email_html(name: str, email: str) -> str:
    content = f"""
      <h1 style="color:white;font-size:24px;font-weight:900;margin:0 0 8px;">Welcome to CaptchaIQ 👋</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">Your research account has been created.</p>

      <div style="background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.15);border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">Signed in as</p>
        <p style="color:white;font-size:16px;font-weight:700;margin:0;">{name}</p>
        <p style="color:#00d4ff;font-size:13px;margin:4px 0 0;">{email}</p>
      </div>

      <p style="color:#64748b;font-size:13px;margin:0 0 24px;">
        You now have access to the full CaptchaIQ research suite including the CAPTCHA Generator,
        Research Lab, AI pipeline analysis, and model training system.
      </p>

      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://captchaiq.dev/dashboard"
           style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#0284c7);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">
          Open Research Dashboard →
        </a>
      </div>

      <div style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:16px;">
        <p style="color:#f59e0b;font-size:12px;font-weight:700;margin:0 0 4px;">⚠️ Research Use Only</p>
        <p style="color:#78716c;font-size:12px;margin:0;">
          This platform is restricted to authorized AI research, accessibility testing, and educational use.
          Do not use for unauthorized or malicious purposes.
        </p>
      </div>
    """
    return _base_template(content, f"Welcome to CaptchaIQ, {name}!")


def training_complete_email_html(name: str, model: str, accuracy_before: float, accuracy_after: float, job_id: str) -> str:
    delta = accuracy_after - accuracy_before
    delta_color = "#10b981" if delta >= 0 else "#ef4444"
    delta_str = f"+{delta:.1f}%" if delta >= 0 else f"{delta:.1f}%"
    content = f"""
      <h1 style="color:white;font-size:22px;font-weight:900;margin:0 0 8px;">🎯 Training Complete</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">Your model has finished training.</p>

      <div style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="color:#64748b;font-size:12px;margin:0 0 12px;font-weight:700;letter-spacing:2px;">JOB SUMMARY</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#94a3b8;font-size:13px;padding-bottom:8px;">Model</td>
            <td style="color:white;font-size:13px;font-weight:600;text-align:right;">{model}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;font-size:13px;padding-bottom:8px;">Before</td>
            <td style="color:white;font-size:13px;text-align:right;">{accuracy_before:.1f}%</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;font-size:13px;padding-bottom:8px;">After</td>
            <td style="color:white;font-size:13px;font-weight:700;text-align:right;">{accuracy_after:.1f}%</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;font-size:13px;">Improvement</td>
            <td style="color:{delta_color};font-size:16px;font-weight:900;text-align:right;">{delta_str}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://captchaiq.dev/dashboard/training"
           style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#0284c7);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">
          View Training Results →
        </a>
      </div>
      <p style="color:#475569;font-size:12px;margin:0;">Job ID: <code style="color:#94a3b8;">{job_id}</code></p>
    """
    return _base_template(content, f"Model training complete — {delta_str} accuracy improvement")


def password_reset_email_html(name: str, reset_url: str) -> str:
    content = f"""
      <h1 style="color:white;font-size:22px;font-weight:900;margin:0 0 8px;">🔐 Reset your password</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">Hi {name}, click the button below to set a new password. This link expires in 1 hour.</p>

      <div style="text-align:center;margin-bottom:28px;">
        <a href="{reset_url}"
           style="display:inline-block;background:linear-gradient(135deg,#00d4ff,#0284c7);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">
          Reset Password →
        </a>
      </div>

      <p style="color:#64748b;font-size:12px;margin:0 0 8px;">If you didn&apos;t request this, you can safely ignore this email.</p>
      <p style="color:#334155;font-size:11px;word-break:break-all;">
        Or paste this URL: <a href="{reset_url}" style="color:#0ea5e9;">{reset_url}</a>
      </p>
    """
    return _base_template(content, "Reset your CaptchaIQ password")


def login_alert_email_html(name: str, device: str, ip: str, time: str) -> str:
    content = f"""
      <h1 style="color:white;font-size:22px;font-weight:900;margin:0 0 8px;">🔔 New sign-in detected</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">We noticed a new login to your CaptchaIQ account.</p>

      <div style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:20px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="color:#94a3b8;font-size:13px;padding-bottom:8px;">Device</td><td style="color:white;font-size:13px;text-align:right;">{device}</td></tr>
          <tr><td style="color:#94a3b8;font-size:13px;padding-bottom:8px;">IP Address</td><td style="color:white;font-size:13px;text-align:right;">{ip}</td></tr>
          <tr><td style="color:#94a3b8;font-size:13px;">Time</td><td style="color:white;font-size:13px;text-align:right;">{time}</td></tr>
        </table>
      </div>

      <div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:16px;">
        <p style="color:#ef4444;font-size:13px;font-weight:700;margin:0 0 4px;">Not you?</p>
        <p style="color:#78716c;font-size:12px;margin:0 0 12px;">Immediately secure your account by changing your password.</p>
        <a href="https://captchaiq.dev/dashboard/settings?tab=security"
           style="display:inline-block;background:rgba(239,68,68,0.15);color:#ef4444;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:700;border:1px solid rgba(239,68,68,0.3);">
          Secure Account →
        </a>
      </div>
    """
    return _base_template(content, "New sign-in to your CaptchaIQ account")


# ─── Convenience senders ────────────────────────────────────────────────────

async def send_welcome_email(to: str, name: str) -> dict:
    return await send_email(to, "Welcome to CaptchaIQ Research Platform", welcome_email_html(name, to))

async def send_training_complete_email(to: str, name: str, model: str, acc_before: float, acc_after: float, job_id: str) -> dict:
    return await send_email(to, f"✅ Training complete — {model}", training_complete_email_html(name, model, acc_before, acc_after, job_id))

async def send_password_reset_email(to: str, name: str, reset_url: str) -> dict:
    return await send_email(to, "Reset your CaptchaIQ password", password_reset_email_html(name, reset_url))

async def send_login_alert_email(to: str, name: str, device: str, ip: str, time: str) -> dict:
    return await send_email(to, "New sign-in to your account", login_alert_email_html(name, device, ip, time))
