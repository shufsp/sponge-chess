import asyncio
import websockets
from stockfish import Stockfish

stockfish = Stockfish("/usr/bin/stockfish")

# Engine cheat presets
presets = {
    "bullet": {"elo": 1800, "depth": 2},
    "blitz": {"elo": 2200, "depth": 3},
    "rapid": {"elo": 2600, "depth": 4},
    "noob": {"elo": 800, "depth": 1},
    "blatant": {"elo": 3000, "depth": 15}
}

# Applies a preset to stockfish engine
def apply_preset(preset_str="blitz"):
    preset = presets.get(preset_str)
    if preset is None:
        raise ValueError(f"Preset '{preset_str}' is not valid")
    stockfish.set_elo_rating(preset["elo"])
    stockfish.set_depth(preset["depth"])
    print(f"Switched to preset '{preset_str}'")

# Gets stats about the current board configuration
def display_stats():
    #print(stockfish.get_board_visual())
    print()
    print(f"Eval: {stockfish.get_evaluation()}")
    print()
    print(f"FEN: {stockfish.get_fen_position()}")
    print()

async def websocket_handler(websocket):
    print("New client connection")
    await websocket.send("WebSocket connection established")

    try:
        async for message in websocket:
            # Handle incoming WebSocket messages here
            if message.startswith("get_best_moves"):
                _, fen = message.split(":")
                stockfish.set_fen_position(fen.strip())
                print(f"Best move asked for fen {fen}")
                await websocket.send(f"best_move:{stockfish.get_best_move()}")
            elif message.startswith("apply_preset"):
                _, preset_str = message.split(":")
                apply_preset(preset_str.strip())
            elif message.startswith("set_elo"):
                _, elo = message.split(":")
                elo = int(elo)
                stockfish.set_elo_rating(elo)
                await websocket.send(f"elo:{elo}")
            elif message.startswith("set_depth"):
                _, depth = message.split(":")
                depth = int(depth)
                stockfish.set_depth(depth)
                await websocket.send(f"depth:{depth}")
    except websockets.exceptions.ConnectionClosed:
        print("WebSocket connection closed")

async def main(port: int):
    async with websockets.serve(websocket_handler, "localhost", port) as server:
        print(f"SpongeChess socket server running on port {port}")
        print(f"get_best_moves, apply_preset:<preset>, set_elo:<ELO>, set_depth:<DEPTH>")
        await server.serve_forever()

if __name__ == "__main__":
    asyncio.run(main(port=8765))
