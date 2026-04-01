import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Copy } from 'lucide-react';
import FlowerModal from '../components/FlowerModal';
import PromptBanner from '../components/PromptBanner';
import WelcomeModal from '../components/WelcomeModal';
import patch1 from '../assets/patch1.png';
import patch2 from '../assets/patch4.png';
import patch3 from '../assets/patch5.png';
import { THEMES } from '../constants';
import './Session.css';

const Session = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [flowers, setFlowers] = useState([]);
    const [selectedFlower, setSelectedFlower] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [showWelcome, setShowWelcome] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [joinNickname, setJoinNickname] = useState('');
    const [pinError, setPinError] = useState('');
    const [sessionName, setSessionName] = useState("A Petal's Worth");
    const [dragState, setDragState] = useState(null);

    const handlePointerDown = (e, flower) => {
        if (e.button !== undefined && e.button !== 0) return;

        e.preventDefault();
        e.stopPropagation();

        const rect = e.currentTarget.parentElement.getBoundingClientRect();

        setDragState({
            id: flower.id,
            startX: e.clientX,
            startY: e.clientY,
            initialLeft: flower.position.x,
            initialTop: flower.position.y,
            patchWidth: rect.width,
            patchHeight: rect.height,
            hasMoved: false
        });
    };

    useEffect(() => {
        if (!dragState) return;

        const handlePointerMove = (e) => {
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;

            if (!dragState.hasMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
                setDragState(prev => prev ? { ...prev, hasMoved: true } : null);
            }

            const dxPct = (dx / dragState.patchWidth) * 100;
            const dyPct = (dy / dragState.patchHeight) * 100;

            let newX = dragState.initialLeft + dxPct;
            let newY = dragState.initialTop + dyPct;

            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            setFlowers(prevFlowers => prevFlowers.map(f =>
                f.id === dragState.id ? { ...f, position: { x: newX, y: newY } } : f
            ));
        };

        const handlePointerUp = (e) => {
            setFlowers(currentFlowers => {
                const targetFlower = currentFlowers.find(f => f.id === dragState.id);
                if (dragState.hasMoved) {
                    const saved = JSON.parse(localStorage.getItem('apw_rooms') || '{}');
                    if (saved[roomId] && targetFlower) {
                        saved[roomId].flowers = saved[roomId].flowers.map(f =>
                            f.id === dragState.id ? targetFlower : f
                        );
                        localStorage.setItem('apw_rooms', JSON.stringify(saved));
                    }
                } else {
                    if (targetFlower) setSelectedFlower(targetFlower);
                }
                return currentFlowers;
            });
            setDragState(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [dragState, roomId]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('apw_rooms') || '{}');
        if (saved[roomId]) {
            // Check auth
            if (sessionStorage.getItem(`apw_auth_${roomId}`) !== 'true') {
                setIsAuthenticated(false);
            } else {
                if (sessionStorage.getItem(`apw_welcome_${roomId}`) !== 'true') {
                    setShowWelcome(true);
                    sessionStorage.setItem(`apw_welcome_${roomId}`, 'true');
                }
            }
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFlowers(saved[roomId].flowers || []);
            if (saved[roomId].name) setSessionName(saved[roomId].name);
        } else {
            // Room does not exist. Redirect to home.
            navigate('/');
        }
    }, [roomId, navigate]);

    const handlePinSubmit = (e) => {
        e.preventDefault();
        setPinError('');
        if (!joinNickname.trim()) {
            setPinError('Please enter a nickname.');
            return;
        }

        const saved = JSON.parse(localStorage.getItem('apw_rooms') || '{}');
        if (saved[roomId] && saved[roomId].pin === pinInput) {
            sessionStorage.setItem(`apw_auth_${roomId}`, 'true');
            sessionStorage.setItem(`apw_name_${roomId}`, joinNickname.trim());
            setIsAuthenticated(true);
            setPinError('');

            if (sessionStorage.getItem(`apw_welcome_${roomId}`) !== 'true') {
                setShowWelcome(true);
                sessionStorage.setItem(`apw_welcome_${roomId}`, 'true');
            }
        } else {
            setPinError('Incorrect PIN.');
        }
    };

    const handleUpdateFlower = (updatedFlower) => {
        const saved = JSON.parse(localStorage.getItem('apw_rooms') || '{}');
        if (saved[roomId]) {
            const newFlowers = saved[roomId].flowers.map(f => f.id === updatedFlower.id ? updatedFlower : f);
            saved[roomId].flowers = newFlowers;
            localStorage.setItem('apw_rooms', JSON.stringify(saved));
            setFlowers(newFlowers);
            setSelectedFlower(updatedFlower);
        }
    };

    const handleCopyLink = () => {
        const saved = JSON.parse(localStorage.getItem('apw_rooms') || '{}');
        const pin = saved[roomId]?.pin || '';
        const textToCopy = `Room code: ${roomId}\nPIN: ${pin}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleNextFlower = () => {
        if (!selectedFlower || flowers.length <= 1) return;
        const currentIndex = flowers.findIndex(f => f.id === selectedFlower.id);
        const nextIndex = (currentIndex + 1) % flowers.length;
        setSelectedFlower(flowers[nextIndex]);
    };

    const handlePrevFlower = () => {
        if (!selectedFlower || flowers.length <= 1) return;
        const currentIndex = flowers.findIndex(f => f.id === selectedFlower.id);
        const prevIndex = (currentIndex - 1 + flowers.length) % flowers.length;
        setSelectedFlower(flowers[prevIndex]);
    };

    const renderPatch = (patchIndex, patchName, patchClass, imgUrl) => {
        const patchFlowers = flowers.filter((f, idx) => (f.patchIndex !== undefined ? f.patchIndex : (idx % 3)) === patchIndex);
        return (
            <div className={`garden-patch ${patchClass}`}>
                <img src={imgUrl} alt={patchName} className="patch-bg-img" />
                {/*
                <div className="patch-theme-hover">
                    {themeNames.join(' & ')}
                </div>
                */}
                <div className="flowers-container">
                    {patchFlowers.map((flower) => (
                        <div
                            key={flower.id}
                            className={`planted-flower form-${flower.formType || 'flower'} ${location.state?.newlyPlantedId === flower.id ? 'animate-pop' : ''} ${dragState?.id === flower.id ? 'dragging' : ''}`}
                            style={{
                                left: `${flower.position.x}%`,
                                top: `${flower.position.y}%`
                            }}
                            onPointerDown={(e) => handlePointerDown(e, flower)}
                        >
                            <img src={flower.imageData} alt={flower.flowerName || flower.name} draggable="false" />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (!isAuthenticated) {
        return (
            <div className="landing-container">
                <div className="join-modal" style={{ animation: 'popIn 0.4s ease' }}>
                    <h2>Room Locked</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Enter the 4-digit PIN for room {roomId}</p>
                    <form onSubmit={handlePinSubmit}>
                        <input
                            type="text"
                            className="code-input"
                            value={joinNickname}
                            onChange={(e) => setJoinNickname(e.target.value)}
                            maxLength={20}
                            placeholder="Your Nickname"
                            style={{ letterSpacing: 'normal', fontSize: '1.2rem', marginBottom: '1rem' }}
                            autoFocus
                            required
                        />
                        <input
                            type="text"
                            className="code-input pin-input"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            maxLength={4}
                            placeholder="PIN"
                            style={{ letterSpacing: '0.5rem' }}
                        />
                        {pinError && <p style={{ color: 'var(--color-primary)', marginTop: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>{pinError}</p>}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button type="button" className="btn-control" onClick={() => navigate('/')}>
                                Go Back
                            </button>
                            <button type="submit" className="btn-secondary">
                                Unlock
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="session-container">
            <div className="top-controls">
                <div className="left-controls">
                    <button className="btn-control new-session-btn" onClick={() => navigate('/')}>
                        New session
                    </button>
                    <button className="btn-control invite-btn" onClick={() => setShowInviteModal(true)}>
                        Send Invite
                    </button>
                </div>

                <PromptBanner roomId={roomId} isHidden={!!selectedFlower} />
            </div>

            <header className="session-header">
                <h1>{sessionName}</h1>
                <p>Add a form to express your thoughts</p>
            </header>

            <div className={`garden-area ${selectedFlower ? 'shifted' : ''}`}>
                {renderPatch(0, 'Top Left Patch', 'patch-top-left', patch3)}
                {renderPatch(1, 'Right Patch', 'patch-right', patch2)}
                {renderPatch(2, 'Bottom Left Patch', 'patch-bottom-left', patch1)}
            </div>

            {!showWelcome && (
                <button className="fab" onClick={() => navigate(`/session/${roomId}/create`)}>
                    Add to garden
                </button>
            )}

            {selectedFlower && (
                <FlowerModal
                    flower={selectedFlower}
                    onClose={() => setSelectedFlower(null)}
                    onUpdate={handleUpdateFlower}
                    onNext={handleNextFlower}
                    onPrev={handlePrevFlower}
                    hasMultiple={flowers.length > 1}
                    currentUserName={sessionStorage.getItem(`apw_name_${roomId}`)}
                />
            )}

            {showInviteModal && (
                <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
                    <div className="invite-modal" onClick={e => e.stopPropagation()}>
                        <h2>Invite Friends</h2>
                        <p>Share this room code with others so they can join your garden.</p>

                        <div className="room-code-display" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span>Code: <strong>{roomId}</strong></span>
                            <span style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>
                                PIN: <strong>{JSON.parse(localStorage.getItem('apw_rooms') || '{}')[roomId]?.pin}</strong>
                            </span>
                        </div>

                        <button
                            className={`btn-primary copy-btn ${copySuccess ? 'success' : ''}`}
                            onClick={handleCopyLink}
                        >
                            {copySuccess ? <Check size={20} /> : <Copy size={20} />}
                            {copySuccess ? 'Copied!' : 'Copy Invite Info'}
                        </button>

                        <button className="close-text-btn" onClick={() => setShowInviteModal(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showWelcome && (
                <WelcomeModal
                    prompt={JSON.parse(localStorage.getItem('apw_rooms') || '{}')[roomId]?.prompt || 'How are you feeling today?'}
                    onClose={() => setShowWelcome(false)}
                    onPlant={() => {
                        setShowWelcome(false);
                        navigate(`/session/${roomId}/create`);
                    }}
                />
            )}
        </div>
    );
};

export default Session;
