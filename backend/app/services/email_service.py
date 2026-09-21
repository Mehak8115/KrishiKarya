"""
Email service for Krishi Karya.

Gmail setup:
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Set SMTP_USER and SMTP_PASSWORD in backend/.env

Until configured, OTPs print to server console AND are available
at GET /api/v1/auth/dev-otp?email=... (dev only).
"""
import random
import string
import logging

logger = logging.getLogger("krishi.email")

# In-memory OTP store for dev display
_dev_otp_store: dict = {}


def generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


async def send_otp_email(
    to_email: str, otp: str, purpose: str = "register", full_name: str = ""
) -> bool:
    from ..config import get_settings
    settings = get_settings()

    _dev_otp_store[to_email] = otp

    logger.warning(
        f"\n{'='*65}\n"
        f"  {'REAL EMAIL' if settings.email_configured else 'DEV MODE — OTP not emailed'}\n"
        f"  TO:      {to_email}\n"
        f"  PURPOSE: {purpose}\n"
        f"  OTP:     >>> {otp} <<<\n"
        f"  (expires in {settings.OTP_EXPIRE_MINUTES} minutes)\n"
        f"{'='*65}"
    )

    if not settings.email_configured:
        return True

    try:
        import aiosmtplib
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText

        name = full_name or to_email.split("@")[0].title()
        subject, body = _build_email(otp, purpose, name, to_email)

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = settings.SMTP_FROM
        msg["To"]      = to_email
        msg.attach(MIMEText(body["text"], "plain", "utf-8"))
        msg.attach(MIMEText(body["html"], "html",  "utf-8"))

        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
            timeout=20,
        )
        logger.info(f"OTP email sent to {to_email}")
        return True

    except Exception as e:
        logger.error(f"SMTP error for {to_email}: {e}")
        logger.warning(f"FALLBACK OTP for {to_email}: {otp}")
        return False


def get_dev_otp(email: str) -> str | None:
    return _dev_otp_store.get(email)


def _build_email(otp: str, purpose: str, name: str, email: str) -> tuple:
    if purpose == "register":
        subject = "Verify your Krishi Karya account"
        action  = "complete your registration"
    elif purpose == "reset":
        subject = "Reset your Krishi Karya password"
        action  = "reset your password"
    else:
        subject = "Your Krishi Karya verification code"
        action  = "verify your identity"

    text = (
        f"Hello {name},\n\nYour Krishi Karya verification code is:\n\n"
        f"    {otp}\n\n"
        f"This code expires in 10 minutes. Use it to {action}.\n\n"
        f"If you did not request this, ignore this email.\n\n"
        f"-- Krishi Karya Team\n"
    )

    html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#FAF8F1;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:40px 20px;">
    <table width="520" style="background:#fff;border-radius:16px;overflow:hidden;">
      <tr><td style="background:#1B5E20;padding:24px 36px;text-align:center;">
        <div style="font-size:24px;">&#127807; Krishi Karya</div>
        <div style="color:rgba(255,255,255,.75);font-size:12px;">AI-enabled Agricultural Procurement</div>
      </td></tr>
      <tr><td style="padding:32px 36px;">
        <p style="color:#1A2E1A;">Hello <strong>{name}</strong>,</p>
        <p style="color:#5A6E5A;font-size:14px;">Use this code to {action}. Valid for <strong>10 minutes</strong>.</p>
        <div style="background:#F1F8E9;border:2px dashed #43A047;border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
          <div style="font-size:38px;font-weight:900;letter-spacing:12px;color:#1B5E20;font-family:monospace;">{otp}</div>
        </div>
        <p style="background:#FFF8E1;padding:12px;border-radius:8px;color:#E65100;font-size:13px;">
          Never share this code. Krishi Karya will never ask for it by phone.
        </p>
        <p style="color:#8A9E8A;font-size:13px;">Didn't request this? Ignore this email.</p>
      </td></tr>
      <tr><td style="background:#F5F5F5;padding:16px 36px;text-align:center;font-size:12px;color:#8A9E8A;">
        &copy; 2026 Krishi Karya &middot; support@krishikarya.in
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>"""

    return subject, {"text": text, "html": html}
