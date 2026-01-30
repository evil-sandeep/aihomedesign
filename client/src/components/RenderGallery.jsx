import React from 'react';

const RenderGallery = ({ renders, onDownloadAll, isPaid }) => {
    if (!renders || renders.length === 0) return null;

    const handleDownload = async (url, viewName) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `Design_${viewName.replace(/\s+/g, '_')}_${Date.now()}.png`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Image download failed:', error);
            alert('Failed to download image.');
        }
    };

    return (
        <div className="w-full space-y-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Architectural Design Gallery</h2>
                    <p className="text-slate-500">AI-generated high-resolution renders from multiple perspectives</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={isPaid ? onDownloadAll : () => alert('Upgrade to PRO to download the complete design portfolio (ZIP).')}
                        className={`${isPaid ? 'bg-slate-900' : 'bg-slate-400 cursor-not-allowed'} text-white px-6 py-2 rounded-xl font-bold text-sm shadow-xl hover:opacity-90 transition-all flex items-center gap-2`}
                    >
                        <span>{isPaid ? '📦' : '🔒'}</span> Download All {isPaid ? '(ZIP)' : '(PRO)'}
                    </button>
                    <div className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                        {isPaid ? 'Print Ready (HD)' : 'Standard (Preview)'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {renders.map((render, idx) => (
                    <div key={idx} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200 transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="aspect-square relative">
                            <img
                                src={render.imageUrl}
                                alt={render.view}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button
                                    onClick={() => handleDownload(render.imageUrl, render.view)}
                                    className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
                                >
                                    <span>⬇️</span> Download PNG
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <h3 className="font-bold text-slate-800 uppercase tracking-tight text-sm">{render.view}</h3>
                            <p className="text-[10px] text-slate-400 font-medium">
                                {isPaid ? '1024 x 1024 • No Watermark' : '512 x 512 • Standard License'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-slate-900 rounded-2xl text-white flex items-center gap-6 shadow-xl">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">💡</div>
                <div className="flex-1">
                    <h4 className="font-bold mb-1">Architectural Consistency Note</h4>
                    <p className="text-xs text-slate-400">These renders are generated based on your aesthetic requirements. For consistent architectural details across all views, we recommend using these as conceptual guides for your build team.</p>
                </div>
                <button className="px-6 py-2 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors">
                    Save to Project
                </button>
            </div>
        </div>
    );
};

export default RenderGallery;
