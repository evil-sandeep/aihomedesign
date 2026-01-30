import React, { useState } from 'react';

const DownloadSection = ({
    layout,
    renders,
    isPaid,
    handleDownloadBlueprint,
    handleDownloadAll,
    handleDownloadSingle
}) => {
    const [format, setFormat] = useState('pdf');
    const [downloading, setDownloading] = useState(null); // 'blueprint', 'full', 'floors', 'rooms'
    const [success, setSuccess] = useState(false);

    const blueprintFormats = [
        { id: 'pdf', label: 'PDF Document', desc: 'Vector format for printing' },
        { id: 'png', label: 'PNG Image', desc: 'High-res raster for sharing' }
    ];

    const simulateDownload = async (id, callback) => {
        setDownloading(id);
        setSuccess(false);
        try {
            await callback();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error(error);
        } finally {
            setDownloading(null);
        }
    };

    const categories = [
        {
            id: 'blueprint',
            title: '2D Blueprints',
            icon: '📐',
            count: layout ? 1 : 0,
            action: () => handleDownloadBlueprint(format),
            available: !!layout
        },
        {
            id: 'full',
            title: 'Full House Views',
            icon: '🏠',
            count: renders.filter(r => ['Front Elevation', 'Side View', 'Angled 3D Perspective'].includes(r.view)).length,
            action: handleDownloadAll,
            available: renders.length > 0,
            pro: true
        },
        {
            id: 'floors',
            title: 'Floor Perspectives',
            icon: '🏢',
            count: renders.filter(r => ['Ground Floor', 'First Floor'].includes(r.view)).length,
            action: handleDownloadAll,
            available: renders.filter(r => ['Ground Floor', 'First Floor'].includes(r.view)).length > 0,
            pro: true
        },
        {
            id: 'rooms',
            title: 'Interior Rooms',
            icon: '🛋️',
            count: renders.filter(r => !['Front Elevation', 'Side View', 'Angled 3D Perspective', 'Ground Floor', 'First Floor'].includes(r.view)).length,
            action: handleDownloadAll,
            available: renders.filter(r => !['Front Elevation', 'Side View', 'Angled 3D Perspective', 'Ground Floor', 'First Floor'].includes(r.view)).length > 0,
            pro: true
        }
    ];

    return (
        <div className="w-full h-full bg-slate-50 rounded-3xl p-8 overflow-y-auto font-inter">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest">
                        <span>📤</span> Export Studio
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Download Your Home</h1>
                    <p className="text-slate-500 text-lg">Export your architectural journey in professional formats</p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-500 text-white p-4 rounded-2xl flex items-center justify-center gap-3 animate-bounce shadow-xl shadow-green-100">
                        <span className="text-xl">✅</span>
                        <span className="font-bold uppercase tracking-wide text-xs">Export Complete! Check your downloads.</span>
                    </div>
                )}

                {/* Configuration Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

                    {/* Format Selection */}
                    <div className="md:col-span-1 space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Select Format</h3>
                        <div className="space-y-3">
                            {blueprintFormats.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFormat(f.id)}
                                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${format === f.id ? 'border-blue-600 bg-white shadow-lg' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <div className="font-bold text-slate-900">{f.label}</div>
                                    <div className="text-xs text-slate-400">{f.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Download Cards */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className={`p-6 rounded-3xl bg-white border border-slate-200 shadow-sm transition-all flex flex-col justify-between ${!cat.available ? 'opacity-50 grayscale' : 'hover:shadow-xl hover:-translate-y-1 hover:border-blue-100'}`}
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="text-3xl">{cat.icon}</div>
                                        {cat.pro && !isPaid && (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg uppercase">PRO</span>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-slate-900">{cat.title}</h4>
                                    <p className="text-xs text-slate-400">{cat.count} files available</p>
                                </div>

                                <div className="mt-8">
                                    {downloading === cat.id ? (
                                        <div className="space-y-2">
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600 animate-progress origin-left"></div>
                                            </div>
                                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest text-center">Bundling Assets...</p>
                                        </div>
                                    ) : (
                                        <button
                                            disabled={!cat.available || (cat.pro && !isPaid)}
                                            onClick={() => simulateDownload(cat.id, cat.action)}
                                            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${!cat.available || (cat.pro && !isPaid)
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200'
                                                }`}
                                        >
                                            {cat.available ? (cat.pro && !isPaid ? 'Locked' : 'Download') : 'Not Generated'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Global ZIP CTA */}
                {isPaid && renders.length > 0 && (
                    <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="text-4xl">📦</div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-extrabold mb-1">Complete Design Portfolio</h3>
                            <p className="text-blue-100 text-sm">Download all blueprints, variations, floors, and interior renders in a single high-fidelity ZIP archive.</p>
                        </div>
                        <button
                            onClick={() => simulateDownload('global', handleDownloadAll)}
                            className="bg-white text-blue-700 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-95 shadow-2xl"
                        >
                            {downloading === 'global' ? 'Processing...' : 'Export Everything'}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes progress {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(0.7); }
                    100% { transform: scaleX(1); }
                }
                .animate-progress {
                    animation: progress 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default DownloadSection;
