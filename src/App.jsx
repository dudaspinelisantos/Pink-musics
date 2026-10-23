import { useEffect, useMemo, useState } from 'react'
import {
  AudioLines, Search, Home, Library, ListMusic, Heart, Mic2, Plus,
  Play, Pause, Music2, Headphones, Sparkles, LogOut, UserRound,
  ChevronRight, MoreHorizontal, Disc3, X, Check, Trash2, Clock3,
  Menu, CircleUserRound, ArrowRight, Music, WandSparkles
} from 'lucide-react'

const USERS_KEY = 'pinktunes_demo_users_v1'
const SESSION_KEY = 'pinktunes_demo_session_v1'
const DATA_KEY = 'pinktunes_demo_data_v1'

const seedSongs = [
  { id: 's1', title: 'Cruel Summer', artist: 'Taylor Swift', album: 'Lover', genre: 'Pop', year: 2019, color: 'from-rose-300 to-pink-500', duration: '2:58', source: '' },
  { id: 's2', title: 'Birds of a Feather', artist: 'Billie Eilish', album: 'Hit Me Hard and Soft', genre: 'Pop', year: 2024, color: 'from-violet-300 to-fuchsia-500', duration: '3:30', source: '' },
  { id: 's3', title: 'Die With A Smile', artist: 'Lady Gaga, Bruno Mars', album: 'Die With A Smile', genre: 'Pop', year: 2024, color: 'from-orange-200 to-rose-400', duration: '4:11', source: '' },
  { id: 's4', title: 'Snooze', artist: 'SZA', album: 'SOS', genre: 'R&B', year: 2022, color: 'from-amber-200 to-orange-400', duration: '3:22', source: '' },
  { id: 's5', title: 'Good Luck, Babe!', artist: 'Chappell Roan', album: 'Good Luck, Babe!', genre: 'Pop', year: 2024, color: 'from-pink-300 to-purple-500', duration: '3:38', source: '' },
  { id: 's6', title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", genre: 'Pop', year: 2022, color: 'from-sky-200 to-blue-400', duration: '2:47', source: '' },
  { id: 's7', title: 'Telepatía', artist: 'Kali Uchis', album: 'Sin Miedo', genre: 'R&B', year: 2020, color: 'from-emerald-200 to-teal-500', duration: '2:40', source: '' },
  { id: 's8', title: 'The Night We Met', artist: 'Lord Huron', album: 'Strange Trails', genre: 'Indie', year: 2015, color: 'from-indigo-300 to-slate-600', duration: '3:28', source: '' },
]
const initialData = { songs: seedSongs, favorites: ['s1', 's5'], playlists: [{ id: 'p1', name: 'No repeat 💗', songIds: ['s1', 's5', 's2'] }, { id: 'p2', name: 'Late night', songIds: ['s8', 's4'] }], artists: ['Taylor Swift', 'Billie Eilish', 'SZA'], recent: ['s1', 's2', 's5'] }
const coverStyles = ['from-pink-300 to-rose-500', 'from-fuchsia-300 to-violet-500', 'from-orange-200 to-pink-400', 'from-sky-200 to-indigo-400', 'from-rose-200 to-purple-400', 'from-amber-200 to-rose-400']

function readJSON(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback } catch { return fallback }
}
function initials(text = '') { return text.split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase() }
function Cover({ song, size = 'md', className = '' }) {
  const sizes = { sm: 'h-11 w-11 rounded-xl', md: 'h-14 w-14 rounded-2xl', lg: 'h-36 w-36 rounded-3xl', hero: 'h-44 w-44 rounded-[2rem]' }
  return <div className={`relative grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br ${song?.color || coverStyles[0]} ${sizes[size]} ${className}`}>
    <div className="absolute inset-0 bg-white/10" />
    <AudioLines className="relative text-white/90" size={size === 'sm' ? 19 : size === 'md' ? 24 : 45} strokeWidth={1.5} />
    <div className="absolute -bottom-4 -right-4 h-14 w-14 rounded-full border border-white/30 bg-white/10" />
  </div>
}
function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = { primary: 'bg-pinktunes-500 text-white shadow-sm hover:bg-pinktunes-600', secondary: 'bg-white text-pinktunes-700 border border-pinktunes-100 hover:bg-pinktunes-50', ghost: 'text-stone-500 hover:bg-pinktunes-50 hover:text-pinktunes-700', danger: 'text-rose-600 hover:bg-rose-50' }
  return <button className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${variants[variant]} ${className}`} {...props}>{children}</button>
}
function Field({ label, ...props }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-stone-600">{label}</span><input className="w-full rounded-xl border border-pinktunes-100 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-pinktunes-400 focus:ring-4 focus:ring-pinktunes-100" {...props} /></label>
}
function EmptyState({ icon: Icon = Music2, title, detail, action }) {
  return <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-pinktunes-200 bg-white/70 p-8 text-center"><div className="mb-3 rounded-2xl bg-pinktunes-50 p-3 text-pinktunes-500"><Icon size={25} /></div><h3 className="font-semibold text-stone-800">{title}</h3><p className="mt-1 max-w-sm text-sm text-stone-500">{detail}</p>{action && <div className="mt-4">{action}</div>}</div>
}

export default function App() {
  const [users, setUsers] = useState(() => readJSON(USERS_KEY, []))
  const [session, setSession] = useState(() => readJSON(SESSION_KEY, null))
  const [allData, setAllData] = useState(() => readJSON(DATA_KEY, {}))
  const [page, setPage] = useState('home')
  const [query, setQuery] = useState('')
  const [playing, setPlaying] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [showAddSong, setShowAddSong] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [activePlaylist, setActivePlaylist] = useState(null)
  const [songForm, setSongForm] = useState({ title: '', artist: '', album: '', genre: 'Pop', year: new Date().getFullYear(), source: '' })
  const [mobileMenu, setMobileMenu] = useState(false)
  const [toast, setToast] = useState('')
  const [activeSongMenu, setActiveSongMenu] = useState(null)
  const [songToAdd, setSongToAdd] = useState(null)

  useEffect(() => localStorage.setItem(USERS_KEY, JSON.stringify(users)), [users])
  useEffect(() => localStorage.setItem(SESSION_KEY, JSON.stringify(session)), [session])
  useEffect(() => localStorage.setItem(DATA_KEY, JSON.stringify(allData)), [allData])

  const userData = session ? (allData[session.email] || initialData) : initialData
  const songs = userData.songs || seedSongs
  const songById = (id) => songs.find((song) => song.id === id)
  const currentUser = session ? users.find((user) => user.email === session.email) : null

  function updateData(updater) {
    if (!session) return
    setAllData((previous) => {
      const current = previous[session.email] || structuredClone(initialData)
      return { ...previous, [session.email]: updater(current) }
    })
  }
  function notify(message) { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  function submitAuth(event) {
    event.preventDefault()
    setAuthError('')
    const email = authEmail.trim().toLowerCase()
    if (!email || !authPassword) { setAuthError('Preencha e-mail e senha.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setAuthError('Digite um e-mail válido.'); return }
    if (authMode === 'signup') {
      if (!authName.trim()) { setAuthError('Digite seu nome.'); return }
      if (authPassword.length < 6) { setAuthError('A senha precisa ter pelo menos 6 caracteres.'); return }
      if (users.some((user) => user.email === email)) { setAuthError('Este e-mail já está cadastrado. Tente entrar.'); return }
      const user = { name: authName.trim(), email, password: authPassword }
      setUsers((previous) => [...previous, user])
      setAllData((previous) => ({ ...previous, [email]: structuredClone(initialData) }))
      setSession({ email })
      setPage('home')
      setAuthPassword('')
      notify('Conta criada! Bem-vinda ao PinkTunes 💗')
    } else {
      const user = users.find((item) => item.email === email && item.password === authPassword)
      if (!user) { setAuthError('E-mail ou senha incorretos.'); return }
      setSession({ email })
      setPage('home')
      setAuthPassword('')
    }
  }
  function logout() { setSession(null); setPage('home'); setQuery(''); setAuthMode('login'); setAuthPassword('') }
  function toggleFavorite(id) {
    updateData((data) => ({ ...data, favorites: data.favorites.includes(id) ? data.favorites.filter((item) => item !== id) : [...data.favorites, id] }))
  }
  function playSong(song) {
    if (playing?.id === song.id) setPlaying(null)
    else {
      setPlaying(song)
      updateData((data) => ({ ...data, recent: [song.id, ...(data.recent || []).filter((id) => id !== song.id)].slice(0, 8) }))
    }
  }
  function addSong(event) {
    event.preventDefault()
    if (!songForm.title.trim() || !songForm.artist.trim()) return
    const song = { ...songForm, id: `song-${Date.now()}`, year: Number(songForm.year) || new Date().getFullYear(), duration: '--:--', color: coverStyles[songs.length % coverStyles.length] }
    updateData((data) => ({ ...data, songs: [song, ...data.songs], recent: [song.id, ...(data.recent || [])] }))
    setSongForm({ title: '', artist: '', album: '', genre: 'Pop', year: new Date().getFullYear(), source: '' })
    setShowAddSong(false)
    notify('Música adicionada à biblioteca.')
  }
  function createPlaylist(event) {
    event.preventDefault()
    if (!newPlaylistName.trim()) return
    const playlist = { id: `pl-${Date.now()}`, name: newPlaylistName.trim(), songIds: [] }
    updateData((data) => ({ ...data, playlists: [...data.playlists, playlist] }))
    setNewPlaylistName('')
    setShowPlaylist(false)
    setActivePlaylist(playlist.id)
    setPage('playlists')
    notify('Playlist criada!')
  }
  function addToPlaylist(playlistId, songId) {
    updateData((data) => ({ ...data, playlists: data.playlists.map((pl) => pl.id === playlistId && !pl.songIds.includes(songId) ? { ...pl, songIds: [...pl.songIds, songId] } : pl) }))
    notify('Música adicionada à playlist.')
  }
  function removeFromPlaylist(playlistId, songId) {
    updateData((data) => ({ ...data, playlists: data.playlists.map((pl) => pl.id === playlistId ? { ...pl, songIds: pl.songIds.filter((id) => id !== songId) } : pl) }))
  }
  function deletePlaylist(id) {
    updateData((data) => ({ ...data, playlists: data.playlists.filter((pl) => pl.id !== id) }))
    if (activePlaylist === id) setActivePlaylist(null)
    notify('Playlist removida.')
  }
  function toggleArtist(artist) {
    updateData((data) => ({ ...data, artists: data.artists.includes(artist) ? data.artists.filter((name) => name !== artist) : [...data.artists, artist] }))
  }

  const filteredSongs = useMemo(() => songs.filter((song) => `${song.title} ${song.artist} ${song.album} ${song.genre}`.toLowerCase().includes(query.toLowerCase())), [songs, query])
  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'library', label: 'Minha biblioteca', icon: Library },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'favorites', label: 'Favoritas', icon: Heart },
    { id: 'artists', label: 'Artistas', icon: Mic2 },
  ]
  const pageTitle = ({ home: 'Seu universo musical', library: 'Minha biblioteca', playlists: 'Suas playlists', favorites: 'Músicas favoritas', artists: 'Seus artistas' })[page] || 'PinkTunes'

  if (!session) return <AuthScreen mode={authMode} setMode={(mode) => { setAuthMode(mode); setAuthError('') }} name={authName} setName={setAuthName} email={authEmail} setEmail={setAuthEmail} password={authPassword} setPassword={setAuthPassword} error={authError} onSubmit={submitAuth} />

  const favoriteSongs = songs.filter((song) => userData.favorites.includes(song.id))
  const recentSongs = (userData.recent || []).map(songById).filter(Boolean)
  const chosenPlaylist = userData.playlists.find((playlist) => playlist.id === activePlaylist)
  const artists = [...new Set([...userData.artists, ...songs.map((song) => song.artist.split(',')[0].trim())])]
  const playlistSongs = chosenPlaylist ? chosenPlaylist.songIds.map(songById).filter(Boolean) : []

  function SongRow({ song, index, playlistId = null, showAlbum = true }) {
    const isPlaying = playing?.id === song.id
    return <div className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-pinktunes-50 sm:grid-cols-[32px_minmax(0,1.5fr)_minmax(0,1fr)_auto]">
      <button onClick={() => playSong(song)} className="relative grid h-8 w-8 place-items-center rounded-lg text-stone-400 hover:bg-white hover:text-pinktunes-600" aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}>
        <span className={isPlaying ? 'hidden' : 'group-hover:hidden'}>{index + 1}</span><Play size={15} fill="currentColor" className={isPlaying ? 'hidden' : 'hidden group-hover:block'} /><span className={isPlaying ? '' : 'hidden'}><Pause size={15} /></span>
      </button>
      <div className="flex min-w-0 items-center gap-3"><Cover song={song} size="sm" /><div className="min-w-0"><p className={`truncate text-sm font-semibold ${isPlaying ? 'text-pinktunes-600' : 'text-stone-800'}`}>{song.title}</p><p className="truncate text-xs text-stone-500">{song.artist}</p></div></div>
      {showAlbum && <div className="hidden min-w-0 sm:block"><p className="truncate text-sm text-stone-600">{song.album || 'Single'}</p><p className="text-xs text-stone-400">{song.genre}</p></div>}
      <div className="flex items-center gap-1.5">
        <button onClick={() => toggleFavorite(song.id)} className={`rounded-lg p-2 transition ${userData.favorites.includes(song.id) ? 'text-pinktunes-500' : 'text-stone-300 opacity-0 hover:text-pinktunes-500 group-hover:opacity-100'}`} aria-label="Favoritar"><Heart size={17} fill={userData.favorites.includes(song.id) ? 'currentColor' : 'none'} /></button>
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setActiveSongMenu(activeSongMenu === song.id ? null : song.id) }} className="rounded-lg p-2 text-stone-300 hover:bg-white hover:text-stone-600" aria-label="Mais opções"><MoreHorizontal size={18} /></button>
          {activeSongMenu === song.id && <div className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-pinktunes-100 bg-white p-1.5 shadow-soft">
            <button onClick={() => { setShowPlaylist(true); setActiveSongMenu(null); setSongToAdd(song.id) }} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-pinktunes-50">Adicionar à playlist</button>
            {song.source && <a href={song.source} target="_blank" rel="noreferrer" className="block rounded-lg px-3 py-2 text-sm hover:bg-pinktunes-50">Abrir link da música</a>}
            {playlistId && <button onClick={() => { removeFromPlaylist(playlistId, song.id); setActiveSongMenu(null) }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">Remover da playlist</button>}
            <button onClick={() => { updateData((data) => ({ ...data, artists: data.artists.includes(song.artist) ? data.artists : [...data.artists, song.artist] })); setActiveSongMenu(null); notify('Artista salvo.') }} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-pinktunes-50">Salvar artista</button>
          </div>}
        </div>
      </div>
    </div>
  }
  return <div className="min-h-screen bg-[#fff9fb] text-stone-800">
    <div className="flex min-h-screen">
      <aside className={`${mobileMenu ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden'} w-64 shrink-0 flex-col border-r border-pinktunes-100 bg-white px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen`}>
        <div className="mb-10 flex items-center gap-3 px-2"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pinktunes-400 to-pinktunes-600 text-white shadow-md shadow-pinktunes-200"><AudioLines size={24} /></div><div><p className="text-lg font-extrabold tracking-tight">Pink<span className="text-pinktunes-500">Tunes</span></p><p className="text-[11px] text-stone-400">seu som, seu mundo</p></div><button className="ml-auto lg:hidden" onClick={() => setMobileMenu(false)}><X size={18} /></button></div>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Menu</p>
        <nav className="space-y-1">{navItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { setPage(id); setMobileMenu(false); setActivePlaylist(null) }} className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${page === id ? 'bg-pinktunes-50 text-pinktunes-700' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'}`}><Icon size={18} strokeWidth={1.8} />{label}{id === 'favorites' && <span className="ml-auto rounded-md bg-white px-2 py-0.5 text-xs text-stone-400">{userData.favorites.length}</span>}</button>)}</nav>
        <div className="mt-9 flex items-center justify-between px-3"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Suas playlists</p><button onClick={() => setShowPlaylist(true)} className="rounded-lg p-1.5 text-pinktunes-500 hover:bg-pinktunes-50"><Plus size={16} /></button></div>
        <div className="mt-2 space-y-1">{userData.playlists.slice(0, 5).map((pl) => <button key={pl.id} onClick={() => { setPage('playlists'); setActivePlaylist(pl.id); setMobileMenu(false) }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${activePlaylist === pl.id ? 'bg-pinktunes-50 text-pinktunes-700' : 'text-stone-500 hover:bg-stone-50'}`}><div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-pinktunes-100 to-pinktunes-200 text-pinktunes-600"><ListMusic size={15} /></div><span className="truncate">{pl.name}</span></button>)}</div>
        <div className="mt-auto rounded-2xl bg-gradient-to-br from-pinktunes-50 to-rose-100 p-4"><div className="mb-2 flex items-center gap-2 text-pinktunes-600"><Sparkles size={16} /><span className="text-xs font-bold">Seu espaço musical</span></div><p className="text-xs leading-5 text-stone-600">Guarde as músicas que combinam com cada momento.</p><div className="mt-3 flex -space-x-2"><div className="h-7 w-7 rounded-full border-2 border-white bg-pinktunes-300" /><div className="h-7 w-7 rounded-full border-2 border-white bg-fuchsia-300" /><div className="h-7 w-7 rounded-full border-2 border-white bg-rose-400" /></div></div>
        <div className="mt-5 flex items-center gap-3 border-t border-stone-100 pt-5"><div className="grid h-10 w-10 place-items-center rounded-full bg-pinktunes-100 font-bold text-pinktunes-700">{initials(currentUser?.name || session.email)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{currentUser?.name || 'Pessoa ouvinte'}</p><p className="truncate text-xs text-stone-400">{session.email}</p></div><button onClick={logout} title="Sair" className="rounded-lg p-2 text-stone-400 hover:bg-pinktunes-50 hover:text-pinktunes-600"><LogOut size={17} /></button></div>
      </aside>
      {mobileMenu && <button aria-label="Fechar menu" onClick={() => setMobileMenu(false)} className="fixed inset-0 z-30 bg-stone-900/20 lg:hidden" />}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-pinktunes-100/80 bg-[#fff9fb]/90 px-4 py-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <button onClick={() => setMobileMenu(true)} className="rounded-xl p-2 text-stone-500 hover:bg-white lg:hidden"><Menu size={20} /></button>
          <div className="relative max-w-lg flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar músicas, artistas, álbuns..." className="w-full rounded-xl border border-pinktunes-100 bg-white/90 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-pinktunes-300 focus:ring-4 focus:ring-pinktunes-100" /></div>
          <Button onClick={() => setShowAddSong(true)} className="hidden sm:inline-flex"><Plus size={16} /> Adicionar música</Button>
          <button onClick={() => setShowAddSong(true)} aria-label="Adicionar música" className="grid h-10 w-10 place-items-center rounded-xl bg-pinktunes-500 text-white sm:hidden"><Plus size={18} /></button>
          <div className="hidden h-9 w-px bg-pinktunes-100 sm:block" /><div className="grid h-9 w-9 place-items-center rounded-full bg-pinktunes-100 text-sm font-bold text-pinktunes-700">{initials(currentUser?.name || session.email)}</div>
        </header>
        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-10 lg:py-9">
          <div className="mb-7"><p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-pinktunes-500">Olá, {currentUser?.name?.split(' ')[0] || 'music lover'} 💗</p><h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">{pageTitle}</h1></div>
          {query ? <section><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Resultados da busca</h2><span className="text-sm text-stone-400">{filteredSongs.length} música(s)</span></div>{filteredSongs.length ? <div className="rounded-3xl border border-pinktunes-100 bg-white p-2 sm:p-4">{filteredSongs.map((song, i) => <SongRow key={song.id} song={song} index={i} />)}</div> : <EmptyState title="Nada encontrado" detail="Tente buscar por outro título, artista ou gênero." />}</section>
          : page === 'home' ? <div className="space-y-9">
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#fce2ec] via-[#fbd5e5] to-[#f6c2d8] p-6 sm:p-9 lg:p-11"><div className="absolute -right-10 -top-16 h-64 w-64 rounded-full border-[32px] border-white/20" /><div className="absolute right-28 top-24 h-24 w-24 rounded-full bg-white/20 blur-xl" /><div className="relative max-w-xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-3 py-1.5 text-xs font-semibold text-pinktunes-700"><WandSparkles size={14} /> Seu próximo som favorito</div><h2 className="max-w-lg text-3xl font-extrabold leading-tight tracking-tight text-pinktunes-900 sm:text-4xl">Toda música tem um lugar na sua história.</h2><p className="mt-3 max-w-md text-sm leading-6 text-pinktunes-900/70">Organize suas descobertas, crie playlists para cada momento e deixe a trilha sonora com a sua cara.</p><div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => setPage('library')}><Headphones size={17} /> Explorar biblioteca</Button><Button variant="secondary" onClick={() => setShowPlaylist(true)}>Criar playlist <ArrowRight size={15} /></Button></div></div><div className="absolute bottom-8 right-9 hidden rotate-6 rounded-3xl border border-white/70 bg-white/40 p-5 shadow-soft backdrop-blur sm:block"><Disc3 size={94} strokeWidth={1} className="text-pinktunes-600/70" /><div className="absolute inset-0 grid place-items-center"><div className="h-6 w-6 rounded-full border-4 border-pinktunes-400 bg-white" /></div></div></section>
            <section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-lg font-bold">Volte a ouvir</h2><p className="mt-1 text-sm text-stone-500">As músicas que passaram por aqui recentemente.</p></div><button onClick={() => setPage('library')} className="flex items-center gap-1 text-sm font-semibold text-pinktunes-600 hover:text-pinktunes-700">Ver biblioteca <ChevronRight size={16} /></button></div>{recentSongs.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{recentSongs.slice(0, 3).map((song) => <button key={song.id} onClick={() => playSong(song)} className="group flex items-center gap-3 rounded-2xl border border-pinktunes-100/80 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"><Cover song={song} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{song.title}</p><p className="mt-1 truncate text-xs text-stone-500">{song.artist}</p></div><span className="grid h-9 w-9 place-items-center rounded-full bg-pinktunes-500 text-white opacity-0 transition group-hover:opacity-100"><Play size={15} fill="currentColor" /></span></button>)}</div> : <EmptyState title="Sua história começa aqui" detail="Adicione uma música para vê-la aparecer por aqui." action={<Button onClick={() => setShowAddSong(true)}><Plus size={15} /> Adicionar música</Button>} />}</section>
            <section><div className="mb-4"><h2 className="text-lg font-bold">Para combinar com seu momento</h2><p className="mt-1 text-sm text-stone-500">Uma seleção da sua biblioteca para você redescobrir.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{songs.slice(0, 4).map((song) => <article key={song.id} className="group rounded-3xl border border-pinktunes-100/80 bg-white p-3.5 transition hover:-translate-y-1 hover:shadow-soft"><div className="relative mb-3"><Cover song={song} size="lg" className="h-36 w-full rounded-2xl" /><button onClick={() => playSong(song)} className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-full bg-white text-pinktunes-600 shadow-lg transition hover:scale-105"><Play size={17} fill="currentColor" /></button></div><p className="truncate font-bold">{song.title}</p><p className="mt-1 truncate text-sm text-stone-500">{song.artist}</p><div className="mt-3 flex items-center justify-between"><span className="rounded-full bg-pinktunes-50 px-2.5 py-1 text-xs text-pinktunes-600">{song.genre}</span><button onClick={() => toggleFavorite(song.id)} className="p-1.5 text-pinktunes-400 hover:text-pinktunes-600"><Heart size={17} fill={userData.favorites.includes(song.id) ? 'currentColor' : 'none'} /></button></div></article>)}</div></section>
          </div>
          : page === 'library' ? <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-stone-500">{songs.length} músicas na sua coleção</p><Button variant="secondary" onClick={() => setShowAddSong(true)}><Plus size={16} /> Nova música</Button></div>{songs.length ? <div className="rounded-3xl border border-pinktunes-100 bg-white p-2 sm:p-4"><div className="grid grid-cols-[32px_minmax(0,1.5fr)_minmax(0,1fr)_auto] gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400"><span>#</span><span>Título</span><span className="hidden sm:block">Álbum / gênero</span><span /></div>{songs.map((song, i) => <SongRow key={song.id} song={song} index={i} />)}</div> : <EmptyState title="Sua biblioteca está vazia" detail="Adicione a primeira música para começar." action={<Button onClick={() => setShowAddSong(true)}><Plus size={15} /> Adicionar música</Button>} />}</section>
          : page === 'favorites' ? <section><div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-pinktunes-100 to-rose-100 p-5"><div className="grid h-12 w-12 place-items-center rounded-xl bg-pinktunes-500 text-white"><Heart fill="currentColor" size={22} /></div><div><h2 className="font-bold">Seus xodós musicais</h2><p className="text-sm text-stone-500">{favoriteSongs.length} músicas que você marcou com carinho.</p></div></div>{favoriteSongs.length ? <div className="rounded-3xl border border-pinktunes-100 bg-white p-2 sm:p-4">{favoriteSongs.map((song, i) => <SongRow key={song.id} song={song} index={i} />)}</div> : <EmptyState icon={Heart} title="Ainda sem favoritas" detail="Toque no coração de uma música para guardá-la aqui." action={<Button onClick={() => setPage('library')}>Explorar biblioteca</Button>} />}</section>
          : page === 'playlists' ? <section>{chosenPlaylist ? <><button onClick={() => setActivePlaylist(null)} className="mb-5 text-sm font-semibold text-pinktunes-600 hover:underline">← Todas as playlists</button><div className="mb-6 flex flex-wrap items-end gap-5 rounded-3xl bg-gradient-to-br from-pinktunes-100 to-rose-100 p-6 sm:p-8"><div className="grid h-28 w-28 place-items-center rounded-2xl bg-gradient-to-br from-pinktunes-300 to-pinktunes-600 text-white shadow-soft"><ListMusic size={44} strokeWidth={1.3} /></div><div className="flex-1"><p className="text-xs font-bold uppercase tracking-[0.2em] text-pinktunes-600">Playlist</p><h2 className="mt-2 text-2xl font-extrabold">{chosenPlaylist.name}</h2><p className="mt-2 text-sm text-stone-600">{playlistSongs.length} músicas · criada por você</p></div><Button onClick={() => playlistSongs[0] && playSong(playlistSongs[0])}><Play size={16} fill="currentColor" /> Reproduzir</Button></div>{playlistSongs.length ? <div className="rounded-3xl border border-pinktunes-100 bg-white p-2 sm:p-4">{playlistSongs.map((song, i) => <SongRow key={song.id} song={song} index={i} playlistId={chosenPlaylist.id} />)}</div> : <EmptyState title="Essa playlist está esperando música" detail="Abra sua biblioteca e adicione músicas pelo menu de opções." action={<Button onClick={() => setPage('library')}>Ir para a biblioteca</Button>} />}</> : <><div className="mb-5 flex items-center justify-between"><p className="text-sm text-stone-500">Playlists para cada humor, lembrança e momento.</p><Button onClick={() => setShowPlaylist(true)}><Plus size={16} /> Criar playlist</Button></div>{userData.playlists.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{userData.playlists.map((pl, i) => <article key={pl.id} className="rounded-3xl border border-pinktunes-100 bg-white p-4 transition hover:shadow-soft"><button onClick={() => setActivePlaylist(pl.id)} className="group w-full text-left"><div className={`relative mb-4 grid h-40 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${coverStyles[i % coverStyles.length]}`}><div className="absolute -right-4 -top-4 h-28 w-28 rounded-full border-[18px] border-white/20" /><ListMusic size={48} className="relative text-white/90" strokeWidth={1.2} /><span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-white text-pinktunes-600 opacity-0 shadow-lg transition group-hover:opacity-100"><Play size={16} fill="currentColor" /></span></div><h3 className="truncate font-bold">{pl.name}</h3><p className="mt-1 text-sm text-stone-500">{pl.songIds.length} músicas</p></button><div className="mt-3 flex justify-end"><Button variant="ghost" className="px-2 py-2 text-xs" onClick={() => deletePlaylist(pl.id)}><Trash2 size={14} /> Excluir</Button></div></article>)}</div> : <EmptyState icon={ListMusic} title="Nenhuma playlist ainda" detail="Crie uma playlist para separar suas músicas por estilo ou momento." action={<Button onClick={() => setShowPlaylist(true)}><Plus size={15} /> Criar playlist</Button>} />}</>}</section>
          : page === 'artists' ? <section><div className="mb-5"><h2 className="font-bold">Artistas da sua órbita</h2><p className="mt-1 text-sm text-stone-500">Salve artistas que você quer acompanhar.</p></div>{artists.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{artists.map((artist, i) => { const artistSongs = songs.filter((song) => song.artist.toLowerCase().includes(artist.toLowerCase())); const saved = userData.artists.includes(artist); return <article key={artist} className="flex items-center gap-4 rounded-3xl border border-pinktunes-100 bg-white p-4"><div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br ${coverStyles[i % coverStyles.length]} text-xl font-bold text-white`}>{initials(artist)}</div><div className="min-w-0 flex-1"><h3 className="truncate font-bold">{artist}</h3><p className="mt-1 text-xs text-stone-500">{artistSongs.length} música(s) na biblioteca</p><button onClick={() => toggleArtist(artist)} className={`mt-2 text-xs font-semibold ${saved ? 'text-stone-400 hover:text-rose-600' : 'text-pinktunes-600'}`}>{saved ? '✓ Salvo · Remover' : '+ Salvar artista'}</button></div></article> })}</div> : <EmptyState icon={Mic2} title="Seus artistas aparecem aqui" detail="Salve um artista pelo menu de uma música." />}</section>
          : null}
        </div>
      </main>
    </div>
    {playing && <div className="fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-pinktunes-100 bg-white/95 p-3 shadow-[0_15px_60px_rgba(100,40,60,0.18)] backdrop-blur-xl sm:inset-x-6 sm:gap-4 sm:p-4"><Cover song={playing} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{playing.title}</p><p className="truncate text-xs text-stone-500">{playing.artist}</p></div><div className="hidden items-center gap-1 text-stone-300 sm:flex"><span className="h-1 w-1 rounded-full bg-pinktunes-400" /><span className="h-1.5 w-1 rounded-full bg-pinktunes-400" /><span className="h-2 w-1 rounded-full bg-pinktunes-400" /><span className="h-1 w-1 rounded-full bg-pinktunes-400" /></div><button onClick={() => toggleFavorite(playing.id)} className="p-2 text-pinktunes-500"><Heart size={18} fill={userData.favorites.includes(playing.id) ? 'currentColor' : 'none'} /></button><button onClick={() => setPlaying(null)} className="grid h-10 w-10 place-items-center rounded-full bg-pinktunes-500 text-white"><Pause size={18} fill="currentColor" /></button></div>}
    {toast && <div className="fixed right-4 top-20 z-50 flex items-center gap-2 rounded-xl border border-pinktunes-100 bg-white px-4 py-3 text-sm font-medium shadow-soft"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check size={15} /></span>{toast}</div>}
    {showAddSong && <Modal title="Adicionar música" subtitle="Organize uma música na sua coleção." onClose={() => setShowAddSong(false)}><form onSubmit={addSong} className="space-y-4"><Field label="Nome da música *" value={songForm.title} onChange={(e) => setSongForm({ ...songForm, title: e.target.value })} placeholder="Ex.: Golden" required /><Field label="Artista *" value={songForm.artist} onChange={(e) => setSongForm({ ...songForm, artist: e.target.value })} placeholder="Ex.: Harry Styles" required /><Field label="Álbum" value={songForm.album} onChange={(e) => setSongForm({ ...songForm, album: e.target.value })} placeholder="Nome do álbum" /><div className="grid grid-cols-2 gap-3"><label className="block"><span className="mb-1.5 block text-sm font-medium text-stone-600">Gênero</span><select value={songForm.genre} onChange={(e) => setSongForm({ ...songForm, genre: e.target.value })} className="w-full rounded-xl border border-pinktunes-100 bg-white px-3 py-3 text-sm outline-none focus:border-pinktunes-400">{['Pop', 'R&B', 'Indie', 'Rock', 'MPB', 'Hip-hop', 'Eletrônica', 'Outro'].map((genre) => <option key={genre}>{genre}</option>)}</select></label><Field label="Ano" type="number" value={songForm.year} onChange={(e) => setSongForm({ ...songForm, year: e.target.value })} /></div><Field label="Link (opcional)" type="url" value={songForm.source} onChange={(e) => setSongForm({ ...songForm, source: e.target.value })} placeholder="https://..." /><p className="text-xs text-stone-400">O link é salvo como referência; esta versão não reproduz áudio diretamente.</p><div className="flex justify-end gap-2 pt-2"><Button variant="secondary" type="button" onClick={() => setShowAddSong(false)}>Cancelar</Button><Button type="submit"><Plus size={15} /> Adicionar</Button></div></form></Modal>}
    {showPlaylist && <Modal title="Criar playlist" subtitle="Dê um nome para sua nova coleção." onClose={() => { setShowPlaylist(false); setSongToAdd(null) }}><form onSubmit={(e) => { if (songToAdd) { e.preventDefault(); const name = newPlaylistName.trim(); if (name) { const pl = { id: `pl-${Date.now()}`, name, songIds: [songToAdd] }; updateData((data) => ({ ...data, playlists: [...data.playlists, pl] })); setNewPlaylistName(''); setShowPlaylist(false); setSongToAdd(null); notify('Playlist criada e música adicionada!') } } else createPlaylist(e) }} className="space-y-4"><Field label="Nome da playlist" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Ex.: Para cantar no banho ✨" autoFocus required /><div className="flex justify-end gap-2 pt-2"><Button variant="secondary" type="button" onClick={() => { setShowPlaylist(false); setSongToAdd(null) }}>Cancelar</Button><Button type="submit"><Plus size={15} /> Criar playlist</Button></div></form>{songToAdd && <div className="mt-5 border-t border-stone-100 pt-4"><p className="mb-3 text-sm font-semibold">Ou adicione à playlist existente</p><div className="space-y-1">{userData.playlists.map((pl) => <button key={pl.id} onClick={() => { addToPlaylist(pl.id, songToAdd); setShowPlaylist(false); setSongToAdd(null) }} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-pinktunes-50"><span>{pl.name}</span><Plus size={15} className="text-pinktunes-500" /></button>)}</div></div>}</Modal>}
  </div>
}

