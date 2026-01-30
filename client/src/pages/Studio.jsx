import { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import BlueprintVisualizer from '../components/BlueprintVisualizer';
import ColorStudio from '../components/ColorStudio';
import RenderGallery from '../components/RenderGallery';
import DownloadSection from '../components/DownloadSection';

const Studio = () => {
    const { user, logout } = useContext(AuthContext);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Hello ${user?.name}! I'm your AI Architect. Let's start building your dream home. First, what is the size of your plot?` }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [layout, setLayout] = useState(null);
    const [palette, setPalette] = useState(null);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [isGeneratingColors, setIsGeneratingColors] = useState(false);
    const [view, setView] = useState('blueprint'); // 'blueprint', 'colors', 'render', 'exports'
    const [renders, setRenders] = useState([]);
    const [isGeneratingRenders, setIsGeneratingRenders] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/ai/chat`,
                { messages: newMessages },
                config
            );

            setMessages([...newMessages, { role: 'assistant', content: data.content }]);

            // Trigger synthesis if data gathering is complete
            if (data.content.includes('SYSTEM_DATA_ACQUIRED')) {
                synthesizeLayout(newMessages);
            }
        } catch (error) {
            console.error(error);
            setMessages([...newMessages, { role: 'assistant', content: "I'm sorry, I'm having trouble thinking right now. Please check your connection." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const synthesizeLayout = async (conversation) => {
        setIsSynthesizing(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/ai/synthesize`,
                { conversationHistory: conversation },
                config
            );

            setLayout(data);
            setView('blueprint');
        } catch (error) {
            console.error(error);
            alert("Architectural synthesis failed. Please try again.");
        } finally {
            setIsSynthesizing(false);
        }
    };

    const handleGeneratePalette = async (aesthetic) => {
        setIsGeneratingColors(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/ai/colors`,
                { aesthetic },
                config
            );

            setPalette(data);
        } catch (error) {
            console.error(error);
            alert("Color palette generation failed.");
        } finally {
            setIsGeneratingColors(false);
        }
    };

    const handleGenerateMultiView = async () => {
        if (renders.length > 0) {
            setView('render');
            return;
        }

        setIsGeneratingRenders(true);
        setView('render');
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/ai/multi-visualize`,
                { description: `A high-end modern house based on the blueprint layout.` },
                config
            );

            setRenders(data.renders);
        } catch (error) {
            console.error(error);
            alert("Multi-view generation failed.");
        } finally {
            setIsGeneratingRenders(false);
        }
    };

    const handleGenerateFloorRenders = async () => {
        setIsGeneratingRenders(true);
        setView('render');
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/ai/floor-visualize`,
                { layout },
                config
            );

            const floorRendersTranslated = data.floorRenders.map(fr => ({
                view: fr.floor,
                imageUrl: fr.imageUrl
            }));

            setRenders(prev => [...prev, ...floorRendersTranslated]);
        } catch (error) {
            console.error(error);
            alert("Floor render generation failed.");
        } finally {
            setIsGeneratingRenders(false);
        }
    };

    const handleDownloadBlueprint = async (format) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                responseType: 'blob'
            };

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/ai/download`,
                { layout, format },
                config
            );

            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Blueprint_${Date.now()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Blueprint download failed:', error);
            alert("Download failed.");
        }
    };

    const handleDownloadAllAssets = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                responseType: 'blob'
            };

            // Filter renders into categories based on their 'view' names or we need a way to distinguish them if they are all in the same array
            // Actually, we can just send the entire renders array and handle it, or we could have kept them separate in state
            // Let's assume the current 'renders' state has everything.
            // For more precision, we might need separate state variables for houseViews, floorRenders, interiorRenders
            // But let's keep it simple for now and send what we have.

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/ai/download-all`,
                {
                    layout,
                    renders: renders.filter(r => ['Front Elevation', 'Side View', 'Angled 3D Perspective'].includes(r.view)),
                    floorRenders: renders.filter(r => ['Ground Floor', 'First Floor'].includes(r.view)).map(r => ({ floor: r.view, imageUrl: r.imageUrl })),
                    interiorRenders: renders.filter(r => !['Front Elevation', 'Side View', 'Angled 3D Perspective', 'Ground Floor', 'First Floor'].includes(r.view)).map(r => ({ room: r.view, imageUrl: r.imageUrl }))
                },
                config
            );

            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Architectural_Portfolio_${Date.now()}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Bulk download failed:', error);
            alert("Export failed. Please try again.");
        }
    };

    const handleGenerateInteriorRenders = async () => {
        setIsGeneratingRenders(true);
        setView('render');
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/ai/interior-visualize`,
                { layout, palette },
                config
            );

            const interiorRendersTranslated = data.interiorRenders.map(ir => ({
                view: ir.room,
                imageUrl: ir.imageUrl
            }));

            setRenders(prev => [...prev, ...interiorRendersTranslated]);
        } catch (error) {
            console.error(error);
            alert("Interior render generation failed.");
        } finally {
            setIsGeneratingRenders(false);
        }
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden font-inter">
            {/* Sidebar / Chat */}
            <div className={`w-1/3 flex flex-col border-r border-slate-200 bg-slate-50 transition-all ${view !== 'blueprint' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                    <h1 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">AI</span>
                        Studio
                    </h1>
                    <button onClick={logout} className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">Logout</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border border-slate-200 text-slate-700 shadow-sm'}`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-slate-400 text-sm animate-pulse">
                                Architect is typing...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-6 bg-white border-t border-slate-200 shadow-2xl">
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <input
                            type="text"
                            className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-sm text-slate-700"
                            placeholder="Type your requirement..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-sm shadow-md shadow-blue-100"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Preview Panel */}
            <div className="flex-1 relative bg-slate-100 overflow-hidden">
                <div className="absolute inset-0 p-8">
                    {view === 'blueprint' && (
                        layout ? (
                            <BlueprintVisualizer layout={layout} />
                        ) : (
                            <div className="w-full h-full bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center justify-center text-center p-8">
                                <div className={`w-24 h-24 mb-6 border-4 border-slate-100 border-t-blue-500 rounded-full ${isSynthesizing || isTyping ? 'animate-spin' : ''}`}></div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                    {isSynthesizing ? 'Synthesizing Architecture' : 'Architectural Canvas'}
                                </h2>
                                <p className="text-slate-500 max-w-md">
                                    {isSynthesizing
                                        ? 'I am processing your requirements to generate a logical floor plan. Please wait...'
                                        : 'Finish your discussion with the AI Architect to generate your blueprint here.'}
                                </p>
                            </div>
                        )
                    )}

                    {view === 'colors' && (
                        <ColorStudio
                            palette={palette}
                            onGenerate={handleGeneratePalette}
                            isLoading={isGeneratingColors}
                        />
                    )}

                    {view === 'render' && (
                        <div className="w-full h-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 overflow-auto">
                            {isGeneratingRenders ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 mb-6 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Generating Architectural Renders</h2>
                                    <p className="text-slate-500 max-w-md">I am creating high-fidelity Front, Side, and 3D perspectives of your design. This may take a minute...</p>
                                </div>
                            ) : (
                                renders.length > 0 ? (
                                    <RenderGallery
                                        renders={renders}
                                        onDownloadAll={handleDownloadAllAssets}
                                        isPaid={user?.isPaid}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl mb-4">🎨</div>
                                        <h2 className="text-2xl font-bold text-slate-800 mb-2">3D Render Suite</h2>
                                        <p className="text-slate-500 max-w-sm mb-8">Generate professional, high-resolution architectural visualizations of your house and floors.</p>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleGenerateMultiView}
                                                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                                            >
                                                Generate All Views
                                            </button>
                                            <button
                                                onClick={handleGenerateFloorRenders}
                                                className="px-8 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-2xl font-bold shadow-xl hover:bg-indigo-50 transition-all"
                                            >
                                                Generate Floor Renders
                                            </button>
                                            <button
                                                onClick={handleGenerateInteriorRenders}
                                                className="px-8 py-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl font-bold shadow-xl hover:bg-indigo-100 transition-all"
                                            >
                                                Generate Interior Renders
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {view === 'exports' && (
                        <DownloadSection
                            layout={layout}
                            renders={renders}
                            isPaid={user?.isPaid}
                            handleDownloadBlueprint={handleDownloadBlueprint}
                            handleDownloadAll={handleDownloadAllAssets}
                        />
                    )}
                </div>

                {/* Studio Controls Header */}
                <div className="absolute top-12 left-12 right-12 flex justify-between items-center pointer-events-none">
                    <div className="px-6 py-3 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-auto">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                            {layout ? 'Design Ready' : 'Acquiring Data'}
                        </span>
                    </div>

                    {layout && (
                        <div className="flex gap-2 pointer-events-auto">
                            <button
                                onClick={() => setView('blueprint')}
                                className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${view === 'blueprint' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white/90 backdrop-blur-xl border border-slate-200 text-slate-700 shadow-xl'}`}
                            >
                                2D Layout
                            </button>
                            <button
                                onClick={() => setView('colors')}
                                className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${view === 'colors' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white/90 backdrop-blur-xl border border-slate-200 text-slate-700 shadow-xl'}`}
                            >
                                Color Studio
                            </button>
                            <button
                                onClick={handleGenerateMultiView}
                                className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${view === 'render' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white/90 backdrop-blur-xl border border-slate-200 text-slate-700 shadow-xl'}`}
                            >
                                3D Render
                            </button>
                            <button
                                onClick={() => setView('exports')}
                                className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${view === 'exports' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white/90 backdrop-blur-xl border border-slate-200 text-slate-700 shadow-xl'}`}
                            >
                                Exports
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Studio;
