import os
from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from database import init_db, get_db

app = Flask(__name__)
app.secret_key = os.environ.get("PINKTUNES_SECRET", "troque-esta-chave-em-producao")
init_db()

def user_id():
    return session.get("user_id")

def login_required():
    if not user_id():
        flash("Entre na sua conta para continuar.", "error")
        return False
    return True

@app.route("/")
def index():
    if user_id():
        return redirect(url_for("dashboard"))
    return render_template("index.html")

@app.route("/cadastro", methods=["GET", "POST"])
def cadastro():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        if not name or not email or len(password) < 8:
            flash("Preencha todos os campos. A senha precisa ter pelo menos 8 caracteres.", "error")
            return render_template("cadastro.html")
        db = get_db()
        try:
            cur = db.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                (name, email, generate_password_hash(password))
            )
            db.commit()
            session["user_id"] = cur.lastrowid
            session["user_name"] = name
            flash("Conta criada! Boas-vindas ao PinkTunes.", "success")
            return redirect(url_for("dashboard"))
        except Exception:
            flash("Este e-mail já está cadastrado ou não pôde ser usado.", "error")
        finally:
            db.close()
    return render_template("cadastro.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        db = get_db()
        user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        db.close()
        if user and check_password_hash(user["password_hash"], password):
            session["user_id"] = user["id"]
            session["user_name"] = user["name"]
            return redirect(url_for("dashboard"))
        flash("E-mail ou senha incorretos.", "error")
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    flash("Você saiu da sua conta.", "success")
    return redirect(url_for("index"))

@app.route("/dashboard")
def dashboard():
    if not login_required(): return redirect(url_for("login"))
    db = get_db()
    uid = user_id()
    songs = db.execute("SELECT * FROM songs WHERE user_id=? ORDER BY id DESC LIMIT 6", (uid,)).fetchall()
    playlists = db.execute("SELECT p.*, (SELECT COUNT(*) FROM playlist_songs ps WHERE ps.playlist_id=p.id) AS song_count FROM playlists p WHERE user_id=? ORDER BY id DESC LIMIT 4", (uid,)).fetchall()
    fav_count = db.execute("SELECT COUNT(*) FROM favorites WHERE user_id=?", (uid,)).fetchone()[0]
    song_count = db.execute("SELECT COUNT(*) FROM songs WHERE user_id=?", (uid,)).fetchone()[0]
    artist_count = db.execute("SELECT COUNT(*) FROM saved_artists WHERE user_id=?", (uid,)).fetchone()[0]
    # Recommendations are based on genres/artists already represented in playlists.
    recs = db.execute("""
        SELECT s.*, COUNT(*) AS score FROM songs s
        WHERE s.user_id=? AND s.id NOT IN (SELECT song_id FROM favorites WHERE user_id=?)
        AND (s.genre IN (SELECT s2.genre FROM playlist_songs ps JOIN songs s2 ON s2.id=ps.song_id
                         JOIN playlists p ON p.id=ps.playlist_id WHERE p.user_id=? AND s2.genre IS NOT NULL AND s2.genre!='')
             OR s.artist IN (SELECT s2.artist FROM playlist_songs ps JOIN songs s2 ON s2.id=ps.song_id
                             JOIN playlists p ON p.id=ps.playlist_id WHERE p.user_id=?))
        GROUP BY s.id ORDER BY score DESC, s.title LIMIT 4
    """, (uid, uid, uid, uid)).fetchall()
    db.close()
    return render_template("dashboard.html", songs=songs, playlists=playlists, fav_count=fav_count,
                           song_count=song_count, artist_count=artist_count, recs=recs)

@app.route("/biblioteca", methods=["GET", "POST"])
def biblioteca():
    if not login_required(): return redirect(url_for("login"))
    db = get_db(); uid = user_id()
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        artist = request.form.get("artist", "").strip()
        album = request.form.get("album", "").strip()
        genre = request.form.get("genre", "").strip()
        source = request.form.get("source", "").strip()
        link = request.form.get("link", "").strip()
        if not title or not artist:
            flash("Título e artista são obrigatórios.", "error")
        else:
            db.execute("INSERT INTO songs (user_id,title,artist,album,genre,source,link) VALUES (?,?,?,?,?,?,?)",
                       (uid,title,artist,album,genre,source,link))
            db.commit(); flash("Música adicionada à sua biblioteca.", "success")
        db.close(); return redirect(url_for("biblioteca"))
    q = request.args.get("q", "").strip()
    if q:
        like = f"%{q}%"
        songs = db.execute("SELECT * FROM songs WHERE user_id=? AND (title LIKE ? OR artist LIKE ? OR album LIKE ? OR genre LIKE ?) ORDER BY title",
                           (uid,like,like,like,like)).fetchall()
    else:
        songs = db.execute("SELECT * FROM songs WHERE user_id=? ORDER BY id DESC", (uid,)).fetchall()
    playlists = db.execute("SELECT * FROM playlists WHERE user_id=? ORDER BY name", (uid,)).fetchall()
    db.close()
    return render_template("biblioteca.html", songs=songs, playlists=playlists, query=q)

@app.route("/musica/<int:song_id>/excluir", methods=["POST"])
def excluir_musica(song_id):
    if not login_required(): return redirect(url_for("login"))
    db = get_db(); uid = user_id()
    db.execute("DELETE FROM songs WHERE id=? AND user_id=?", (song_id, uid))
    db.commit(); db.close()
    flash("Música removida da biblioteca.", "success")
    return redirect(request.referrer or url_for("biblioteca"))

@app.route("/musica/<int:song_id>/favoritar", methods=["POST"])
def favoritar(song_id):
    if not login_required(): return redirect(url_for("login"))
    db = get_db(); uid = user_id()
    exists = db.execute("SELECT 1 FROM songs WHERE id=? AND user_id=?", (song_id,uid)).fetchone()
    if exists:
        fav = db.execute("SELECT 1 FROM favorites WHERE user_id=? AND song_id=?", (uid,song_id)).fetchone()
        if fav:
            db.execute("DELETE FROM favorites WHERE user_id=? AND song_id=?", (uid,song_id))
            flash("Música removida dos favoritos.", "success")
        else:
            db.execute("INSERT OR IGNORE INTO favorites (user_id,song_id) VALUES (?,?)", (uid,song_id))
            flash("Música adicionada aos favoritos.", "success")
        db.commit()
    db.close()
    return redirect(request.referrer or url_for("biblioteca"))

@app.route("/playlists", methods=["GET", "POST"])
def playlists():
    if not login_required(): return redirect(url_for("login"))
    db = get_db(); uid = user_id()
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        description = request.form.get("description", "").strip()
        if name:
            db.execute("INSERT INTO playlists (user_id,name,description) VALUES (?,?,?)", (uid,name,description))
            db.commit(); flash("Playlist criada.", "success")
        else: flash("Informe um nome para a playlist.", "error")
        db.close(); return redirect(url_for("playlists"))
    all_playlists = db.execute("""
        SELECT p.*, (SELECT COUNT(*) FROM playlist_songs ps WHERE ps.playlist_id=p.id) AS song_count
        FROM playlists p WHERE p.user_id=? ORDER BY p.id DESC
    """, (uid,)).fetchall()
    songs = db.execute("SELECT * FROM songs WHERE user_id=? ORDER BY title", (uid,)).fetchall()
    selected_id = request.args.get("id", type=int)
    selected = None; selected_songs = []
    if selected_id:
        selected = db.execute("SELECT * FROM playlists WHERE id=? AND user_id=?", (selected_id,uid)).fetchone()
        if selected:
            selected_songs = db.execute("""SELECT s.* FROM songs s JOIN playlist_songs ps ON ps.song_id=s.id
                                          WHERE ps.playlist_id=? AND s.user_id=? ORDER BY s.title""",
                                        (selected_id,uid)).fetchall()
    db.close()
    return render_template("playlists.html", playlists=all_playlists, songs=songs, selected=selected, selected_songs=selected_songs)

@app.route("/playlist/<int:playlist_id>/adicionar", methods=["POST"])
def adicionar_playlist(playlist_id):
    if not login_required(): return redirect(url_for("login"))
    song_id = request.form.get("song_id", type=int); uid = user_id()
    db = get_db()
    p = db.execute("SELECT id FROM playlists WHERE id=? AND user_id=?", (playlist_id,uid)).fetchone()
    s = db.execute("SELECT id FROM songs WHERE id=? AND user_id=?", (song_id,uid)).fetchone()
    if p and s:
        db.execute("INSERT OR IGNORE INTO playlist_songs (playlist_id,song_id) VALUES (?,?)", (playlist_id,song_id))
        db.commit(); flash("Música adicionada à playlist.", "success")
    else: flash("Não foi possível adicionar essa música.", "error")
    db.close(); return redirect(url_for("playlists", id=playlist_id))

@app.route("/playlist/<int:playlist_id>/remover/<int:song_id>", methods=["POST"])
def remover_playlist(playlist_id, song_id):
    if not login_required(): return redirect(url_for("login"))
    db = get_db()
    db.execute("""DELETE FROM playlist_songs WHERE playlist_id=? AND song_id=?
                  AND playlist_id IN (SELECT id FROM playlists WHERE user_id=?)""", (playlist_id,song_id,user_id()))
    db.commit(); db.close()
    flash("Música removida da playlist.", "success")
    return redirect(url_for("playlists", id=playlist_id))

@app.route("/playlist/<int:playlist_id>/excluir", methods=["POST"])
def excluir_playlist(playlist_id):
    if not login_required(): return redirect(url_for("login"))
    db = get_db()
    db.execute("DELETE FROM playlists WHERE id=? AND user_id=?", (playlist_id,user_id()))
    db.commit(); db.close(); flash("Playlist excluída.", "success")
    return redirect(url_for("playlists"))

@app.route("/favoritos")
def favoritos():
    if not login_required(): return redirect(url_for("login"))
    db = get_db()
    songs = db.execute("""SELECT s.* FROM songs s JOIN favorites f ON f.song_id=s.id
                          WHERE f.user_id=? ORDER BY s.title""", (user_id(),)).fetchall()
    db.close(); return render_template("favoritos.html", songs=songs)

@app.route("/artistas", methods=["GET", "POST"])
def artistas():
    if not login_required(): return redirect(url_for("login"))
    db = get_db(); uid = user_id()
    if request.method == "POST":
        artist = request.form.get("artist", "").strip()
        if artist:
            db.execute("INSERT OR IGNORE INTO saved_artists (user_id,artist) VALUES (?,?)", (uid,artist))
            db.commit(); flash("Artista salvo.", "success")
        db.close(); return redirect(url_for("artistas"))
    artists = db.execute("""SELECT sa.id, sa.artist,
        (SELECT COUNT(*) FROM songs s WHERE s.user_id=sa.user_id AND lower(s.artist)=lower(sa.artist)) AS song_count
        FROM saved_artists sa WHERE sa.user_id=? ORDER BY sa.artist""", (uid,)).fetchall()
    songs = db.execute("SELECT * FROM songs WHERE user_id=? ORDER BY artist,title", (uid,)).fetchall()
    db.close(); return render_template("artistas.html", artists=artists, songs=songs)

@app.route("/artista/<int:artist_id>/excluir", methods=["POST"])
def excluir_artista(artist_id):
    if not login_required(): return redirect(url_for("login"))
    db = get_db(); db.execute("DELETE FROM saved_artists WHERE id=? AND user_id=?", (artist_id,user_id()))
    db.commit(); db.close(); flash("Artista removido.", "success")
    return redirect(url_for("artistas"))

if __name__ == "__main__":
    app.run(debug=True)
