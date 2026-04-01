import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Palette, Eraser, Undo, ChevronLeft, X, PenLine, Wand2, SprayCan, Minus } from 'lucide-react';
import { THEMES, FORMS } from '../constants';
import PromptBanner from '../components/PromptBanner';
import './CreateFlower.css';

const COLORS = ['#ff6b6b', '#fca311', '#ffcbf2', '#8fc74e', '#1a4314', '#ffffff', '#2b2d42'];

const TEMPLATES = Object.values(FORMS);

const CreateFlower = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('apw_rooms') || '{}');
        if (!saved[roomId] || sessionStorage.getItem(`apw_auth_${roomId}`) !== 'true') {
            navigate(`/session/${roomId}`);
        }
    }, [roomId, navigate]);

    const [step, setStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const canvasRef = useRef(null);
    const lastPos = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState(COLORS[0]);
    const [brushSize, setBrushSize] = useState(5);
    const [brushType, setBrushType] = useState('solid');
    const [previewUrl, setPreviewUrl] = useState(null);

    const [flowerName, setFlowerName] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (step === 2) {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = 500;
                canvas.height = 500;
                const ctx = canvas.getContext('2d');
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Set default background to transparent (white canvas area)
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [step, selectedTemplate]);

    const handleTemplateSelect = (template) => {
        if (template === 'custom') {
            setSelectedTemplate('custom');
            setFlowerName('My Custom Form');
        } else {
            setSelectedTemplate(template);
            setFlowerName(template.name);
        }
        setStep(2);
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        lastPos.current = { x, y };
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing || !lastPos.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = brushSize;

        ctx.shadowBlur = 0;
        ctx.setLineDash([]);
        ctx.globalAlpha = 1.0;

        if (brushType === 'solid') {
            ctx.beginPath();
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (brushType === 'glow') {
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (brushType === 'dotted') {
            ctx.setLineDash([1, brushSize * 2]);
            ctx.beginPath();
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (brushType === 'spray') {
            const density = brushSize * 2;
            for (let i = 0; i < density; i++) {
                const offsetX = (Math.random() * brushSize) - (brushSize / 2);
                const offsetY = (Math.random() * brushSize) - (brushSize / 2);
                ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
            }
        } else if (brushType === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
        }

        lastPos.current = { x, y };
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        lastPos.current = null;
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handlePlantFlower = (e) => {
        e.preventDefault();
        if (!message.trim() || !flowerName.trim()) {
            alert("Please provide the form name and a thought before adding to the garden.");
            return;
        }

        const imageData = previewUrl || (canvasRef.current ? canvasRef.current.toDataURL('image/png') : '');

        const saved = JSON.parse(localStorage.getItem('apw_rooms') || '{}');
        if (!saved[roomId]) {
            saved[roomId] = { createdAt: Date.now(), flowers: [] };
        }

        const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        
        const authorName = sessionStorage.getItem(`apw_name_${roomId}`) || 'Anonymous';

        const newFlower = {
            id: Math.random().toString(36).substr(2, 9),
            name: authorName,
            flowerName: flowerName,
            creatorName: authorName,
            message,
            patchIndex: Math.floor(Math.random() * 3),
            formType: selectedTemplate === 'custom' ? 'flower' : selectedTemplate.id,
            imageData,
            waterCount: 0,
            sunlightCount: 0,
            position: {
                x: randomRange(20, 80),
                y: randomRange(20, 80)
            }
        };

        saved[roomId].flowers.push(newFlower);
        localStorage.setItem('apw_rooms', JSON.stringify(saved));

        navigate(`/session/${roomId}`, { state: { newlyPlantedId: newFlower.id } });
    };

    return (
        <div className="create-container">
            {step !== 3 && <PromptBanner roomId={roomId} isCollapsible={true} />}
            <header className="create-header">
                <button
                    className="back-btn"
                    onClick={() => step === 3 ? setStep(2) : step === 2 ? setStep(1) : navigate(`/session/${roomId}`)}
                >
                    <ChevronLeft size={24} /> {step === 3 ? 'Back to canvas' : step === 2 ? 'Back to templates' : 'Back to Garden'}
                </button>
                <h1>{step === 3 ? 'Share Your Thoughts' : step === 2 ? 'Customize Form' : 'Add to Garden'}</h1>
            </header>

            {step === 1 && (
                <div className="step-container">
                    <h2>Choose a Form</h2>
                    <div className="template-grid">
                        {TEMPLATES.map(t => (
                            <div key={t.id} className="template-card" onClick={() => handleTemplateSelect(t)}>
                                <span className="template-emoji">{t.emoji}</span>
                                <span className="template-name">{t.name}</span>
                                <span className="template-theme">{t.tone}</span>
                            </div>
                        ))}
                        <div className="template-card" onClick={() => handleTemplateSelect('custom')}>
                            <span className="template-emoji">✨</span>
                            <span className="template-name">Create Your Own</span>
                            <span className="template-theme">Any Theme</span>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="step-container create-content">
                    <div className="canvas-section">
                        <div className="canvas-wrapper">
                            <div style={{ position: 'relative', width: 500, height: 500 }}>
                                {selectedTemplate && selectedTemplate !== 'custom' && (
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '250px',
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                        zIndex: 1,
                                        lineHeight: 1
                                    }}>
                                        {selectedTemplate.emoji}
                                    </div>
                                )}
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseOut={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    className="drawing-canvas"
                                    style={{ position: 'absolute', inset: 0, zIndex: 2 }}
                                />
                            </div>
                        </div>

                        <div className="tools-panel">
                            <div className="brush-types">
                                <button type="button" className={`brush-btn ${brushType === 'solid' ? 'active' : ''}`} onClick={() => setBrushType('solid')} title="Solid"><PenLine size={22} /></button>
                                <button type="button" className={`brush-btn ${brushType === 'glow' ? 'active' : ''}`} onClick={() => setBrushType('glow')} title="Glow"><Wand2 size={22} /></button>
                                <button type="button" className={`brush-btn ${brushType === 'dotted' ? 'active' : ''}`} onClick={() => setBrushType('dotted')} title="Dotted"><Minus size={22} style={{ strokeDasharray: '4 4' }} /></button>
                                <button type="button" className={`brush-btn ${brushType === 'spray' ? 'active' : ''}`} onClick={() => setBrushType('spray')} title="Spray"><SprayCan size={22} /></button>
                                <button type="button" className={`brush-btn ${brushType === 'eraser' ? 'active' : ''}`} onClick={() => setBrushType('eraser')} title="Eraser"><Eraser size={22} /></button>
                            </div>

                            <div className="colors">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        className={`color-swatch ${color === c ? 'active' : ''}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setColor(c)}
                                        type="button"
                                    />
                                ))}
                                <div 
                                    className={`color-picker-wrapper ${!COLORS.includes(color) ? 'active' : ''}`}
                                    style={!COLORS.includes(color) ? { background: color } : {}}
                                >
                                    <input 
                                        type="color" 
                                        className="custom-color-input"
                                        value={!COLORS.includes(color) ? color : '#ff0000'}
                                        onChange={(e) => setColor(e.target.value)}
                                        title="Pick a custom color"
                                    />
                                </div>
                            </div>
                            <div className="brush-sizes">
                                {[2, 5, 10, 20].map(s => (
                                    <button
                                        key={s}
                                        className={`size-btn ${brushSize === s ? 'active' : ''}`}
                                        onClick={() => setBrushSize(s)}
                                        type="button"
                                    >
                                        <div style={{ width: s, height: s, backgroundColor: color, borderRadius: '50%' }} />
                                    </button>
                                ))}
                            </div>
                            <div className="actions">
                                <button type="button" className="tool-action" onClick={clearCanvas}>
                                    <Eraser size={20} /> Clear
                                </button>
                            </div>
                            <button 
                                type="button" 
                                className="btn-primary" 
                                style={{ width: '100%', marginTop: '0.5rem' }}
                                onClick={() => {
                                    if(canvasRef.current) {
                                        const finalCanvas = document.createElement('canvas');
                                        finalCanvas.width = canvasRef.current.width;
                                        finalCanvas.height = canvasRef.current.height;
                                        const finalCtx = finalCanvas.getContext('2d');
                                        
                                        if (selectedTemplate && selectedTemplate !== 'custom') {
                                            finalCtx.font = '250px sans-serif';
                                            finalCtx.textAlign = 'center';
                                            finalCtx.textBaseline = 'middle';
                                            finalCtx.fillText(selectedTemplate.emoji, 250, 260);
                                        }
                                        
                                        finalCtx.drawImage(canvasRef.current, 0, 0);
                                        setPreviewUrl(finalCanvas.toDataURL('image/png'));
                                    }
                                    setStep(3);
                                }}
                            >
                                Next: Share Thoughts
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="step-container create-content">
                    <div className="creation-preview">
                        <h3>Your Creation</h3>
                        {previewUrl && <img src={previewUrl} alt="Preview" />}
                    </div>
                    <form className="form-section" onSubmit={handlePlantFlower}>
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <PromptBanner roomId={roomId} isCollapsible={false} />
                        </div>
                        <div className="form-group">
                            <label>Name your form</label>
                            <input
                                type="text"
                                value={flowerName}
                                onChange={e => setFlowerName(e.target.value)}
                                placeholder="E.g. Rose of Joy"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>The Roots (Your Thoughts)</label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Type your thoughts here"
                                rows={3}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary plant-btn">
                            Add to Garden
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CreateFlower;
