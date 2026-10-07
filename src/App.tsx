import React, { useState, useEffect, useMemo } from 'react';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================
type CandidateType = 'ketua' | 'wakil';
type ElectionStatus = 'belum_mulai' | 'berlangsung' | 'selesai';

interface Candidate {
  id: string;
  type: CandidateType;
  number: number;
  name: string;
  class: string;
  vision: string;
  mission: string;
  photo_url: string;
  is_active: boolean;
}

interface Voter {
  id: string;
  name: string;
  class: string;
  gender: 'L' | 'P';
  has_voted: boolean;
  voted_at?: string;
}

interface Vote {
  id: string;
  candidate_id: string;
  candidate_type: CandidateType;
  created_at: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  details: string;
}

interface SchoolSettings {
  name: string;
  year: string;
  status: ElectionStatus;
  showResults: boolean;
  showWinners: boolean;
  logo?: string; // data-URL logo hasil upload (opsional)
}

// ==========================================
// 2. MOCK INITIAL DATA
// ==========================================
const INITIAL_SETTINGS: SchoolSettings = {
  name: 'SMK 02 ISLAM 45 AMBULU',
  year: 'Tahun Pelajaran 2026/2027',
  status: 'berlangsung',
  showResults: true,
  showWinners: false,
};

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'k1',
    type: 'ketua',
    number: 1,
    name: 'Ahmad Mubarok',
    class: 'XI AKL 1',
    vision: 'Mewujudkan OSIS yang inovatif, berkarakter, dan responsif terhadap aspirasi siswa.',
    mission: '1. Mengembangkan kegiatan ekstrakurikuler berbasis teknologi.\n2. Mengadakan forum dialog rutin antar kelas.\n3. Meningkatkan kedisiplinan dan kepedulian lingkungan.',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'k2',
    type: 'ketua',
    number: 2,
    name: 'Budi Santoso',
    class: 'XI RPL 2',
    vision: 'Siswa cerdas, sekolah maju, OSIS berprestasi di tingkat nasional.',
    mission: '1. Membentuk klub olimpiade dan keahlian siswa.\n2. Optimalisasi media sosial OSIS sebagai sarana kreativitas.\n3. Menjalin kerja sama inter-sekolah.',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'k3',
    type: 'ketua',
    number: 3,
    name: 'Citra Kirana',
    class: 'XI TKJ 1',
    vision: 'Membangun karakter siswa yang mandiri, berbudaya, dan berwawasan lingkungan.',
    mission: '1. Menggalakkan gerakan zero-waste di lingkungan sekolah.\n2. Menyelenggarakan festival seni dan teknologi tahunan.\n3. Memperkuat persatuan antarkelas.',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'w1',
    type: 'wakil',
    number: 1,
    name: 'Deni Setiawan',
    class: 'X AKL 1',
    vision: 'Mendukung program ketua secara responsif, solutif, dan berintegritas.',
    mission: '1. Mengelola administrasi OSIS secara transparan.\n2. Membantu koordinasi kegiatan siswa secara efektif.',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'w2',
    type: 'wakil',
    number: 2,
    name: 'Eka Putri',
    class: 'X RPL 1',
    vision: 'Kreativitas tanpa batas untuk kemajuan organisasi siswa.',
    mission: '1. Menyelenggarakan program minat bakat siswa.\n2. Menjaga komunikasi yang harmonis antar OSIS dan MPK.',
    photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80',
    is_active: true,
  },
];

const INITIAL_VOTERS: Voter[] = [
  { id: 'v1', name: 'Ahmad Rizky', class: 'X AKL 1', gender: 'L', has_voted: false },
  { id: 'v2', name: 'Siti Nurhaliza', class: 'X AKL 1', gender: 'P', has_voted: true, voted_at: '2026-10-06T08:15:00.000Z' },
  { id: 'v3', name: 'Bambang Pamungkas', class: 'X RPL 1', gender: 'L', has_voted: false },
  { id: 'v4', name: 'Dewi Lestari', class: 'XI TKJ 1', gender: 'P', has_voted: false },
  { id: 'v5', name: 'Eko Prasetyo', class: 'XI RPL 2', gender: 'L', has_voted: true, voted_at: '2026-10-06T09:30:00.000Z' },
  { id: 'v6', name: 'Fani Fitriani', class: 'XI AKL 1', gender: 'P', has_voted: false },
  { id: 'v7', name: 'Gilang Ramadhan', class: 'X TKJ 1', gender: 'L', has_voted: false },
];

const INITIAL_VOTES: Vote[] = [
  { id: 'vote-1', candidate_id: 'k1', candidate_type: 'ketua', created_at: '2026-10-06T08:15:00.000Z' },
  { id: 'vote-2', candidate_id: 'w2', candidate_type: 'wakil', created_at: '2026-10-06T08:15:00.000Z' },
  { id: 'vote-3', candidate_id: 'k2', candidate_type: 'ketua', created_at: '2026-10-06T09:30:00.000Z' },
  { id: 'vote-4', candidate_id: 'w1', candidate_type: 'wakil', created_at: '2026-10-06T09:30:00.000Z' },
];

const INITIAL_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: new Date().toLocaleTimeString(), admin: 'admin', action: 'Inisialisasi Sistem', details: 'Sistem e-voting disiapkan untuk pemilihan.' },
];

// ==========================================
// 3. INLINE SVG ICONS (Zero external dependencies)
// ==========================================
const IconCheck = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconUser = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconUsers = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconLock = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const IconChart = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const IconSettings = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconPrinter = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const IconTrophy = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2 0h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const IconSpreadsheet = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconPlus = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const IconTrash = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconLogOut = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconServer = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
  </svg>
);

// ==========================================
// HELPERS & LOGO
// ==========================================
const ADMIN_USER: string = (import.meta as any).env?.VITE_ADMIN_USERNAME || 'admin';
const ADMIN_PASS: string = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'admin123';

// Waktu suara dibulatkan ke jam agar tidak bisa dicocokkan dengan waktu memilih seorang siswa (menjaga kerahasiaan)
const hourOnly = (iso: string) => iso.slice(0, 13) + ':00:00.000Z';

