import logging
from firebase_admin import messaging
from bson import ObjectId
from secrets_backend.firebase_config import firestore_client

logger = logging.getLogger(__name__)

def send_push_notification_to_user(user_id: str, title: str, message: str, data: dict = None):
    """Send push notification to a user via Firebase Cloud Messaging"""
    try:
        user_oid = ObjectId(user_id)
        
        # Fetch user's FCM tokens from Firestore
        tokens_ref = firestore_client.collection('user_fcm_tokens').document(str(user_oid))
        tokens_doc = tokens_ref.get()
        
        if not tokens_doc.exists:
            logger.warning(f"No FCM tokens found for user {user_id}")
            return {"success": False, "error": "No FCM tokens found for user"}
        
        tokens_data = tokens_doc.to_dict()
        fcm_tokens = tokens_data.get('tokens', [])
        
        if not fcm_tokens:
            logger.warning(f"No FCM tokens available for user {user_id}")
            return {"success": False, "error": "No FCM tokens available for user"}
        
        # Convert data dict to strings (FCM requirement)
        string_data = {}
        if data:
            string_data = {str(k): str(v) for k, v in data.items()}
        
        # Create a message to send to the device tokens
        message_payload = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=message,
            ),
            data=string_data,
            tokens=fcm_tokens,
            android=messaging.AndroidConfig(
                priority='high',
                notification=messaging.AndroidNotification(
                    channel_id='document-updates',
                    priority='high',
                    visibility='public',
                    sound='default',
                    color='#1976D2',
                ),
            ),
            apns=messaging.APNSConfig(
                headers={'apns-priority': '10'},
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        sound='default',
                        badge=1,
                        content_available=True,
                    ),
                ),
            ),
        )
        
        # Send the message
        response = messaging.send_multicast(message_payload)
        
        logger.info(f"Sent push notification to user {user_id}: {response.success_count} successful, {response.failure_count} failed")
        
        return {
            "success": True,
            "success_count": response.success_count,
            "failure_count": response.failure_count
        }
    
    except Exception as e:
        logger.error(f"Error sending push notification to user {user_id}: {str(e)}")
        return {"success": False, "error": str(e)}