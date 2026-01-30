import React, { useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import BlueprintRenderer from './BlueprintRenderer';

const BlueprintVisualizer = ({ layout }) => {
    const [activeTab, setActiveTab] = useState('visual'); // 'list' or 'visual'
    const [isDownloading, setIsDownloading] = useState(false);
    const contentRef = useRef(null);

    if (!layout) return null;

    const handleDownload = async (format) => {
        setIsDownloading(true);
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
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
            link.setAttribute('download', `AI_Home_Blueprint_${Date.now()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download blueprint.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        const element = contentRef.current;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`AI_Home_Blueprint_${Date.now()}.pdf`);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="w-full h-full p-8 flex flex-col bg-white rounded-3xl overflow-auto shadow-2xl relative">
            <div ref={contentRef} className="flex-1 flex flex-col min-h-max">
                <div className="mb-6 flex justify-between items-end border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">2D Architectural Layout</h2>
                        <p className="text-slate-500">Proposed blueprint based on your requirements</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 pointer-events-auto">
                            <button
                                onClick={() => setActiveTab('visual')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'visual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                VISUAL
                            </button>
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                SPEC LIST
                            </button>
                        </div>
                        <p className="text-xl font-mono text-blue-600 font-bold">{layout.totalBuiltUpArea}</p>
                    </div>
                </div>

                {activeTab === 'visual' ? (
                    <BlueprintRenderer layout={layout} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Ground Floor */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">G</span>
                                Ground Floor
                            </h3>
                            <div className="space-y-3">
                                {layout.groundFloor.map((room, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-800">{room.room}</h4>
                                            <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200">{room.dimensions}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">{room.features}</p>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Position: {room.position}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* First Floor */}
                        {layout.firstFloor && layout.firstFloor.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">1</span>
                                    First Floor
                                </h3>
                                <div className="space-y-3">
                                    {layout.firstFloor.map((room, idx) => (
                                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors shadow-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-800">{room.room}</h4>
                                                <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200">{room.dimensions}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">{room.features}</p>
                                            <span className="text-[10px] uppercase font-bold text-slate-400">Position: {room.position}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 italic text-blue-800 text-sm">
                    <strong className="block mb-1 not-italic text-blue-900 border-b border-blue-200 pb-1 uppercase tracking-widest text-[10px]">Architect's Notes</strong>
                    {layout.notes}
                </div>
            </div>

            {/* Floating Export Buttons */}
            <div className="fixed bottom-12 right-12 flex flex-col gap-3 z-50">
                <button
                    onClick={() => handleDownload('pdf')}
                    disabled={isDownloading}
                    className={`px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl font-bold flex items-center gap-3 hover:bg-black transition-all transform active:scale-95 ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isDownloading ? (
                        <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> Processing...</>
                    ) : (
                        <><span className="text-xl">📄</span> Download Professional PDF</>
                    )}
                </button>
                <button
                    onClick={() => handleDownload('png')}
                    disabled={isDownloading}
                    className={`px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-xl font-bold flex items-center gap-3 hover:bg-slate-50 transition-all transform active:scale-95 ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="text-xl">🖼️</span> Download High-Res PNG
                </button>
            </div>
        </div>
    );
};

export default BlueprintVisualizer;
