import React, { useMemo } from 'react';

const BlueprintRenderer = ({ layout }) => {
    if (!layout) return null;

    const SCALE = 10; // 1ft = 10px
    const PADDING = 40;

    const parseDimensions = (dimStr) => {
        const parts = dimStr.replace(/'/g, '').split('x');
        return {
            w: (parseInt(parts[0]) || 10) * SCALE,
            h: (parseInt(parts[1]) || 10) * SCALE
        };
    };

    const getPositionCoords = (pos, width, height, canvasWidth, canvasHeight) => {
        const center = { x: canvasWidth / 2 - width / 2, y: canvasHeight / 2 - height / 2 };

        switch (pos?.toLowerCase()) {
            case 'north': return { x: center.x, y: PADDING };
            case 'south': return { x: center.x, y: canvasHeight - height - PADDING };
            case 'east': return { x: canvasWidth - width - PADDING, y: center.y };
            case 'west': return { x: PADDING, y: center.y };
            case 'north-east': return { x: canvasWidth - width - PADDING, y: PADDING };
            case 'north-west': return { x: PADDING, y: PADDING };
            case 'south-east': return { x: canvasWidth - width - PADDING, y: canvasHeight - height - PADDING };
            case 'south-west': return { x: PADDING, y: canvasHeight - height - PADDING };
            case 'center':
            default: return center;
        }
    };

    const renderFloor = (rooms, title) => {
        const canvasWidth = 800;
        const canvasHeight = 600;

        return (
            <div className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">{title}</h3>
                <svg
                    viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                    className="w-full h-auto max-w-2xl bg-white shadow-inner rounded-lg border border-slate-100"
                    style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                >
                    {rooms.map((room, idx) => {
                        const dim = parseDimensions(room.dimensions);
                        const pos = getPositionCoords(room.position, dim.w, dim.h, canvasWidth, canvasHeight);

                        return (
                            <g key={idx} className="group cursor-default">
                                {/* Room Outline */}
                                <rect
                                    x={pos.x}
                                    y={pos.y}
                                    width={dim.w}
                                    height={dim.h}
                                    fill="white"
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                    className="transition-all group-hover:fill-blue-50"
                                />
                                {/* Wall thickness effect */}
                                <rect
                                    x={pos.x + 2}
                                    y={pos.y + 2}
                                    width={dim.w - 4}
                                    height={dim.h - 4}
                                    fill="none"
                                    stroke="#cbd5e1"
                                    strokeWidth="1"
                                    strokeDasharray="4 2"
                                />
                                {/* Room Text */}
                                <text
                                    x={pos.x + dim.w / 2}
                                    y={pos.y + dim.h / 2 - 5}
                                    textAnchor="middle"
                                    className="fill-slate-800 font-bold text-[12px] uppercase tracking-tight"
                                >
                                    {room.room}
                                </text>
                                <text
                                    x={pos.x + dim.w / 2}
                                    y={pos.y + dim.h / 2 + 10}
                                    textAnchor="middle"
                                    className="fill-slate-500 text-[10px] font-mono"
                                >
                                    {room.dimensions}
                                </text>

                                {/* Interaction Tooltip (Simulated) */}
                                <title>{room.features}</title>
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };

    return (
        <div className="w-full space-y-12">
            {renderFloor(layout.groundFloor, "Ground Floor Plan")}
            {layout.firstFloor && layout.firstFloor.length > 0 && renderFloor(layout.firstFloor, "First Floor Plan")}
        </div>
    );
};

export default BlueprintRenderer;
