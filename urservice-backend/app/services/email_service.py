import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from app.core.config import settings

logger = logging.getLogger("email_service")

def send_email_sync(to_email: str, subject: str, body_html: str) -> bool:
    """
    Sends an HTML email synchronously using SMTP.
    Returns True if successful, False otherwise.
    """
    if not settings.SMTP_HOST or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning(
            f"SMTP is not configured (missing SMTP_HOST, SMTP_USERNAME, or SMTP_PASSWORD). "
            f"Email NOT sent to {to_email}. Subject: {subject}"
        )
        return False

    try:
        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_SENDER
        msg["To"] = to_email
        msg["Subject"] = subject
        
        # Attach the HTML body
        msg.attach(MIMEText(body_html, "html"))
        
        # Connect to SMTP server and send
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10.0) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_SENDER, to_email, msg.as_string())
            
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False
