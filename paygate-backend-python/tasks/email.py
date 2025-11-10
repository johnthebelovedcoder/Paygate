import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from celery import current_task
from celery_worker import celery_app
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def send_email_task(self, to_email, subject, body, html_body=None):
    """
    Send email in background
    """
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.EMAIL_SENDER or 'noreply@paygate.com'
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add body to email
        if html_body:
            msg.attach(MIMEText(html_body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))
        
        # In a real implementation, you would connect to your email server
        # For now, we'll just simulate sending an email
        print(f"Email sent to {to_email}: {subject}")
        
        logger.info(f"Email sent successfully to {to_email}")
        return {"status": "success", "to": to_email, "subject": subject}
    
    except Exception as exc:
        logger.error(f"Email sending failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)

@celery_app.task(bind=True)
def send_welcome_email(self, user_email, user_name):
    """
    Send welcome email to new user in background
    """
    subject = "Welcome to Paygate!"
    body = f"""
    Hi {user_name},
    
    Welcome to Paygate! We're excited to have you on board.
    
    Get started with your paywall management today.
    
    Best regards,
    The Paygate Team
    """
    
    return send_email_task.delay(user_email, subject, body)

@celery_app.task(bind=True)
def send_payment_confirmation_email(self, user_email, payment_details):
    """
    Send payment confirmation email in background
    """
    subject = "Payment Confirmation"
    body = f"""
    Hi,
    
    Your payment of {payment_details.get('amount', '0.00')} {payment_details.get('currency', 'USD')} 
    has been processed successfully.
    
    Reference: {payment_details.get('reference', 'N/A')}
    Date: {payment_details.get('date', 'N/A')}
    
    Thank you for your purchase!
    
    Best regards,
    The Paygate Team
    """
    
    return send_email_task.delay(user_email, subject, body)

@celery_app.task(bind=True)
def send_password_reset_email(self, user_email, reset_token):
    """
    Send password reset email in background
    """
    subject = "Password Reset Request"
    body = f"""
    Hi,
    
    Someone requested a password reset for your Paygate account.
    If this was you, please use the following token to reset your password:
    
    Reset Token: {reset_token}
    
    If you did not request this, please ignore this email.
    
    Best regards,
    The Paygate Team
    """
    
    return send_email_task.delay(user_email, subject, body)

@celery_app.task(bind=True)
def send_verification_email(self, user_email, user_name, verification_token):
    """
    Send email verification in background
    """
    from config.settings import settings
    verification_url = f"{settings.FRONTEND_URL}/verify-email/{verification_token}"
    subject = "Verify Your Email Address"
    body = f"""
    Hi {user_name},
    
    Thank you for registering with Paygate!
    
    Please verify your email address by clicking the link below:
    {verification_url}
    
    If you did not create an account with us, please ignore this email.
    
    Best regards,
    The Paygate Team
    """
    
    html_body = f"""
    <html>
        <body>
            <h2>Welcome to Paygate!</h2>
            <p>Hi {user_name},</p>
            <p>Thank you for registering with Paygate!</p>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="{verification_url}" style="display:inline-block; padding:10px 20px; background-color:#3B82F6; color:white; text-decoration:none; border-radius:5px;">
                Verify Email Address
            </a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{verification_url}</p>
            <p>If you did not create an account with us, please ignore this email.</p>
            <br>
            <p>Best regards,<br>The Paygate Team</p>
        </body>
    </html>
    """

    return send_email_task.delay(user_email, subject, body, html_body)