function resizeImage(file: File, max: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('File harus berupa gambar (PNG/JPG/WEBP).'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gambar tidak valid.'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const t = String(v ?? '');
    return /[",\n;]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const blob = new Blob(['\uFEFF' + rows.map(r => r.map(esc).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Logo: memakai logo upload (Pengaturan) -> /logo.png -> teks "OSIS" bila gambar tidak ditemukan
const LogoCtx = React.createContext<string>('/logo.png');

const SchoolLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
  const src = React.useContext(LogoCtx);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  if (failed) {
    return <div className={`${className} bg-amber-400 text-blue-950 rounded-full flex items-center justify-center font-bold text-xs shrink-0`}>OSIS</div>;
  }
  return <img src={src} alt="Logo sekolah" onError={() => setFailed(true)} className={`${className} object-contain shrink-0`} />;
};

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================
export default function App() {
  // Persistence with LocalStorage
  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem('evoting_settings');
    return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('evoting_candidates');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });

  const [votersDB, setVotersDB] = useState<Voter[]>(() => {
    const saved = localStorage.getItem('evoting_voters');
    return saved ? JSON.parse(saved) : INITIAL_VOTERS;
  });

  const [votes, setVotes] = useState<Vote[]>(() => {
    const saved = localStorage.getItem('evoting_votes');
    return saved ? JSON.parse(saved) : INITIAL_VOTES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('evoting_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // App Navigation State
  const [activeTab, setActiveTab] = useState<'landing' | 'voter_login' | 'voting' | 'admin_login' | 'admin_dashboard' | 'public_results'>('landing');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  // Current Voter Session
  const [currentVoter, setCurrentVoter] = useState<Voter | null>(null);
  
  // Voting Form Step State
  const [votingStep, setVotingStep] = useState<'ketua' | 'wakil' | 'konfirmasi' | 'sukses'>('ketua');
  const [selectedKetua, setSelectedKetua] = useState<Candidate | null>(null);
  const [selectedWakil, setSelectedWakil] = useState<Candidate | null>(null);
  const [voteTimestamp, setVoteTimestamp] = useState<string>('');

  // Save to LocalStorage whenever state updates
  useEffect(() => {
    localStorage.setItem('evoting_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('evoting_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('evoting_voters', JSON.stringify(votersDB));
  }, [votersDB]);

  useEffect(() => {
    localStorage.setItem('evoting_votes', JSON.stringify(votes));
  }, [votes]);

  useEffect(() => {
    localStorage.setItem('evoting_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Sinkronisasi antar tab browser (mis. tab admin otomatis memperbarui angka saat tab lain memilih)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        const d = JSON.parse(e.newValue);
        if (e.key === 'evoting_settings') setSettings(d);
        else if (e.key === 'evoting_candidates') setCandidates(d);
        else if (e.key === 'evoting_voters') setVotersDB(d);
        else if (e.key === 'evoting_votes') setVotes(d);
        else if (e.key === 'evoting_logs') setAuditLogs(d);
      } catch { /* abaikan data rusak */ }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Helper for audit log
  const addLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('id-ID'),
      admin: 'admin',
      action,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Submit Vote Handler (Simulating Atomic DB Transaction)
  const handleFinalSubmitVote = () => {
    if (!currentVoter || !selectedKetua || !selectedWakil) return;

    // 0. Pemilihan harus masih berlangsung
    if (settings.status !== 'berlangsung') {
      alert('Pemilihan sedang tidak berlangsung. Suara tidak dapat dikirim.');
      setCurrentVoter(null);
      setActiveTab('landing');
      return;
    }

    // 1. Cek ulang status pemilih dari data terbaru (mencegah dobel vote lewat dua tab)
    let storedVoters: Voter[] = votersDB;
    try { storedVoters = JSON.parse(localStorage.getItem('evoting_voters') || '') as Voter[]; } catch { /* pakai state */ }
    const latestVoter = storedVoters.find(v => v.id === currentVoter.id);
    if (!latestVoter || latestVoter.has_voted) {
      alert('Gagal: Anda telah memberikan suara sebelumnya atau data tidak valid.');
      setActiveTab('landing');
      return;
    }

    const now = new Date().toISOString();

    // 2. Atomic Vote Recording (Separated from voter identity for anonymity)
    const newVoteKetua: Vote = {
      id: 'vote-' + Date.now() + '-1',
      candidate_id: selectedKetua.id,
      candidate_type: 'ketua',
      created_at: hourOnly(now),
    };

    const newVoteWakil: Vote = {
      id: 'vote-' + Date.now() + '-2',
      candidate_id: selectedWakil.id,
      candidate_type: 'wakil',
      created_at: hourOnly(now),
    };

    setVotes(prev => [...prev, newVoteKetua, newVoteWakil]);

    // 3. Mark Voter as Voted
    setVotersDB(prev => prev.map(v => {
      if (v.id === currentVoter.id) {
        return { ...v, has_voted: true, voted_at: now };
      }
      return v;
    }));

    setVoteTimestamp(new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' }));
    setVotingStep('sukses');
  };

  // Logout/Finish Session
  const handleFinishVotingSession = () => {
    setCurrentVoter(null);
    setSelectedKetua(null);
    setSelectedWakil(null);
    setVotingStep('ketua');
    setActiveTab('landing');
  };

  return (
    <LogoCtx.Provider value={settings.logo || '/logo.png'}>
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Dynamic Render based on Navigation */}
      {activeTab === 'landing' && (
        <LandingPage 
          settings={settings} 
          onStartVote={() => setActiveTab('voter_login')} 
          onAdminLogin={() => setActiveTab('admin_login')}
          onShowResults={() => setActiveTab('public_results')} 
        />
      )}

      {activeTab === 'voter_login' && (
        <VoterLoginPage 
          settings={settings} 
          votersDB={votersDB} 
          onSuccessLogin={(voter) => {
            setCurrentVoter(voter);
            setVotingStep('ketua');
            setActiveTab('voting');
          }}
          onBack={() => setActiveTab('landing')}
        />
      )}

      {activeTab === 'voting' && currentVoter && (
        <VotingFlowPage 
          settings={settings}
          candidates={candidates}
          currentVoter={currentVoter}
          votingStep={votingStep}
          setVotingStep={setVotingStep}
          selectedKetua={selectedKetua}
          setSelectedKetua={setSelectedKetua}
          selectedWakil={selectedWakil}
          setSelectedWakil={setSelectedWakil}
          onSubmitVote={handleFinalSubmitVote}
          voteTimestamp={voteTimestamp}
          onFinish={handleFinishVotingSession}
        />
      )}

      {activeTab === 'public_results' && (
        <PublicResultsPage settings={settings} candidates={candidates} votes={votes} onBack={() => setActiveTab('landing')} />
      )}

      {activeTab === 'admin_login' && (
        <AdminLoginPage 
          onSuccess={() => {
            setIsAdminAuthenticated(true);
            setActiveTab('admin_dashboard');
            addLog('Admin Login', 'Administrator berhasil masuk ke dashboard.');
          }}
          onBack={() => setActiveTab('landing')}
        />
      )}

      {activeTab === 'admin_dashboard' && isAdminAuthenticated && (
        <AdminDashboardPage 
          settings={settings}
          setSettings={setSettings}
          candidates={candidates}
          setCandidates={setCandidates}
          votersDB={votersDB}
          setVotersDB={setVotersDB}
          votes={votes}
          auditLogs={auditLogs}
          addLog={addLog}
          onLogout={() => {
            setIsAdminAuthenticated(false);
            setActiveTab('landing');
            addLog('Admin Logout', 'Administrator keluar dari sistem.');
          }}
        />
      )}
    </div>
    </LogoCtx.Provider>
  );
}

// ==========================================
// 5. LANDING PAGE COMPONENT
// ==========================================
function LandingPage({ settings, onStartVote, onAdminLogin, onShowResults }: { settings: SchoolSettings; onStartVote: () => void; onAdminLogin: () => void; onShowResults?: () => void }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <SchoolLogo className="w-12 h-12" />
          <div>
            <h1 className="font-bold text-lg leading-tight">{settings.name}</h1>
            <p className="text-xs text-blue-200">{settings.year}</p>
          </div>
        </div>
        <button 
          onClick={onAdminLogin}
          className="text-xs md:text-sm bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 transition flex items-center gap-2"
        >
          <IconLock className="w-4 h-4" /> Admin Panel
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center items-center">
        <span className="inline-block px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold mb-6 border border-blue-400/30">
          E-Voting Pemilihan Ketua & Wakil OSIS
        </span>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Suaramu Menentukan Arah Kepemimpinan.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
          Gunakan hak pilih Anda secara jujur, adil, dan rahasia. Satu suara menentukan masa depan organisasi sekolah kita.
        </p>

        <button 
          onClick={onStartVote}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 flex items-center gap-3"
        >
          <span>MULAI MEMILIH SEKARANG</span>
          <IconCheck className="w-6 h-6" />
        </button>

        {settings.showResults && onShowResults && (
          <button onClick={onShowResults} className="mt-5 text-sm text-blue-200 hover:text-white underline underline-offset-4">
            Lihat Hasil Pemilihan
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-4">
              <IconCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">1 Pemilih = 1 Suara</h3>
            <p className="text-sm text-slate-400">Sistem terlindungi dari penginputan ganda dengan autentikasi unik.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
            <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center mb-4">
              <IconUsers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Mudah & Cepat</h3>
            <p className="text-sm text-slate-400">Tampilan simpel dan responsif di smartphone maupun komputer.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center mb-4">
              <IconLock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Kerahasiaan Terjamin</h3>
            <p className="text-sm text-slate-400">Pilihan calon Anda disimpan terpisah dari identitas pemilih.</p>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-slate-400 border-t border-white/10">
        &copy; 2026 {settings.name}. Sistem E-Voting Resmi.
      </footer>
    </div>
  );
}

// ==========================================
// 6. VOTER LOGIN PAGE COMPONENT (Nama & Kelas ONLY)
// ==========================================
function VoterLoginPage({ 
  settings, 
  votersDB, 
  onSuccessLogin, 
  onBack 
}: { 
  settings: SchoolSettings; 
  votersDB: Voter[]; 
  onSuccessLogin: (voter: Voter) => void; 
  onBack: () => void;
}) {
  const [nameInput, setNameInput] = useState('');
  const [classInput, setClassInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Extract unique classes for select dropdown
  const classOptions = useMemo(() => {
    const list = Array.from(new Set(votersDB.map(v => v.class)));
    return list.sort();
  }, [votersDB]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (settings.status === 'belum_mulai') {
      setErrorMsg('Pemilihan belum dibuka oleh Panitia/Administrator.');
      return;
    }

    if (settings.status === 'selesai') {
      setErrorMsg('Pemilihan telah resmi ditutup.');
      return;
    }

    if (!nameInput.trim() || !classInput) {
      setErrorMsg('Harap isi Nama Lengkap dan pilih Kelas Anda.');
      return;
    }

    // Match Voter by Name (case-insensitive) AND Class
    const matchedVoter = votersDB.find(
      v => v.name.trim().toLowerCase() === nameInput.trim().toLowerCase() && v.class === classInput
    );

    if (!matchedVoter) {
      setErrorMsg('Data pemilih tidak ditemukan. Silakan periksa kembali ejaan Nama Lengkap dan Kelas Anda.');
      return;
    }

    if (matchedVoter.has_voted) {
      setErrorMsg('Anda sudah menggunakan hak suara. Setiap pemilih hanya dapat memberikan suara satu kali.');
      return;
    }

    onSuccessLogin(matchedVoter);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <button 
          onClick={onBack}
          className="text-xs text-slate-500 hover:text-slate-800 mb-6 flex items-center gap-1 font-semibold"
        >
          &larr; Kembali ke Beranda
        </button>

        <div className="text-center mb-8">
          <SchoolLogo className="w-16 h-16 mx-auto mb-3" />
          <h2 className="text-2xl font-extrabold text-slate-800">Verifikasi Pemilih</h2>
          <p className="text-sm text-slate-500 mt-1">Masukkan Nama dan Kelas Anda untuk melanjutkan</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 text-xs leading-relaxed font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Lengkap</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <IconUser className="w-5 h-5" />
              </span>
              <input 
                type="text" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition"
                placeholder="Contoh: Ahmad Rizky"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pilih Kelas</label>
            <select 
              className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition"
              value={classInput}
              onChange={(e) => setClassInput(e.target.value)}
              required
            >
              <option value="">-- Pilih Kelas --</option>
              {classOptions.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition duration-200 flex justify-center items-center gap-2 mt-4"
          >
            <IconLock className="w-5 h-5" />
            <span>VERIFIKASI & MASUK</span>
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          Mengalami kendala? Hubungi Panitia Pemilihan OSIS.
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. VOTING FLOW COMPONENT (Ketua -> Wakil -> Konfirmasi -> Sukses)
// ==========================================
function VotingFlowPage({
  settings,
  candidates,
  currentVoter,
  votingStep,
  setVotingStep,
  selectedKetua,
  setSelectedKetua,
  selectedWakil,
  setSelectedWakil,
  onSubmitVote,
  voteTimestamp,
  onFinish
}: {
  settings: SchoolSettings;
  candidates: Candidate[];
  currentVoter: Voter;
  votingStep: 'ketua' | 'wakil' | 'konfirmasi' | 'sukses';
  setVotingStep: React.Dispatch<React.SetStateAction<'ketua' | 'wakil' | 'konfirmasi' | 'sukses'>>;
  selectedKetua: Candidate | null;
  setSelectedKetua: (c: Candidate) => void;
  selectedWakil: Candidate | null;
  setSelectedWakil: (c: Candidate) => void;
  onSubmitVote: () => void;
  voteTimestamp: string;
  onFinish: () => void;
}) {
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null);

  const ketuaList = useMemo(() => candidates.filter(c => c.type === 'ketua' && c.is_active), [candidates]);
  const wakilList = useMemo(() => candidates.filter(c => c.type === 'wakil' && c.is_active), [candidates]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-12">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{settings.name}</span>
            <h1 className="text-lg font-extrabold text-slate-800">Bilik Suara Digital</h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Pemilih Terverifikasi:</span>
            <span className="text-sm font-bold text-slate-700">{currentVoter.name} ({currentVoter.class})</span>
          </div>
        </div>
      </header>

      {/* Stepper Header */}
      {votingStep !== 'sukses' && (
        <div className="bg-slate-900 text-white py-4 px-6 mb-8">
          <div className="max-w-3xl mx-auto flex justify-between items-center text-xs md:text-sm font-bold">
            <div className={`flex items-center gap-2 ${votingStep === 'ketua' ? 'text-amber-400' : 'text-slate-400'}`}>
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center">1</span>
              <span>Pilih Ketua</span>
            </div>
            <div className="h-0.5 w-8 bg-slate-700"></div>
            <div className={`flex items-center gap-2 ${votingStep === 'wakil' ? 'text-amber-400' : 'text-slate-400'}`}>
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center">2</span>
              <span>Pilih Wakil</span>
            </div>
            <div className="h-0.5 w-8 bg-slate-700"></div>
            <div className={`flex items-center gap-2 ${votingStep === 'konfirmasi' ? 'text-amber-400' : 'text-slate-400'}`}>
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center">3</span>
              <span>Konfirmasi</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 flex-1 w-full">
        {/* STEP 1: PILIH KETUA */}
        {votingStep === 'ketua' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">PILIH CALON KETUA OSIS</h2>
              <p className="text-sm text-slate-500 mt-1">Klik pada kartu calon untuk memilih, lalu tekan tombol Lanjut.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {ketuaList.map((c) => {
                const isSelected = selectedKetua?.id === c.id;
                return (
                  <div 
                    key={c.id} 
                    className={`bg-white rounded-3xl border-2 transition-all duration-200 overflow-hidden shadow-sm flex flex-col justify-between ${
                      isSelected ? 'border-blue-600 ring-4 ring-blue-100 shadow-xl' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="p-6 text-center flex-1">
                      <div className="relative inline-block mb-4">
                        <img 
                          src={c.photo_url} 
                          alt={c.name} 
                          className="w-32 h-32 rounded-2xl object-cover mx-auto shadow"
                        />
                        <span className="absolute -top-2 -left-2 bg-slate-900 text-white font-extrabold text-sm px-3 py-1 rounded-xl">
                          0{c.number}
                        </span>
                        {isSelected && (
                          <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1.5 shadow">
                            <IconCheck className="w-5 h-5" />
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-xl text-slate-800">{c.name}</h3>
                      <p className="text-xs font-semibold text-blue-600 mb-3">{c.class}</p>
                      
                      <p className="text-xs text-slate-500 line-clamp-3 italic mb-4">
                        "{c.vision}"
                      </p>

                      <button 
                        onClick={() => setDetailCandidate(c)}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        Lihat Visi & Misi Lengkap
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                      <button 
                        onClick={() => setSelectedKetua(c)}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow' 
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ PILIHAN ANDA' : 'PILIH CALON'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end border-t border-slate-200 pt-6">
              <button 
                onClick={() => setVotingStep('wakil')}
                disabled={!selectedKetua}
                className="bg-blue-600 disabled:bg-slate-300 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow transition flex items-center gap-2"
              >
                <span>LANJUT KE PILIH WAKIL</span>
                &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PILIH WAKIL */}
        {votingStep === 'wakil' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">PILIH CALON WAKIL KETUA OSIS</h2>
              <p className="text-sm text-slate-500 mt-1">Pilih salah satu calon wakil ketua untuk mendampingi ketua pilihan Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {wakilList.map((c) => {
                const isSelected = selectedWakil?.id === c.id;
                return (
                  <div 
                    key={c.id} 
                    className={`bg-white rounded-3xl border-2 transition-all duration-200 overflow-hidden shadow-sm flex flex-col justify-between ${
                      isSelected ? 'border-emerald-600 ring-4 ring-emerald-100 shadow-xl' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="p-6 text-center flex-1">
                      <div className="relative inline-block mb-4">
                        <img 
                          src={c.photo_url} 
                          alt={c.name} 
                          className="w-32 h-32 rounded-2xl object-cover mx-auto shadow"
                        />
                        <span className="absolute -top-2 -left-2 bg-slate-900 text-white font-extrabold text-sm px-3 py-1 rounded-xl">
                          0{c.number}
                        </span>
                        {isSelected && (
                          <span className="absolute -top-2 -right-2 bg-emerald-600 text-white rounded-full p-1.5 shadow">
                            <IconCheck className="w-5 h-5" />
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-xl text-slate-800">{c.name}</h3>
                      <p className="text-xs font-semibold text-emerald-600 mb-3">{c.class}</p>
                      
                      <p className="text-xs text-slate-500 line-clamp-3 italic mb-4">
                        "{c.vision}"
                      </p>

                      <button 
                        onClick={() => setDetailCandidate(c)}
                        className="text-xs text-emerald-600 hover:underline font-semibold"
                      >
                        Lihat Visi & Misi Lengkap
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                      <button 
                        onClick={() => setSelectedWakil(c)}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition ${
                          isSelected 
                            ? 'bg-emerald-600 text-white shadow' 
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ PILIHAN ANDA' : 'PILIH CALON'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between border-t border-slate-200 pt-6">
              <button 
                onClick={() => setVotingStep('ketua')}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-6 py-3.5 rounded-xl transition"
              >
                &larr; Kembali ke Pilih Ketua
              </button>

              <button 
                onClick={() => setVotingStep('konfirmasi')}
                disabled={!selectedWakil}
                className="bg-emerald-600 disabled:bg-slate-300 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl shadow transition flex items-center gap-2"
              >
                <span>LANJUT KE KONFIRMASI</span>
                &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: KONFIRMASI */}
        {votingStep === 'konfirmasi' && selectedKetua && selectedWakil && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">KONFIRMASI PILIHAN Anda</h2>
              <p className="text-sm text-slate-500 mt-1">Periksa kembali pasangan kandidat pilihan Anda sebelum dikirim.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm mb-6 space-y-6">
              {/* Voter Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center text-sm">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold block">Pemilih</span>
                  <span className="font-bold text-slate-800">{currentVoter.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase font-bold block">Kelas</span>
                  <span className="font-bold text-slate-800">{currentVoter.class}</span>
                </div>
              </div>

              {/* Chosen Ketua */}
              <div>
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block mb-2">Pilihan Ketua OSIS</span>
                <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <img src={selectedKetua.photo_url} alt={selectedKetua.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded">0{selectedKetua.number}</span>
                    <h4 className="font-extrabold text-lg text-slate-800">{selectedKetua.name}</h4>
                    <span className="text-xs text-slate-500 font-medium">{selectedKetua.class}</span>
                  </div>
                </div>
              </div>

              {/* Chosen Wakil */}
              <div>
                <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider block mb-2">Pilihan Wakil Ketua OSIS</span>
                <div className="flex items-center gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                  <img src={selectedWakil.photo_url} alt={selectedWakil.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">0{selectedWakil.number}</span>
                    <h4 className="font-extrabold text-lg text-slate-800">{selectedWakil.name}</h4>
                    <span className="text-xs text-slate-500 font-medium">{selectedWakil.class}</span>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs leading-relaxed">
                <strong className="block mb-1">⚠️ Perhatian:</strong>
                Pastikan pilihan Anda sudah benar. Setelah tombol diklik, suara akan direkam ke database dan hak pilih Anda akan ditandai telah digunakan.
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button 
                onClick={() => setVotingStep('wakil')}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-6 py-3.5 rounded-xl transition"
              >
                &larr; Ubah Pilihan
              </button>

              <button 
                onClick={onSubmitVote}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-8 py-4 rounded-xl shadow-lg transition transform hover:scale-105 flex items-center gap-2"
              >
                <IconCheck className="w-5 h-5" />
                <span>KONFIRMASI & KIRIM SUARA</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUKSES */}
        {votingStep === 'sukses' && (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <IconCheck className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-black text-slate-800 mb-2">SUARA BERHASIL DIREKAM!</h2>
            <p className="text-slate-500 text-sm mb-6">
              Terima kasih, <strong className="text-slate-800">{currentVoter.name}</strong>. Hak suara Anda telah berhasil disimpan secara rahasia.
            </p>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 mb-8">
              Waktu Pencatatan: <br />
              <strong className="text-slate-700">{voteTimestamp}</strong>
            </div>

            <button 
              onClick={onFinish}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition"
            >
              SELESAI / KELUAR
            </button>
          </div>
        )}
      </main>

      {/* Modal Detail Visi & Misi */}
      {detailCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setDetailCandidate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold text-xl"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-6">
              <img src={detailCandidate.photo_url} alt={detailCandidate.name} className="w-20 h-20 rounded-2xl object-cover" />
              <div>
                <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">0{detailCandidate.number}</span>
                <h3 className="font-extrabold text-xl text-slate-800">{detailCandidate.name}</h3>
                <p className="text-xs text-blue-600 font-semibold">{detailCandidate.class} ({detailCandidate.type.toUpperCase()})</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-bold text-slate-800 mb-1 text-xs uppercase tracking-wider">Visi</h4>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 italic">"{detailCandidate.vision}"</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1 text-xs uppercase tracking-wider">Misi</h4>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-line leading-relaxed">{detailCandidate.mission}</p>
              </div>
            </div>

            <button 
              onClick={() => setDetailCandidate(null)}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl mt-6"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. ADMIN LOGIN PAGE COMPONENT
// ==========================================
function AdminLoginPage({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      onSuccess();
    } else {
      setError('Username atau Password Administrator salah.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-3xl border border-slate-800 p-8 text-white shadow-2xl">
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-white mb-6 block">&larr; Kembali</button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-3 font-extrabold text-xl">
            <IconLock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black">Login Administrator</h2>
          <p className="text-xs text-slate-400 mt-1">Sistem Kontrol & Monitoring E-Voting</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-800 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-400 text-sm"
              placeholder="Username admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-slate-800 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-400 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-3.5 rounded-xl transition shadow-lg mt-4"
          >
            MASUK ADMIN PANEL
          </button>
        </form>

        {ADMIN_PASS === 'admin123' && (
          <div className="mt-6 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-center text-xs text-amber-400/80">
            🔑 Demo Credentials: <strong>admin</strong> / <strong>admin123</strong><br />
            Demo credentials only. Ganti password sebelum dipakai (lihat catatan di README).
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 9. ADMIN DASHBOARD COMPONENT (Sidebar & Tabs)
// ==========================================
function AdminDashboardPage({
  settings,
  setSettings,
  candidates,
  setCandidates,
  votersDB,
  setVotersDB,
  votes,
  auditLogs,
  addLog,
  onLogout
}: {
  settings: SchoolSettings;
  setSettings: React.Dispatch<React.SetStateAction<SchoolSettings>>;
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  votersDB: Voter[];
  setVotersDB: React.Dispatch<React.SetStateAction<Voter[]>>;
  votes: Vote[];
  auditLogs: AuditLog[];
  addLog: (action: string, details: string) => void;
  onLogout: () => void;
}) {
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'voters' | 'candidates_ketua' | 'candidates_wakil' | 'results' | 'monitoring' | 'sheets' | 'logs' | 'settings' | 'reports'>('dashboard');

  // Computed statistics
  const totalVoters = votersDB.length;
  const votedCount = votersDB.filter(v => v.has_voted).length;
  const unvotedCount = totalVoters - votedCount;
  const progressPercent = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;

  const maleVoted = votersDB.filter(v => v.gender === 'L' && v.has_voted).length;
  const femaleVoted = votersDB.filter(v => v.gender === 'P' && v.has_voted).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row print:block print:bg-white">
      {/* Sidebar */}
      <aside className="print:hidden w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 p-3 mb-6 bg-slate-900 rounded-2xl border border-slate-800">
            <SchoolLogo className="w-10 h-10" />
            <div className="overflow-hidden">
              <h2 className="font-bold text-xs truncate text-white">{settings.name}</h2>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                ● ONLINE
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveAdminTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeAdminTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <IconChart className="w-4 h-4" /> Dashboard
            </button>

            <button 
              onClick={() => setActiveAdminTab('voters')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeAdminTab === 'voters' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <IconUsers className="w-4 h-4" /> Data Pemilih ({totalVoters})
            </button>

            <button 
              onClick={() => setActiveAdminTab('candidates_ketua')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeAdminTab === 'candidates_ketua' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <IconUser className="w-4 h-4" /> Calon Ketua OSIS
            </button>

            <button 
              onClick={() => setActiveAdminTab('candidates_wakil')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeAdminTab === 'candidates_wakil' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <IconUser className="w-4 h-4" /> Calon Wakil OSIS
            </button>

            <button 
              onClick={() => setActiveAdminTab('results')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeAdminTab === 'results' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <IconTrophy className="w-4 h-4" /> Hasil Pemilihan
            </button>

            <button 
              onClick={() => setActiveAdminTab('monitoring')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeAdminTab === 'monitoring' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <IconServer className="w-4 h-4" /> Monitoring
            </button>

            <button 
              onClick={() => setActiveAdminTab('sheets')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeAdminTab === 'sheets' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <IconSpreadsheet className="w-4 h-4" /> Google Sheets
            </button>

            <button 
              onClick={() => setActiveAdminTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeAdminTab === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <IconPrinter className="w-4 h-4" /> Cetak Laporan
            </button>

            <button 
              onClick={() => setActiveAdminTab('logs')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeAdminTab === 'logs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <IconLock className="w-4 h-4" /> Audit Log
            </button>

            <button 
              onClick={() => setActiveAdminTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${activeAdminTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'}`}
            >
              <IconSettings className="w-4 h-4" /> Pengaturan
            </button>
          </nav>
        </div>

        <button 
          onClick={onLogout}
          className="mt-6 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition w-full"
        >
          <IconLogOut className="w-4 h-4" /> Keluar Administrator
        </button>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {activeAdminTab === 'dashboard' && (
          <AdminDashboardStats 
            settings={settings}
            totalVoters={totalVoters}
            votedCount={votedCount}
            unvotedCount={unvotedCount}
            progressPercent={progressPercent}
            maleVoted={maleVoted}
            femaleVoted={femaleVoted}
          />
        )}

        {activeAdminTab === 'voters' && (
          <AdminVotersManager 
            votersDB={votersDB} 
            setVotersDB={setVotersDB}
            addLog={addLog}
          />
        )}

        {activeAdminTab === 'candidates_ketua' && (
          <AdminCandidatesManager 
            type="ketua"
            candidates={candidates}
            setCandidates={setCandidates}
            addLog={addLog}
          />
        )}

        {activeAdminTab === 'candidates_wakil' && (
          <AdminCandidatesManager 
            type="wakil"
            candidates={candidates}
            setCandidates={setCandidates}
            addLog={addLog}
          />
        )}

        {activeAdminTab === 'results' && (
          <AdminResultsView 
            settings={settings}
            candidates={candidates}
            votes={votes}
            votedCount={votedCount}
          />
        )}

        {activeAdminTab === 'monitoring' && (
          <AdminMonitoringView 
            votersDB={votersDB}
            votes={votes}
          />
        )}

        {activeAdminTab === 'sheets' && (
          <AdminGoogleSheetsSync 
            votersDB={votersDB}
            votes={votes}
            candidates={candidates}
            addLog={addLog}
          />
        )}

        {activeAdminTab === 'reports' && (
          <AdminReportsView 
            settings={settings}
            votersDB={votersDB}
            candidates={candidates}
            votes={votes}
          />
        )}

        {activeAdminTab === 'logs' && (
          <AdminAuditLogsView auditLogs={auditLogs} />
        )}

        {activeAdminTab === 'settings' && (
          <AdminSettingsView 
            settings={settings}
            setSettings={setSettings}
            addLog={addLog}
          />
        )}
      </main>
    </div>
  );
}

// Sub-component: Dashboard Stats
function AdminDashboardStats({ 
  settings, totalVoters, votedCount, unvotedCount, progressPercent, maleVoted, femaleVoted 
}: any) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white">Dashboard Monitoring Real-Time</h2>
        <p className="text-xs text-slate-400">Status Pemilihan: <span className="uppercase font-bold text-amber-400">{settings.status}</span></p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Pemilih</span>
          <span className="text-4xl font-black text-white">{totalVoters}</span>
          <span className="text-xs text-slate-400 block mt-2">Siswa Terdaftar</span>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">Sudah Memilih</span>
          <span className="text-4xl font-black text-emerald-400">{votedCount}</span>
          <span className="text-xs text-slate-400 block mt-2">Hak Suara Terpakai</span>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block mb-1">Belum Memilih</span>
          <span className="text-4xl font-black text-amber-400">{unvotedCount}</span>
          <span className="text-xs text-slate-400 block mt-2">Menunggu Pemilihan</span>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block mb-1">Partisipasi Suara</span>
          <span className="text-4xl font-black text-blue-400">{progressPercent}%</span>
          <span className="text-xs text-slate-400 block mt-2">Tingkat Kehadiran</span>
        </div>
      </div>

      {/* Progress Gauge */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h3 className="font-bold text-sm text-white mb-4">Progres Partisipasi Pemilih</h3>
        <div className="w-full bg-slate-700 h-6 rounded-full overflow-hidden p-1">
          <div 
            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 text-[10px] font-bold text-slate-950"
            style={{ width: `${Math.max(progressPercent, 5)}%` }}
          >
            {progressPercent}%
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3 text-right">
          {votedCount} dari {totalVoters} siswa telah menggunakan hak suara.
        </p>
      </div>

      {/* Gender Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h3 className="font-bold text-sm text-white mb-4">Pemilih Laki-Laki (Sudah Memilih)</h3>
          <span className="text-3xl font-black text-blue-400">{maleVoted} Siswa</span>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h3 className="font-bold text-sm text-white mb-4">Pemilih Perempuan (Sudah Memilih)</h3>
          <span className="text-3xl font-black text-pink-400">{femaleVoted} Siswi</span>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Voters Management (Nama & Kelas ONLY - No NISN)
function AdminVotersManager({ votersDB, setVotersDB, addLog }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Add Voter Form State
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');

  const filteredVoters = useMemo(() => {
    return votersDB.filter((v: Voter) => {
      const matchSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = filterClass ? v.class === filterClass : true;
      const matchStatus = filterStatus ? (filterStatus === 'voted' ? v.has_voted : !v.has_voted) : true;
      return matchSearch && matchClass && matchStatus;
    });
  }, [votersDB, searchTerm, filterClass, filterStatus]);

  const classList = useMemo(() => Array.from(new Set<string>(votersDB.map((v: Voter) => v.class))), [votersDB]);

  const handleAddVoter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newClass.trim()) return;
    if (votersDB.some((v: Voter) => v.name.trim().toLowerCase() === newName.trim().toLowerCase() && v.class.trim().toLowerCase() === newClass.trim().toLowerCase())) {
      alert('Pemilih dengan nama dan kelas yang sama sudah terdaftar.');
      return;
    }

    const newVoter: Voter = {
      id: 'v-' + Date.now(),
      name: newName.trim(),
      class: newClass.trim(),
      gender: newGender,
      has_voted: false,
    };

    setVotersDB((prev: Voter[]) => [newVoter, ...prev]);
    addLog('Tambah Pemilih', `Menambahkan pemilih manual: ${newName} (${newClass})`);
    setNewName('');
    setNewClass('');
  };

  const handleDeleteVoter = (id: string, name: string) => {
    if (votersDB.find((v: Voter) => v.id === id)?.has_voted) {
      alert('Pemilih yang sudah memilih tidak dapat dihapus agar data partisipasi tetap utuh.');
      return;
    }
    if (confirm(`Hapus pemilih ${name}?`)) {
      setVotersDB((prev: Voter[]) => prev.filter((v: Voter) => v.id !== id));
      addLog('Hapus Pemilih', `Menghapus pemilih ID: ${id}`);
    }
  };

  // CSV Import Simulation
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = String(evt.target?.result ?? '').replace(/^\uFEFF/, '');
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
      const delim = (lines[0] || '').includes(';') ? ';' : ',';
      const keyOf = (n: string, c: string) => `${n.trim().toLowerCase()}|${c.trim().toLowerCase()}`;
      const existing = new Set<string>(votersDB.map((v: Voter) => keyOf(v.name, v.class)));
      const newVoters: Voter[] = [];
      let duplicates = 0;
      let invalid = 0;

      lines.slice(1).forEach((line, index) => {
        const [name, className, gender] = line.split(delim).map(t => t.trim().replace(/^"|"$/g, ''));
        if (!name || !className) { invalid++; return; }
        const key = keyOf(name, className);
        if (existing.has(key)) { duplicates++; return; }
        existing.add(key);
        newVoters.push({
          id: 'v-csv-' + Date.now() + '-' + index,
          name,
          class: className,
          gender: ['p', 'perempuan'].includes((gender || '').toLowerCase()) ? 'P' : 'L',
          has_voted: false,
        });
      });

      if (newVoters.length > 0) setVotersDB((prev: Voter[]) => [...newVoters, ...prev]);
      addLog('Import CSV', `${newVoters.length} berhasil, ${duplicates} duplikat, ${invalid} tidak valid.`);
      alert(`${newVoters.length} data berhasil diimpor.` + (duplicates ? ` Terdapat ${duplicates} data duplikat (dilewati).` : '') + (invalid ? ` ${invalid} baris tidak valid (dilewati).` : ''));
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Data Pemilih (Siswa)</h2>
          <p className="text-xs text-slate-400">Total {votersDB.length} siswa terdaftar di database.</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold px-4 py-2.5 rounded-xl border border-slate-700 cursor-pointer transition flex items-center gap-2">
            <IconSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
          </label>
        </div>
      </div>

      {/* Add Voter Form */}
      <form onSubmit={handleAddVoter} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input 
          type="text" 
          placeholder="Nama Lengkap Siswa"
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          required
        />
        <input 
          type="text" 
          placeholder="Kelas (contoh: X AKL 1)"
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          value={newClass}
          onChange={e => setNewClass(e.target.value)}
          required
        />
        <select 
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          value={newGender}
          onChange={e => setNewGender(e.target.value as 'L' | 'P')}
        >
          <option value="L">Laki-Laki (L)</option>
          <option value="P">Perempuan (P)</option>
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white rounded-xl py-2 flex items-center justify-center gap-1">
          <IconPlus className="w-4 h-4" /> Tambah Pemilih
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          placeholder="Cari nama pemilih..."
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white flex-1"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select 
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
        >
          <option value="">Semua Kelas</option>
          {classList.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="voted">Sudah Memilih</option>
          <option value="unvoted">Belum Memilih</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px]">
            <tr>
              <th className="p-3">Nama Lengkap</th>
              <th className="p-3">Kelas</th>
              <th className="p-3">L/P</th>
              <th className="p-3">Status Voting</th>
              <th className="p-3">Waktu Vote</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredVoters.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">Tidak ada data pemilih ditemukan.</td>
              </tr>
            ) : (
              filteredVoters.map((v: Voter) => (
                <tr key={v.id} className="hover:bg-slate-750">
                  <td className="p-3 font-bold text-white">{v.name}</td>
                  <td className="p-3">{v.class}</td>
                  <td className="p-3">{v.gender}</td>
                  <td className="p-3">
                    {v.has_voted ? (
                      <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        ✓ SUDAH
                      </span>
                    ) : (
                      <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        BELUM
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-[10px] text-slate-400">
                    {v.voted_at ? new Date(v.voted_at).toLocaleTimeString('id-ID') : '-'}
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => handleDeleteVoter(v.id, v.name)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Sub-component: Candidates Management
function AdminCandidatesManager({ type, candidates, setCandidates, addLog }: any) {
  const list: Candidate[] = useMemo(
    () => candidates.filter((c: Candidate) => c.type === type).sort((a: Candidate, b: Candidate) => a.number - b.number),
    [candidates, type]
  );
  const nextNumber = list.length ? Math.max(...list.map(c => c.number)) + 1 : 1;
  const blank = { number: nextNumber, name: '', class: '', vision: '', mission: '', photo_url: '' };
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const label = type === 'ketua' ? 'Ketua' : 'Wakil Ketua';
  const setField = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!editingId) setForm(f => ({ ...f, number: nextNumber }));
  }, [nextNumber, editingId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const name = form.name.trim();
    const cls = form.class.trim();
    if (!name || !cls) return setError('Nama dan kelas calon wajib diisi.');
    if (candidates.some((c: Candidate) => c.type === type && c.number === Number(form.number) && c.id !== editingId)) {
      return setError('Nomor urut sudah dipakai calon lain.');
    }
    const photo = form.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=200`;
    if (editingId) {
      setCandidates((prev: Candidate[]) => prev.map(c => c.id === editingId
        ? { ...c, number: Number(form.number), name, class: cls, vision: form.vision, mission: form.mission, photo_url: photo }
        : c));
      addLog('Edit Calon', `Mengubah calon ${label}: ${name}`);
    } else {
      setCandidates((prev: Candidate[]) => [...prev, {
        id: type[0] + Date.now(), type, number: Number(form.number), name, class: cls,
        vision: form.vision, mission: form.mission, photo_url: photo, is_active: true,
      }]);
      addLog('Tambah Calon', `Menambahkan calon ${label}: ${name}`);
    }
    setEditingId(null);
    setForm({ ...blank, number: nextNumber + (editingId ? 0 : 1) });
  };

  const startEdit = (c: Candidate) => {
    setEditingId(c.id);
    setError('');
    setForm({ number: c.number, name: c.name, class: c.class, vision: c.vision, mission: c.mission, photo_url: c.photo_url });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleActive = (c: Candidate) => {
    setCandidates((prev: Candidate[]) => prev.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x));
    addLog('Ubah Status Calon', `${c.name} ${c.is_active ? 'dinonaktifkan' : 'diaktifkan'}.`);
  };

  const handleDelete = (c: Candidate) => {
    let stored: Vote[] = [];
    try { stored = JSON.parse(localStorage.getItem('evoting_votes') || '[]'); } catch { /* abaikan */ }
    if (stored.some(v => v.candidate_id === c.id)) {
      alert('Calon ini sudah menerima suara dan tidak dapat dihapus. Nonaktifkan saja.');
      return;
    }
    if (confirm(`Hapus calon ${c.name}?`)) {
      setCandidates((prev: Candidate[]) => prev.filter(x => x.id !== c.id));
      addLog('Hapus Calon', `Menghapus calon ${label}: ${c.name}`);
    }
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { setField('photo_url', await resizeImage(f, 400)); setError(''); }
    catch (err) { setError((err as Error).message); }
    e.target.value = '';
  };

  const input = "bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white";
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">Data Calon {label} OSIS</h2>
        <p className="text-xs text-slate-400">Hanya calon berstatus aktif yang tampil di bilik suara. Jumlah calon tidak dibatasi.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
        <h3 className="font-bold text-sm text-white">{editingId ? 'Edit Calon' : 'Tambah Calon Baru'}</h3>
        {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="number" min={1} placeholder="Nomor Urut" className={input} value={form.number} onChange={e => setField('number', Number(e.target.value))} required />
          <input type="text" placeholder="Nama Lengkap Calon" className={input} value={form.name} onChange={e => setField('name', e.target.value)} required />
          <input type="text" placeholder="Kelas Calon" className={input} value={form.class} onChange={e => setField('class', e.target.value)} required />
        </div>
        <div className="flex items-center gap-4">
          <img src={form.photo_url || 'https://ui-avatars.com/api/?name=?&background=334155&color=fff&size=100'} alt="Pratinjau foto" className="w-16 h-16 rounded-xl object-cover bg-slate-900" />
          <label className="bg-slate-900 hover:bg-slate-700 border border-slate-700 text-xs text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer transition">
            Upload / Ganti Foto
            <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </label>
          <span className="text-[10px] text-slate-500">Foto dikecilkan otomatis.</span>
        </div>
        <textarea placeholder="Visi Calon" className={`${input} w-full h-16`} value={form.vision} onChange={e => setField('vision', e.target.value)}></textarea>
        <textarea placeholder="Misi Calon (satu misi per baris)" className={`${input} w-full h-20`} value={form.mission} onChange={e => setField('mission', e.target.value)}></textarea>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white rounded-xl py-3 px-6">{editingId ? 'Simpan Perubahan' : 'Simpan Calon'}</button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ ...blank, number: nextNumber }); setError(''); }} className="bg-slate-700 hover:bg-slate-600 font-bold text-xs text-white rounded-xl py-3 px-6">Batal</button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.length === 0 && <p className="text-xs text-slate-500">Belum ada calon {label}.</p>}
        {list.map((c) => (
          <div key={c.id} className={`bg-slate-800 rounded-2xl border border-slate-700 p-5 flex flex-col justify-between ${c.is_active ? '' : 'opacity-60'}`}>
            <div>
              <div className="flex items-center gap-4 mb-4">
                <img src={c.photo_url} alt={c.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="min-w-0">
                  <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded">0{c.number}</span>
                  <h4 className="font-bold text-white text-base truncate">{c.name}</h4>
                  <span className="text-xs text-slate-400">{c.class}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mb-4 line-clamp-3"><strong>Visi:</strong> "{c.vision}"</p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-700">
              <button onClick={() => toggleActive(c)} className={`text-[10px] font-bold px-3 py-1 rounded-full ${c.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                {c.is_active ? 'AKTIF' : 'NONAKTIF'}
              </button>
              <div className="flex gap-3 text-xs font-bold">
                <button onClick={() => startEdit(c)} className="text-blue-400 hover:text-blue-300">Edit</button>
                <button onClick={() => handleDelete(c)} className="text-red-400 hover:text-red-300 flex items-center gap-1"><IconTrash className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hitung perolehan suara per jenis calon (peringkat + persentase dari total suara jenis tsb)
function computeResults(candidates: Candidate[], votes: Vote[], type: CandidateType) {
  const list = candidates.filter(c => c.type === type).map(c => ({ c, count: votes.filter(v => v.candidate_id === c.id).length }));
  const total = list.reduce((sum, x) => sum + x.count, 0);
  const sorted = [...list].sort((a, b) => b.count - a.count || a.c.number - b.c.number);
  return {
    total,
    rows: sorted.map(x => ({
      ...x,
      percent: total ? Math.round((x.count / total) * 1000) / 10 : 0,
      rank: 1 + sorted.filter(o => o.count > x.count).length,
    })),
  };
}

function ResultsPanel({ candidates, votes, showWinners }: { candidates: Candidate[]; votes: Vote[]; showWinners: boolean }) {
  return (
    <div className="space-y-8">
      {(['ketua', 'wakil'] as CandidateType[]).map(type => {
        const { total, rows } = computeResults(candidates, votes, type);
        const winners = rows.filter(r => r.rank === 1 && r.count > 0);
        const bar = type === 'ketua' ? 'bg-blue-500' : 'bg-emerald-500';
        return (
          <div key={type} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-5">
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-3">
              HASIL PEROLEHAN SUARA {type === 'ketua' ? 'KETUA' : 'WAKIL KETUA'} OSIS <span className="text-xs font-normal text-slate-400">({total} suara)</span>
            </h3>
            {showWinners && winners.length > 0 && (
              <div className="bg-amber-400/10 border border-amber-400/40 rounded-2xl p-4 flex items-center gap-4">
                <IconTrophy className="w-8 h-8 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-400 uppercase">{winners.length > 1 ? 'Suara seri' : 'Pemenang'}</p>
                  <p className="font-extrabold text-white">{winners.map(w => `0${w.c.number} ${w.c.name}`).join(' & ')}</p>
                  <p className="text-xs text-slate-300">Memperoleh {winners[0].count} suara ({winners[0].percent}%)</p>
                </div>
              </div>
            )}
            {rows.length === 0 && <p className="text-xs text-slate-500">Belum ada calon.</p>}
            {rows.map(({ c, count, percent, rank }) => (
              <div key={c.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-2 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 shrink-0 text-xs font-bold rounded-full flex items-center justify-center ${rank === 1 && count > 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-white'}`}>{rank}</span>
                    <span className="font-bold text-white text-sm truncate">0{c.number} {c.name} <span className="text-slate-400 font-normal">({c.class})</span></span>
                  </div>
                  <span className="text-sm font-black text-white whitespace-nowrap">{count} suara <span className="text-slate-400 font-normal">({percent}%)</span></span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className={`${bar} h-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// Sub-component: Election Results View (admin selalu melihat hasil lengkap)
function AdminResultsView({ settings, candidates, votes }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">Perhitungan Suara (Hasil Pemilihan)</h2>
        <p className="text-xs text-slate-400">
          Status: <span className="font-bold text-amber-400 uppercase">{settings.status}</span>. Suara tersimpan terpisah dari identitas siswa.
        </p>
      </div>
      <ResultsPanel candidates={candidates} votes={votes} showWinners={true} />
    </div>
  );
}

// Halaman hasil untuk publik (dikontrol lewat Pengaturan)
function PublicResultsPage({ settings, candidates, votes, onBack }: { settings: SchoolSettings; candidates: Candidate[]; votes: Vote[]; onBack: () => void }) {
  const finished = settings.status === 'selesai';
  const visible = settings.showResults && settings.status !== 'belum_mulai';
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-white">&larr; Kembali ke Beranda</button>
        <div className="flex items-center gap-3">
          <SchoolLogo className="w-12 h-12" />
          <div>
            <h1 className="font-extrabold text-xl text-white">Hasil Pemilihan OSIS</h1>
            <p className="text-xs text-slate-400">{settings.name} - {settings.year}</p>
          </div>
        </div>
        {!visible ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center text-sm text-slate-300">Hasil belum dapat ditampilkan.</div>
        ) : (
          <>
            {!finished && <p className="text-xs text-amber-300 bg-amber-400/10 border border-amber-400/30 rounded-xl p-3">Hasil sementara. Pemilihan belum selesai.</p>}
            <ResultsPanel candidates={candidates} votes={votes} showWinners={settings.showWinners && finished} />
          </>
        )}
      </div>
    </div>
  );
}

// Sub-component: Class Monitoring View
function AdminMonitoringView({ votersDB }: any) {
  const classStats = useMemo(() => {
    const stats: Record<string, { total: number; voted: number }> = {};
    votersDB.forEach((v: Voter) => {
      if (!stats[v.class]) {
        stats[v.class] = { total: 0, voted: 0 };
      }
      stats[v.class].total += 1;
      if (v.has_voted) stats[v.class].voted += 1;
    });
    return stats;
  }, [votersDB]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">Monitoring Partisipasi Per Kelas</h2>
        <p className="text-xs text-slate-400">Pantau progres pemilih berdasarkan unit kelas siswa.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(classStats).map(([className, data]) => {
          const percent = data.total > 0 ? Math.round((data.voted / data.total) * 100) : 0;
          return (
            <div key={className} className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-white text-base mb-1">{className}</h3>
              <p className="text-xs text-slate-400 mb-4">{data.voted} dari {data.total} siswa sudah memilih</p>
              
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden mb-2">
                <div className="bg-amber-400 h-full" style={{ width: `${percent}%` }}></div>
              </div>
              <span className="text-xs font-bold text-amber-400 block text-right">{percent}% Completed</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Sub-component: Export untuk Google Sheets
// CATATAN: aplikasi ini berjalan sepenuhnya di browser (tanpa server), sehingga tidak bisa memanggil
// Google Sheets API dengan aman. Gunakan export CSV lalu impor ke Google Sheets (File > Import).
function AdminGoogleSheetsSync({ votersDB, votes, candidates, addLog }: any) {
  const stamp = new Date().toISOString().slice(0, 10);
  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString('id-ID') : '');
  const voted = votersDB.filter((v: Voter) => v.has_voted);

  const files: { label: string; sheet: string; build: () => (string | number)[][] }[] = [
    {
      label: 'Sheet 1: Data Pemilih', sheet: 'data-pemilih',
      build: () => [['ID', 'NAMA', 'KELAS', 'JENIS KELAMIN', 'STATUS', 'WAKTU MEMILIH'],
        ...votersDB.map((v: Voter) => [v.id, v.name, v.class, v.gender === 'L' ? 'Laki-laki' : 'Perempuan', v.has_voted ? 'SUDAH MEMILIH' : 'BELUM MEMILIH', fmt(v.voted_at)])],
    },
    {
      label: 'Sheet 2: Hasil Suara', sheet: 'hasil-suara',
      build: () => [['CALON', 'JENIS', 'JUMLAH SUARA', 'PERSENTASE'],
        ...(['ketua', 'wakil'] as CandidateType[]).flatMap(t =>
          computeResults(candidates, votes, t).rows.map(r => [`0${r.c.number} - ${r.c.name}`, t === 'ketua' ? 'KETUA OSIS' : 'WAKIL KETUA OSIS', r.count, `${r.percent}%`]))],
    },
    {
      label: 'Sheet 3: Rekap', sheet: 'rekap',
      build: () => [['KETERANGAN', 'JUMLAH'],
        ['TOTAL PEMILIH', votersDB.length], ['SUDAH MEMILIH', voted.length], ['BELUM MEMILIH', votersDB.length - voted.length],
        ['LAKI-LAKI', votersDB.filter((v: Voter) => v.gender === 'L').length], ['PEREMPUAN', votersDB.filter((v: Voter) => v.gender === 'P').length]],
    },
    {
      label: 'Sheet 4: Log Pemilihan', sheet: 'log-pemilihan',
      build: () => [['ID PEMILIH', 'KELAS', 'WAKTU MEMILIH'], ...voted.map((v: Voter) => [v.id, v.class, fmt(v.voted_at)])],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">Export untuk Google Sheets</h2>
        <p className="text-xs text-slate-400">Unduh 4 file CSV dengan struktur sheet standar, lalu impor ke Google Sheets.</p>
      </div>

      <div className="bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs rounded-2xl p-4 leading-relaxed">
        <strong>Mode prototipe:</strong> sinkronisasi otomatis ke Google Sheets belum aktif karena membutuhkan server untuk menyimpan kunci API dengan aman.
        Gunakan tombol di bawah, lalu di Google Sheets pilih <em>File &rarr; Import &rarr; Upload</em>.
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {files.map(f => (
          <button
            key={f.sheet}
            onClick={() => { downloadCSV(`${f.sheet}-${stamp}.csv`, f.build()); addLog('Export Data', `Mengunduh ${f.label}.`); }}
            className="bg-slate-900 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs px-4 py-3 rounded-xl transition flex items-center gap-2"
          >
            <IconSpreadsheet className="w-4 h-4 text-emerald-400" /> {f.label} (.csv)
          </button>
        ))}
      </div>
    </div>
  );
}

// Sub-component: Audit Logs View
function AdminAuditLogsView({ auditLogs }: { auditLogs: AuditLog[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">Audit Log Aktivitas Administrator</h2>
        <p className="text-xs text-slate-400">Catatan riwayat aktivitas penting dalam sistem untuk transparansi.</p>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px]">
            <tr>
              <th className="p-3">Waktu</th>
              <th className="p-3">Admin</th>
              <th className="p-3">Aktivitas</th>
              <th className="p-3">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {auditLogs.map(log => (
              <tr key={log.id}>
                <td className="p-3 text-slate-400 font-mono">{log.timestamp}</td>
                <td className="p-3 font-bold text-amber-400">{log.admin}</td>
                <td className="p-3 font-bold text-white">{log.action}</td>
                <td className="p-3 text-slate-300">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Sub-component: Print & Export Reports View
function AdminReportsView({ settings, votersDB, candidates, votes }: any) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-black text-white">Cetak Laporan Pemilihan Resmi</h2>
          <p className="text-xs text-slate-400">Cetak rekapitulasi resmi dengan Kop Sekolah.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition flex items-center gap-2"
        >
          <IconPrinter className="w-4 h-4" /> CETAK LAPORAN (PDF)
        </button>
      </div>

      {/* Printable Paper View */}
      <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-xl max-w-3xl mx-auto space-y-6 print:p-0 print:shadow-none">
        {/* School Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4">
          <SchoolLogo className="w-16 h-16 mx-auto mb-2" />
          <h1 className="font-extrabold text-xl uppercase tracking-wider">{settings.name}</h1>
          <p className="text-xs font-semibold">{settings.year}</p>
          <p className="text-[10px] text-slate-500">BERITA ACARA REKAPITULASI PEMILIHAN KETUA & WAKIL KETUA OSIS</p>
        </div>

        <div className="text-xs space-y-4">
          <div className="flex justify-between">
            <span>Total Pemilih Terdaftar: <strong>{votersDB.length} Siswa</strong></span>
            <span>Total Suara Masuk: <strong>{votersDB.filter((v: Voter) => v.has_voted).length} Suara</strong></span>
          </div>

          <h3 className="font-bold text-sm underline">1. REKAPITULASI SUARA KETUA OSIS</h3>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300">No</th>
                <th className="p-2 border-r border-slate-300">Nama Calon Ketua</th>
                <th className="p-2 border-r border-slate-300">Kelas</th>
                <th className="p-2">Jumlah Suara</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {candidates.filter((c: Candidate) => c.type === 'ketua').map((c: Candidate) => (
                <tr key={c.id}>
                  <td className="p-2 border-r border-slate-200">0{c.number}</td>
                  <td className="p-2 border-r border-slate-200 font-bold">{c.name}</td>
                  <td className="p-2 border-r border-slate-200">{c.class}</td>
                  <td className="p-2 font-bold">{votes.filter((v: Vote) => v.candidate_id === c.id).length} Suara</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-bold text-sm underline pt-2">2. REKAPITULASI SUARA WAKIL KETUA OSIS</h3>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300">No</th>
                <th className="p-2 border-r border-slate-300">Nama Calon Wakil</th>
                <th className="p-2 border-r border-slate-300">Kelas</th>
                <th className="p-2">Jumlah Suara</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {candidates.filter((c: Candidate) => c.type === 'wakil').map((c: Candidate) => (
                <tr key={c.id}>
                  <td className="p-2 border-r border-slate-200">0{c.number}</td>
                  <td className="p-2 border-r border-slate-200 font-bold">{c.name}</td>
                  <td className="p-2 border-r border-slate-200">{c.class}</td>
                  <td className="p-2 font-bold">{votes.filter((v: Vote) => v.candidate_id === c.id).length} Suara</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-8 flex justify-between text-center text-xs">
            <div>
              <p>Ketua Panitia Pemilihan</p>
              <div className="h-16"></div>
              <p className="font-bold underline">(...................................)</p>
            </div>
            <div>
              <p>Pembina OSIS</p>
              <div className="h-16"></div>
              <p className="font-bold underline">(...................................)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component: School Settings
function AdminSettingsView({ settings, setSettings, addLog }: any) {
  const [name, setName] = useState(settings.name);
  const [year, setYear] = useState(settings.year);
  const [status, setStatus] = useState<ElectionStatus>(settings.status);
  const [showResults, setShowResults] = useState<boolean>(settings.showResults);
  const [showWinners, setShowWinners] = useState<boolean>(settings.showWinners);
  const [logo, setLogo] = useState<string>(settings.logo || '');
  const [error, setError] = useState('');

  const onLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { setLogo(await resizeImage(f, 256)); setError(''); }
    catch (err) { setError((err as Error).message); }
    e.target.value = '';
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (status === 'berlangsung') {
      let cands: Candidate[] = [];
      try { cands = JSON.parse(localStorage.getItem('evoting_candidates') || '[]'); } catch { /* abaikan */ }
      const active = (t: CandidateType) => cands.filter(c => c.type === t && c.is_active).length;
      if (active('ketua') < 1 || active('wakil') < 1) {
        setError('Pemilihan tidak bisa dimulai: minimal harus ada 1 calon Ketua dan 1 calon Wakil yang aktif.');
        return;
      }
    }
    setSettings((prev: SchoolSettings) => ({ ...prev, name, year, status, showResults, showWinners, logo: logo || undefined }));
    if (status !== settings.status) addLog('Status Pemilihan', `Status diubah ke: ${status}`);
    else addLog('Pengaturan Sekolah', 'Pengaturan diperbarui.');
    alert('Pengaturan berhasil disimpan!');
  };

  const resetData = (mode: 'kosong' | 'contoh') => {
    const msg = mode === 'kosong'
      ? 'Ini akan MENGHAPUS SEMUA pemilih, calon, suara, dan log, sehingga siap diisi data asli. Lanjutkan?'
      : 'Ini akan mengembalikan SEMUA data ke data contoh (demo). Lanjutkan?';
    if (!confirm(msg)) return;
    if (prompt('Ketik HAPUS untuk konfirmasi') !== 'HAPUS') return;
    if (mode === 'kosong') {
      ['evoting_candidates', 'evoting_voters', 'evoting_votes'].forEach(k => localStorage.setItem(k, '[]'));
      localStorage.setItem('evoting_logs', '[]');
      localStorage.setItem('evoting_settings', JSON.stringify({ ...settings, status: 'belum_mulai' }));
    } else {
      ['evoting_settings', 'evoting_candidates', 'evoting_voters', 'evoting_votes', 'evoting_logs'].forEach(k => localStorage.removeItem(k));
    }
    window.location.reload();
  };

  const field = "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white";
  const check = "w-4 h-4 accent-blue-600";
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-2xl font-black text-white">Pengaturan Sekolah & Mode Pemilihan</h2>
        <p className="text-xs text-slate-400">Atur identitas, logo, status pemilihan, dan tampilan hasil.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
        {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">{error}</p>}

        <div className="flex items-center gap-4">
          <LogoCtx.Provider value={logo || '/logo.png'}><SchoolLogo className="w-16 h-16" /></LogoCtx.Provider>
          <div className="flex flex-col gap-2">
            <label className="bg-slate-900 hover:bg-slate-700 border border-slate-700 text-xs text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer transition text-center">
              Upload Logo Lembaga
              <input type="file" accept="image/*" className="hidden" onChange={onLogo} />
            </label>
            {logo && <button type="button" onClick={() => setLogo('')} className="text-[10px] text-slate-400 hover:text-white">Pakai logo bawaan (/logo.png)</button>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Nama Sekolah</label>
          <input type="text" className={field} value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Tahun Pelajaran</label>
          <input type="text" className={field} value={year} onChange={e => setYear(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Status Pemilihan</label>
          <select className={`${field} font-bold`} value={status} onChange={e => setStatus(e.target.value as ElectionStatus)}>
            <option value="belum_mulai">Belum Dimulai (Persiapan)</option>
            <option value="berlangsung">Sedang Berlangsung (Bilik Suara Buka)</option>
            <option value="selesai">Selesai (Pemilihan Ditutup)</option>
          </select>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 space-y-3 border border-slate-700">
          <p className="text-xs font-bold text-slate-300 uppercase">Tampilan hasil untuk publik</p>
          <label className="flex items-center gap-3 text-xs text-slate-200"><input type="checkbox" className={check} checked={showResults} onChange={e => setShowResults(e.target.checked)} /> Tampilkan hasil (sementara & akhir) di halaman depan</label>
          <label className="flex items-center gap-3 text-xs text-slate-200"><input type="checkbox" className={check} checked={showWinners} onChange={e => setShowWinners(e.target.checked)} /> Tampilkan pemenang (setelah status Selesai)</label>
          <p className="text-[10px] text-slate-500">Admin selalu dapat melihat hasil lengkap di menu Hasil Pemilihan.</p>
        </div>

        <button type="submit" className="bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white rounded-xl py-3 px-6 w-full">Simpan Perubahan</button>
      </form>

      <div className="bg-slate-800 p-6 rounded-2xl border border-red-500/30 space-y-3">
        <h3 className="font-bold text-sm text-red-400">Zona Data</h3>
        <p className="text-xs text-slate-400">Sebelum pemilihan sungguhan, kosongkan data contoh lalu isi pemilih & calon yang asli.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => resetData('kosong')} className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl">Kosongkan Semua Data</button>
          <button onClick={() => resetData('contoh')} className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl">Kembalikan Data Contoh</button>
        </div>
      </div>
    </div>
  );
}
