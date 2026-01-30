import React from 'react';

const ColorStudio = ({ palette, onGenerate, isLoading }) => {
    return (
        <div className="w-full h-full p-8 flex flex-col bg-white rounded-3xl overflow-auto">
            <div className="mb-8 flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Color Studio</h2>
                    <p className="text-slate-500">AI-suggested palettes for your home</p>
                </div>
                {!palette && !isLoading && (
                    <button
                        onClick={() => onGenerate('Modern Indian Minimalist')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                        Generate Palette
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium">Curating your aesthetic...</p>
                </div>
            ) : palette ? (
                <div className="space-y-10">
                    <div>
                        <h3 className="text-4xl font-playfair font-bold text-slate-800 mb-2">{palette.paletteName}</h3>
                        <p className="text-slate-600 max-w-2xl leading-relaxed">{palette.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {palette.colors.map((color, idx) => (
                            <div key={idx} className="group relative">
                                <div
                                    className="h-48 rounded-2xl shadow-lg border border-slate-200 transition-transform hover:scale-[1.02]"
                                    style={{ backgroundColor: color.hex }}
                                >
                                    <div className="absolute inset-x-4 bottom-4 p-3 bg-white/90 backdrop-blur-md rounded-xl border border-white/20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Copy Hex</p>
                                        <p className="text-sm font-mono font-bold text-slate-800">{color.hex}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h4 className="font-bold text-slate-800 text-lg">{color.name}</h4>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{color.usage}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <p className="text-sm text-slate-500">Not what you're looking for? Try another style.</p>
                        <div className="flex gap-2">
                            <button onClick={() => onGenerate('Traditional Heritage')} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all">Heritage</button>
                            <button onClick={() => onGenerate('Coastal Breezy')} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all">Coastal</button>
                            <button onClick={() => onGenerate('Industrial Raw')} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all">Industrial</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-3xl">🎨</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Transform your space with color</h3>
                    <p className="text-slate-500 max-w-sm">Click generate to get an AI-curated palette based on your architectural design.</p>
                </div>
            )}
        </div>
    );
};

export default ColorStudio;
