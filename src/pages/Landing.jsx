import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import patch1 from '../assets/patch1.png';
import patch2 from '../assets/patch4.png';
import patch3 from '../assets/patch5.png';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();
    const [showJoin, setShowJoin] = useState(false);
    const [roomCode, setRoomCode] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [joinNickname, setJoinNickname] = useState('');
    const [joinError, setJoinError] = useState('');

    const [showCreate, setShowCreate] = useState(false);
    const [sessionName, setSessionName] = useState('');
    const [createNickname, setCreateNickname] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [createdSession, setCreatedSession] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const generatePin = () => {
        return Math.floor(1000 + Math.random() * 9000).toString();
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleStartSession = () => {
        setShowCreate(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!sessionName.trim() || !createNickname.trim()) return;

        const code = generateCode();
        const pin = generatePin();
        const saved = JSON.parse(localStorage.getItem('apw_rooms') || '{}');
        if (!saved[code]) {
            saved[code] = {
                createdAt: Date.now(),
                flowers: [],
                pin: pin,
                name: sessionName.trim()
            };
            localStorage.setItem('apw_rooms', JSON.stringify(saved));
            sessionStorage.setItem(`apw_auth_${code}`, 'true');
            sessionStorage.setItem(`apw_name_${code}`, createNickname.trim());
        }
        setCreatedSession({ code, pin });
        setShowCreate(false);
        setShowPreview(true);
    };

    const handleEnterGarden = () => {
        setShowPreview(false);
        setIsLoading(true);
        setTimeout(() => {
            navigate(`/session/${createdSession.code}`);
        }, 2000);
    };

    const handleJoinSession = (e) => {
        e.preventDefault();
        setJoinError('');
        if (!joinNickname.trim()) {
            setJoinError('Please enter a nickname.');
            return;
        }
        if (roomCode.length === 5 && pinCode.length >= 4) {
            const codeUpper = roomCode.toUpperCase();
            const saved = JSON.parse(localStorage.getItem('apw_rooms') || '{}');
            if (saved[codeUpper]) {
                if (saved[codeUpper].pin === pinCode) {
                    sessionStorage.setItem(`apw_auth_${codeUpper}`, 'true');
                    sessionStorage.setItem(`apw_name_${codeUpper}`, joinNickname.trim());
                    navigate(`/session/${codeUpper}`);
                } else {
                    setJoinError('Incorrect PIN.');
                }
            } else {
                setJoinError('Room not found.');
            }
        } else {
            setJoinError('Invalid Code or PIN length.');
        }
    };

    return (
        <div className="landing-container">
            {!isLoading && <div className="title-section">
                <h1>A Petal's Worth</h1>
                <p>Add a presence that speaks for you</p>
            </div>}

            <div className="islands-container">
                <img src={patch3} alt="Patch 3" className="island-img patch-top-left" />
                <img src={patch2} alt="Patch 2" className="island-img patch-right" />
                <img src={patch1} alt="Patch 1" className="island-img patch-bottom-left" />

                {showJoin && (
                    <div className="modal-overlay" onClick={() => setShowJoin(false)}>
                        <div className="join-modal" onClick={e => e.stopPropagation()}>
                            <h2>Enter in group code</h2>
                            <form onSubmit={handleJoinSession}>
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
                                    className="code-input"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value)}
                                    maxLength={5}
                                    placeholder="CODE"
                                />
                                <input
                                    type="text"
                                    className="code-input pin-input"
                                    value={pinCode}
                                    onChange={(e) => setPinCode(e.target.value)}
                                    maxLength={4}
                                    placeholder="PIN"
                                    style={{ marginTop: '1rem', letterSpacing: '0.5rem' }}
                                />
                                {joinError && <p style={{ color: 'var(--color-primary)', marginTop: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>{joinError}</p>}
                                <button type="submit" className="btn-secondary" style={{ marginTop: '2rem' }}>
                                    Join Session
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {showCreate && (
                    <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                        <div className="join-modal" onClick={e => e.stopPropagation()}>
                            <h2>Name your session</h2>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Give your garden a special name.</p>
                            <form onSubmit={handleCreateSubmit}>
                                <input
                                    type="text"
                                    className="code-input"
                                    value={createNickname}
                                    onChange={(e) => setCreateNickname(e.target.value)}
                                    maxLength={20}
                                    placeholder="Your Nickname"
                                    style={{ letterSpacing: 'normal', fontSize: '1.2rem', marginBottom: '1rem' }}
                                    autoFocus
                                    required
                                />
                                <input
                                    type="text"
                                    className="code-input"
                                    value={sessionName}
                                    onChange={(e) => setSessionName(e.target.value)}
                                    maxLength={30}
                                    placeholder="Garden Name"
                                    style={{ letterSpacing: 'normal', fontSize: '1.5rem' }}
                                    required
                                />
                                <button type="submit" className="btn-secondary" style={{ marginTop: '2rem' }}>
                                    Create Garden
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {showPreview && createdSession && (
                    <div className="modal-overlay">
                        <div className="join-modal" style={{ animation: 'popIn 0.4s ease' }}>
                            <h2>Your Garden is Ready!</h2>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                Share these credentials so your friends can join.<br />You can also copy them later from inside the room.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', backgroundColor: '#f5f0e1', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                                <span>Room Code: <strong style={{ letterSpacing: '0.2rem', fontSize: '1.2rem' }}>{createdSession.code}</strong></span>
                                <span>Security PIN: <strong style={{ letterSpacing: '0.2rem', fontSize: '1.2rem' }}>{createdSession.pin}</strong></span>
                            </div>
                            <button className="btn-primary" onClick={handleEnterGarden}>
                                Enter Garden
                            </button>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="loading-screen">
                        <div className="loader-content">
                            <div className="flower-loader">🌸</div>
                            <h2>Transporting to your garden...</h2>
                        </div>
                    </div>
                )}
            </div>

            {!isLoading && <div className="button-group">
                <button className="btn-primary" onClick={handleStartSession}>
                    Start a session
                </button>
                <button className="btn-secondary" onClick={() => setShowJoin(true)}>
                    Join a session
                </button>
            </div>}
        </div>
    );
};

export default Landing;
