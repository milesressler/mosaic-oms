import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8080/api/ws"
    async with websockets.connect(uri) as websocket:
        print("Connected to the WebSocket server")

        # Send a test message if necessary
        subscribe_message = json.dumps({
            "command": "subscribe",
            "identifier": {
                "channel": "orders"
            }
        })
        await websocket.send(subscribe_message)
        print(f"Sent: {subscribe_message}")

        # Receive messages
        try:
            async for message in websocket:
                print(f"Received message: {message}")
        except websockets.ConnectionClosed as e:
            print(f"Connection closed with code: {e.code}, reason: {e.reason}")

asyncio.get_event_loop().run_until_complete(test_websocket())
