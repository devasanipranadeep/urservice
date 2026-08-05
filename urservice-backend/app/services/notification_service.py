import threading
import logging
from uuid import UUID
from typing import Optional, Dict, Any

from app.db.supabase_client import supabase
from app.services.email_service import send_email_sync

logger = logging.getLogger("notification_service")

def compose_html_email(name: str, title: str, text_message: str) -> tuple[str, str]:
    """
    Composes a styled HTML email corresponding to the notification event.
    Returns a tuple of (subject, html_content).
    """
    subject = f"UrService Notification: {title}"
    
    # Extract operational details (rejection/suspension reasons)
    reason_label = ""
    reason_text = ""
    if "Reason:" in text_message:
        parts = text_message.split("Reason:")
        reason_text = parts[-1].strip()
        reason_label = "Reason for decision:"
    elif "reason:" in text_message.lower():
        parts = text_message.lower().split("reason:")
        reason_text = text_message[len(parts[0]) + 7:].strip()
        reason_label = "Reason for decision:"

    # Compose contextual messages
    if "registration" in title.lower() or "received" in title.lower():
        subject = "UrService — Vendor Registration Received"
        event_message = (
            "Thank you for registering with UrService! We have received your application "
            "and documents. Our administration team is currently verifying your details."
        )
    elif "resubmitted" in title.lower() or "resubmit" in title.lower():
        subject = "UrService — Application Resubmitted"
        event_message = (
            "Your vendor verification application has been resubmitted and is now "
            "pending review in the verification queue."
        )
    elif "approved" in title.lower():
        subject = "UrService — Account Verification Approved! 🎉"
        event_message = (
            "Congratulations! Your vendor profile has been fully approved by the "
            "UrService administration team. You can now list services, update availability, "
            "and receive client bookings directly."
        )
    elif "rejected" in title.lower():
        subject = "UrService — Account Verification Rejected ❌"
        event_message = (
            "We regret to inform you that your vendor application was rejected by "
            "our verification team. Please review the details below, correct the issues, "
            "and resubmit your application."
        )
    elif "suspended" in title.lower():
        subject = "UrService — Account Suspended Alert ⚠️"
        event_message = (
            "Your vendor account has been suspended by our administration team. "
            "During suspension, your profile remains hidden from searches and "
            "service creation is disabled. Please see the reason below."
        )
    else:
        event_message = text_message

    # Construct HTML body
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                background-color: #0b0f19;
                color: #e2e8f0;
                margin: 0;
                padding: 40px 20px;
            }}
            .card {{
                max-width: 580px;
                margin: 0 auto;
                background-color: #0f172a;
                border: 1px border #1e293b;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            }}
            .header {{
                background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
                padding: 30px 40px;
                text-align: center;
            }}
            .header h1 {{
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: 800;
                letter-spacing: -0.025em;
            }}
            .content {{
                padding: 40px;
            }}
            .greeting {{
                font-size: 16px;
                font-weight: 600;
                color: #f8fafc;
                margin-top: 0;
                margin-bottom: 16px;
            }}
            .message {{
                font-size: 14px;
                line-height: 1.6;
                color: #94a3b8;
                margin-bottom: 24px;
            }}
            .reason-box {{
                background-color: #1e1b4b;
                border: 1px solid #312e81;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
            }}
            .reason-title {{
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #c084fc;
                margin: 0 0 8px 0;
            }}
            .reason-desc {{
                font-size: 14px;
                line-height: 1.5;
                color: #e9d5ff;
                margin: 0;
            }}
            .footer {{
                background-color: #0b0f19;
                padding: 20px 40px;
                text-align: center;
                border-top: 1px solid #1e293b;
            }}
            .footer p {{
                font-size: 11px;
                color: #64748b;
                margin: 0;
            }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <h1>UrService</h1>
            </div>
            <div class="content">
                <p class="greeting">Hello {name},</p>
                <p class="message">{event_message}</p>
                
                {f'''
                <div class="reason-box">
                    <h4 class="reason-title">{reason_label}</h4>
                    <p class="reason-desc">{reason_text}</p>
                </div>
                ''' if reason_text else ''}
                
                <p class="message">Please log in to your account to view details or manage your settings.</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 UrService Inc. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return subject, html_content

def create_notification(user_id: UUID, title: str, message: str) -> Dict[str, Any]:
    """
    Central function to create in-app notifications and trigger an asynchronous email alert.
    """
    # 1. Insert notification record into Postgres via Supabase
    notif_data = {
        "user_id": str(user_id),
        "title": title,
        "message": message,
        "is_read": False
    }
    
    # Bypassing RLS by using service client or letting the caller execute in their context?
    # Usually, notifications are inserted by the system, so using the client role (or system client) is standard.
    # supabase client imported here is the standard app service client.
    notif_res = supabase.table("notifications").insert(notif_data).execute()
    if not notif_res.data:
        raise Exception("Failed to insert notification row.")
        
    inserted_notif = notif_res.data[0]
    
    # 2. Trigger asynchronous email delivery via background thread
    try:
        # Fetch user's email from auth/users mapping and full name from profile
        user_res = supabase.table("users").select("email").eq("id", str(user_id)).execute()
        if user_res.data:
            to_email = user_res.data[0]["email"]
            
            profile_res = supabase.table("profiles").select("full_name").eq("user_id", str(user_id)).execute()
            full_name = profile_res.data[0]["full_name"] if profile_res.data else "User"
            
            # Compose HTML template
            subject, html_body = compose_html_email(full_name, title, message)
            
            # Dispatch asynchronously in daemon thread
            thread = threading.Thread(target=send_email_sync, args=(to_email, subject, html_body))
            thread.daemon = True
            thread.start()
            
    except Exception as email_err:
        logger.error(f"Failed to trigger email notification thread: {str(email_err)}")
        
    return inserted_notif
