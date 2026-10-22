import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), "pinktunes.db")

def get_db():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    return db

def init_db():
    db = get_db()
    db.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        album TEXT DEFAULT '',
        genre TEXT DEFAULT '',
        source TEXT DEFAULT '',
        link TEXT DEFAULT '',
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS playlist_songs (
        playlist_id INTEGER NOT NULL,
        song_id INTEGER NOT NULL,
        PRIMARY KEY(playlist_id, song_id),
        FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS favorites (
        user_id INTEGER NOT NULL,
        song_id INTEGER NOT NULL,
        PRIMARY KEY(user_id, song_id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS saved_artists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        artist TEXT NOT NULL COLLATE NOCASE,
        UNIQUE(user_id, artist),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)
    db.commit()
    db.close()
