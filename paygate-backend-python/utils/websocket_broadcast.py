"""
WebSocket broadcasting utility for analytics events
"""
import json
import asyncio
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

# Global set to store WebSocket connections
websocket_connections = set()


def register_websocket_connection(websocket):
    """Register a new WebSocket connection"""
    websocket_connections.add(websocket)
    logger.info(f"WebSocket connection registered: {websocket.client}")


def unregister_websocket_connection(websocket):
    """Unregister a WebSocket connection"""
    websocket_connections.discard(websocket)
    logger.info(f"WebSocket connection unregistered: {websocket.client}")


async def broadcast_to_websocket_clients(message: Dict[str, Any]):
    """
    Broadcast a message to all connected WebSocket clients
    """
    if not websocket_connections:
        return

    message_text = json.dumps(message)
    disconnected_clients = set()

    for connection in websocket_connections:
        try:
            await connection.send_text(message_text)
        except Exception as e:
            logger.error(f"Error sending message to WebSocket: {e}")
            disconnected_clients.add(connection)

    # Remove disconnected clients
    websocket_connections.difference_update(disconnected_clients)


async def broadcast_analytics_event(event_type: str, data: Dict[str, Any]):
    """
    Broadcast an analytics event to all connected WebSocket clients
    """
    message = {
        "event": event_type,
        "data": data,
        "timestamp": asyncio.get_event_loop().time()
    }
    await broadcast_to_websocket_clients(message)