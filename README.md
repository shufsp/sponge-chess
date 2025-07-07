# sponge-chess
### NOTE: This project was built for - and should only be used for - educational purposes only. 
I made this years ago for client side security and exploit prevention education.
please don't use it to cheat in public matchmaking.. that's super lame

An experimental, hypothetical implementation of a stockfish client/server that automatically plays for you on chess.com.

How to demo:
1. Open inspect element on chess.com
1. Start a **private game with yourself, or with a friend who knows you are using this.** (Do not use in public matchmaking)
3. Inject the sponge client script into your development console.
4. If done properly, you will see a sponge icon '🧽' and a water drop icon '💦'. You want to move the piece labeled by 💦 to the square labeled by 🧽. This is the "best move" that you can do.

You're able to adjust stockfish elo and depth in config. There's some common presets you can use too.
By default, you can also have the script automatically move the labeled piece to the correct square using a hotkey (like PERIOD '.')
