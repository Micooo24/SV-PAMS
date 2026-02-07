from firebase_admin import messaging
from secrets_backend.firebase_config import firebase_admin

def send_notification(fcm_token, title, body):
    """Send push notification - Simple!"""
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title, 
                body=body
            ),
            token=fcm_token,
            android=messaging.AndroidConfig(
                priority='high',
                notification=messaging.AndroidNotification(
                    sound='default',
                    color='#1976D2',
                )
            ),
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        sound='default',
                        badge=1,
                    )
                )
            )
        )
        
        response = messaging.send(message)
        print(f"Notification sent: {response}")
        return True
        
    except Exception as e:
        print(f"Error sending notification: {e}")
        return False