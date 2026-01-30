const { createCanvas } = require('canvas');

/**
 * Renders an architectural layout to a Canvas buffer
 * @param {Object} layout - The blueprint JSON
 * @param {String} format - 'png' or 'pdf'
 * @returns {Buffer}
 */
const drawBlueprintCanvas = (layout, format = 'png') => {
    const SCALE = 15; // 1ft = 15px for higher resolution
    const PADDING = 60;
    const CANVAS_WIDTH = 1200;
    const CANVAS_HEIGHT = 1600; // Large enough for both floors

    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, format === 'pdf' ? 'pdf' : undefined);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Architectural Blueprint - AI Studio', PADDING, PADDING);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.fillText(`Total Built-up Area: ${layout.totalBuiltUpArea}`, PADDING, PADDING + 40);

    let currentY = PADDING + 100;

    const parseDimensions = (dimStr) => {
        const parts = dimStr.replace(/'/g, '').split('x');
        return {
            w: (parseInt(parts[0]) || 10) * SCALE,
            h: (parseInt(parts[1]) || 10) * SCALE
        };
    };

    const getPositionCoords = (pos, width, height, cWidth, cHeight, offset) => {
        const localCenter = { x: cWidth / 2 - width / 2, y: offset + 250 - height / 2 };

        switch (pos?.toLowerCase()) {
            case 'north': return { x: localCenter.x, y: offset + 80 };
            case 'south': return { x: localCenter.x, y: offset + 500 - height - 40 };
            case 'east': return { x: cWidth - width - 80, y: localCenter.y };
            case 'west': return { x: 80, y: localCenter.y };
            case 'north-east': return { x: cWidth - width - 80, y: offset + 80 };
            case 'north-west': return { x: 80, y: offset + 80 };
            case 'south-east': return { x: cWidth - width - 80, y: offset + 500 - height - 40 };
            case 'south-west': return { x: 80, y: offset + 500 - height - 40 };
            case 'center':
            default: return localCenter;
        }
    };

    const renderFloor = (rooms, title, startY) => {
        // Floor Title
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(title.toUpperCase(), PADDING, startY);

        // Grid lines (subtle)
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        for (let x = 0; x < CANVAS_WIDTH; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, startY + 20);
            ctx.lineTo(x, startY + 520);
            ctx.stroke();
        }
        for (let y = startY + 20; y < startY + 520; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }

        rooms.forEach((room) => {
            const dim = parseDimensions(room.dimensions);
            const pos = getPositionCoords(room.position, dim.w, dim.h, CANVAS_WIDTH, 500, startY);

            // Room Box
            ctx.strokeStyle = '#3b82f6'; // blue-500
            ctx.lineWidth = 3;
            ctx.strokeRect(pos.x, pos.y, dim.w, dim.h);

            // Inner wall
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(pos.x + 4, pos.y + 4, dim.w - 8, dim.h - 8);
            ctx.setLineDash([]);

            // Label
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(room.room.toUpperCase(), pos.x + dim.w / 2, pos.y + dim.h / 2 - 5);

            ctx.fillStyle = '#64748b';
            ctx.font = '12px Courier';
            ctx.fillText(room.dimensions, pos.x + dim.w / 2, pos.y + dim.h / 2 + 15);
        });

        ctx.textAlign = 'left'; // Reset
        return startY + 600; // Advance Y
    };

    // Render Ground Floor
    currentY = renderFloor(layout.groundFloor, "Ground Floor Plan", currentY);

    // Render First Floor if exists
    if (layout.firstFloor && layout.firstFloor.length > 0) {
        currentY = renderFloor(layout.firstFloor, "First Floor Plan", currentY);
    }

    // Footer / Notes
    if (currentY + 100 < CANVAS_HEIGHT && layout.notes) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(PADDING, currentY - 50, CANVAS_WIDTH - 2 * PADDING, 120);

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Architect\'s Notes:', PADDING + 20, currentY - 20);

        ctx.fillStyle = '#475569';
        ctx.font = 'italic 12px Arial';
        // Simple word wrap for notes
        const words = layout.notes.split(' ');
        let line = '';
        let y = currentY + 5;
        words.forEach(word => {
            if ((line + word).length > 80) {
                ctx.fillText(line, PADDING + 20, y);
                line = word + ' ';
                y += 18;
            } else {
                line += word + ' ';
            }
        });
        ctx.fillText(line, PADDING + 20, y);
    }

    return canvas;
};

const drawBlueprintBuffer = (layout, format = 'png') => {
    const canvas = drawBlueprintCanvas(layout, format);
    return canvas.toBuffer(format === 'pdf' ? 'application/pdf' : 'image/png');
};

module.exports = { drawBlueprintBuffer, drawBlueprintCanvas };