function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    function onKey(event) { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/30 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><div className="soft-scrollbar max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-pinktunes-100 bg-[#fffdfd] p-6 shadow-2xl sm:p-7"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-xl font-extrabold">{title}</h2><p className="mt-1 text-sm text-stone-500">{subtitle}</p></div><button onClick={onClose} className="rounded-xl p-2 text-stone-400 hover:bg-pinktunes-50"><X size={18} /></button></div>{children}</div></div>
}

function AuthScreen({ mode, setMode, name, setName, email, setEmail, password, setPassword, error, onSubmit }) {
  const signup = mode === 'signup'
  return <div className="min-h-screen bg-[#fff8fb] lg:grid lg:grid-cols-[1.02fr_0.98fr]">
    <section className="relative hidden overflow-hidden bg-gradient-to-br from-pinktunes-200 via-pinktunes-300 to-pinktunes-500 p-12 text-pinktunes-900 lg:flex lg:flex-col lg:justify-between xl:p-16"><div className="absolute -right-28 -top-20 h-96 w-96 rounded-full border-[55px] border-white/15" /><div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full border-[45px] border-white/15" /><div className="relative flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/40"><AudioLines size={27} /></div><span className="text-xl font-extrabold">PinkTunes</span></div><div className="relative max-w-lg"><div className="mb-6 flex items-center gap-3"><div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/60 bg-white/30"><Music2 size={26} /></div><div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/60 bg-white/30"><Headphones size={26} /></div><div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/60 bg-white/30"><Heart size={26} /></div></div><h1 className="text-5xl font-extrabold leading-tight tracking-tight xl:text-6xl">A vida fica melhor com trilha sonora.</h1><p className="mt-5 max-w-md text-base leading-7 text-pinktunes-900/75">Um cantinho só seu para guardar músicas, criar playlists e colecionar artistas favoritos.</p><div className="mt-8 flex items-center gap-3"><div className="flex -space-x-2"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-pinktunes-300 bg-rose-100 text-xs">🎧</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-pinktunes-300 bg-purple-100 text-xs">🎶</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-pinktunes-300 bg-orange-100 text-xs">💗</span></div><p className="text-sm font-medium text-pinktunes-900/75">Sua música. Seu momento.</p></div></div><p className="relative text-xs text-pinktunes-900/60">Feito para quem sente tudo em forma de música.</p></section>
    <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10"><div className="w-full max-w-md"><div className="mb-9 flex items-center justify-center gap-3 lg:hidden"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pinktunes-400 to-pinktunes-600 text-white"><AudioLines size={23} /></div><span className="text-xl font-extrabold">Pink<span className="text-pinktunes-500">Tunes</span></span></div><div className="mb-8"><div className="mb-4 inline-flex rounded-full bg-pinktunes-50 px-3 py-1.5 text-xs font-bold text-pinktunes-600"><Sparkles size={14} className="mr-1.5" /> SEU ESPAÇO MUSICAL</div><h2 className="text-3xl font-extrabold tracking-tight text-stone-900">{signup ? 'Crie sua conta' : 'Que bom ter você de volta!'}</h2><p className="mt-2 text-sm leading-6 text-stone-500">{signup ? 'Comece a montar uma biblioteca com a sua personalidade.' : 'Entre e continue de onde sua música parou.'}</p></div><form onSubmit={onSubmit} className="space-y-4">{signup && <Field label="Seu nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos te chamar?" autoComplete="name" required />}<Field label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" autoComplete="email" required /><Field label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={signup ? 'Pelo menos 6 caracteres' : 'Sua senha'} autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 6 : undefined} required />{error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}<Button type="submit" className="mt-2 w-full justify-center py-3.5">{signup ? 'Criar minha conta' : 'Entrar na minha conta'} <ArrowRight size={16} /></Button></form><p className="mt-6 text-center text-sm text-stone-500">{signup ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <button onClick={() => setMode(signup ? 'login' : 'signup')} className="font-bold text-pinktunes-600 hover:underline">{signup ? 'Entrar' : 'Criar conta'}</button></p><div className="mt-8 flex items-center justify-center gap-2 text-xs text-stone-400"><Heart size={13} className="text-pinktunes-400" /> Feito com carinho para sua biblioteca musical</div><p className="mt-5 text-center text-[11px] leading-5 text-stone-400">Versão demonstrativa: os dados ficam neste navegador. Não use uma senha real.</p></div></section>
  </div>
}
