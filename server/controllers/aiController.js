const archiver = require('archiver');
const axios = require('axios');
const asyncHandler = require('../middleware/asyncHandler');
const { generateChatCompletion, generateJSONCompletion } = require('../utils/openrouterClient');
const { generateArchitecturalRender, generateMultipleImages } = require('../utils/deepaiClient');
const History = require('../models/History');

// Keep OpenAI as fallback (optional - can be removed later)
// const OpenAI = require('openai');
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Phase 1: Requirement Gathering Chat
const generateBlueprintStep = asyncHandler(async (req, res) => {
    const { messages } = req.body;

    try {
        const systemMessage = {
            role: "system",
            content: `You are an AI Architect. Your goal is to gather house requirements for a 2D blueprint. 
          You must ask exactly these 11 questions ONE BY ONE in order:
          1. Plot Size (Dimensions or SqFt)
          2. Plot Direction (North, South, East, West)
          3. Location (City and area)
          4. Budget
          5. Number of Floors
          6. Bedrooms total
          7. Master Bedroom specific requirements
          8. Bathrooms (Attached vs Common)
          9. Hall size and preference
          10. Kitchen type
          11. Amenities (Balcony, parking count, pooja room)

          Rules:
          - Ask ONE question at a time.
          - Briefly acknowledge the user's answer before moving to the next question.
          - Once all 11 are answered, provide a final summary and end your message with the exact keyword: SYSTEM_DATA_ACQUIRED.`
        };

        const allMessages = [systemMessage, ...messages];
        const content = await generateChatCompletion(allMessages);

        res.json({ content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'AI generation failed' });
    }
});

// Phase 2: Architectural Synthesis (The AI Planner)
const synthesizeBlueprintLayout = asyncHandler(async (req, res) => {
    const { requirements, conversationHistory } = req.body;

    try {
        const inputData = requirements || conversationHistory;
        const systemMessage = {
            role: "system",
            content: `You are an expert AI Planner and Residential Architect. 
          Your task is to generate a detailed 2D blueprint layout plan based on user requirements gathered from the conversation.
          
          Guidelines:
          - Ensure realistic spacing and logical circulation (e.g., Kitchen near Dining, Bathrooms near Bedrooms).
          - Adhere to Indian residential standards and Vastu principles where possible.
          - Specify room names, accurate dimensions (ft), and floor placement.
          - Calculate the total built-up area.

          Output Format: 
          Always respond in a strictly structured JSON format. NEVER add explanations outside the JSON.
          
          JSON Structure Required:
          {
            "groundFloor": [
              { "room": "Living Room", "dimensions": "16'x18'", "position": "North-East", "features": "Large windows, main entry" },
              { "room": "Kitchen", "dimensions": "10'x12'", "position": "South-East", "features": "Utility area attached" }
            ],
            "firstFloor": [
              { "room": "Master Bedroom", "dimensions": "14'x16'", "position": "South-West", "features": "Attached bath, balcony" }
            ],
            "totalBuiltUpArea": "e.g., 1850 sq ft",
            "notes": "Architectural advice on light and ventilation"
          }`
        };

        const userMessage = {
            role: "user",
            content: `Synthesize a blueprint plan from this data: ${JSON.stringify(inputData)}`
        };

        console.log('Sending synthesis request to OpenRouter...');
        const parsedData = await generateJSONCompletion([systemMessage, userMessage]);
        console.log('Successfully received parsed blueprint data');
        res.json(parsedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Blueprint synthesis failed' });
    }
});

// Phase 3: Visual Rendering (DeepAI)
const generateHouseImage = asyncHandler(async (req, res) => {
    const { description, type, view = 'Exterior' } = req.body;

    try {
        const prompt = `A high-end, photorealistic 3D architectural render of a ${view} view of a house. 
    Description: ${description}. 
    Style: Modern Indian Residential, cinematic lighting, ultra-detailed, 8k resolution, architectural photography style, no text, no watermarks.`;

        const imageUrl = await generateArchitecturalRender(prompt);

        res.json({ imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Image generation failed' });
    }
});

// Phase 3.5: Multi-View Rendering
const generateMultiViewRenders = asyncHandler(async (req, res) => {
    const { description } = req.body;
    const views = ['Front Elevation', 'Side View', 'Angled 3D Perspective'];

    try {
        const prompts = views.map(view =>
            `Professional architectural documentation render: ${view} of a house. 
      Base Description: ${description}. 
      Style: Modern Indian Residential, clean white background, cinematic daylighting, 8k print-ready, sharp focus, architectural photography, NO TEXT, NO WATERMARKS.`
        );

        const imageUrls = await generateMultipleImages(prompts);
        const images = imageUrls.map((url, index) => ({
            view: views[index],
            imageUrl: url
        }));

        res.json({ renders: images });
    } catch (error) {
        console.error('Multi-view generation failed:', error);
        res.status(500).json({ message: 'Multi-view generation failed' });
    }
});

// Phase 3.6: Floor-wise 3D Rendering
const generateFloorRenders = asyncHandler(async (req, res) => {
    const { layout } = req.body;

    try {
        if (!layout) {
            return res.status(400).json({ message: 'Layout data is required' });
        }

        const floors = [];
        if (layout.groundFloor) floors.push('Ground Floor');
        if (layout.firstFloor && layout.firstFloor.length > 0) floors.push('First Floor');

        const prompts = floors.map(floor =>
            `Realistic 3D architectural isometric cutaway view of the ${floor} of a modern house. 
      Layout Details: ${JSON.stringify(layout.groundFloor && floor === 'Ground Floor' ? layout.groundFloor : layout.firstFloor)}. 
      Style: Modern Indian Residential, high-end interior lighting, professional photography, 8k resolution, NO TEXT, NO WATERMARKS.`
        );

        const imageUrls = await generateMultipleImages(prompts);
        const images = imageUrls.map((url, index) => ({
            floor: floors[index],
            imageUrl: url
        }));

        res.json({ floorRenders: images });
    } catch (error) {
        console.error('Floor render generation failed:', error);
        res.status(500).json({ message: 'Floor render generation failed' });
    }
});

// Phase 3.7: Interior Room Rendering
const generateInteriorRenders = asyncHandler(async (req, res) => {
    const { layout, palette } = req.body;

    try {
        if (!layout) {
            return res.status(400).json({ message: 'Layout data is required' });
        }

        const roomTypes = [];
        const collectRooms = (floor) => {
            if (floor) {
                floor.forEach(item => {
                    if (item.room && !roomTypes.includes(item.room)) {
                        roomTypes.push(item.room);
                    }
                });
            }
        };

        collectRooms(layout.groundFloor);
        collectRooms(layout.firstFloor);

        const colorContext = palette ? `using the palette: ${palette.paletteName} (${palette.colors.map(c => c.name).join(', ')})` : '';

        const prompts = roomTypes.map(room =>
            `Hyper-realistic DSLR-quality interior architectural photography of a ${room}. 
      Style: Modern Indian Residential. 
      Lighting: Cinematic realistic daylight. 
      Details: ${colorContext}. High-end furniture, elegant finishes, ultra-detailed, 8k resolution, NO PEOPLE, NO TEXT, NO WATERMARKS.`
        );

        const imageUrls = await generateMultipleImages(prompts);
        const images = imageUrls.map((url, index) => ({
            room: roomTypes[index],
            imageUrl: url
        }));

        res.json({ interiorRenders: images });
    } catch (error) {
        console.error('Interior render generation failed:', error);
        res.status(500).json({ message: 'Interior render generation failed' });
    }
});

// Phase 4: Color Suggestions
const generateColorPalette = asyncHandler(async (req, res) => {
    const { aesthetic } = req.body;

    try {
        const systemMessage = {
            role: "system",
            content: `You are a professional interior designer specializing in Indian residential architecture. 
          Generate a curated color palette (Hex codes + names) based on a given aesthetic.
          Include usage suggestions (e.g., "Accent Wall", "Main Walls", "Flooring").
          
          Output Format: 
          Always respond in a strictly structured JSON format.
          
          JSON Structure Required:
          {
            "paletteName": "Elegant Modern Sand",
            "description": "A warm, earthy palette that brings a touch of Rajasthani desert elegance to modern architecture.",
            "colors": [
              { "hex": "#F4EBD0", "name": "Cream Silk", "usage": "Living Room Walls" },
              { "hex": "#B68D40", "name": "Sun-Kissed Sand", "usage": "Accent Wall / Textured Finish" },
              { "hex": "#122620", "name": "Deep Forest", "usage": "Furniture / Metal Accents" },
              { "hex": "#D6AD60", "name": "Gold Leaf", "usage": "Trim / Decorative elements" }
            ]
          }`
        };

        const userMessage = {
            role: "user",
            content: `Generate a palette for this aesthetic: ${aesthetic}`
        };

        const parsedData = await generateJSONCompletion([systemMessage, userMessage]);
        res.json(parsedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Color palette generation failed' });
    }
});

const { drawBlueprintBuffer, drawBlueprintCanvas } = require('../utils/blueprintDrawer');

// ... existing code ...

// Phase 5: Export/Download
// Phase 4.5: Save History
const saveHistory = asyncHandler(async (req, res) => {
    const { messages, layout, palette, renders } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: 'Must be logged in to save history' });
    }

    try {
        let history = await History.findOne({ user: req.user._id });

        if (history) {
            history.messages = messages || history.messages;
            history.layout = layout || history.layout;
            history.palette = palette || history.palette;
            history.renders = renders || history.renders;
            await history.save();
        } else {
            history = await History.create({
                user: req.user._id,
                messages: messages || [],
                layout: layout || null,
                palette: palette || null,
                renders: renders || []
            });
        }

        res.json(history);
    } catch (error) {
        console.error('History save failed:', error);
        res.status(500).json({ message: 'Failed to save history' });
    }
});

// Helper to add "PREVIEW" watermark
const addPreviewWatermark = (canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.rotate(-Math.PI / 4);
    ctx.font = 'bold 150px Arial';
    ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('PREVIEW', -canvas.height / 4, canvas.width / 2);
    ctx.restore();
};

const downloadBlueprint = asyncHandler(async (req, res) => {
    const { layout, format } = req.body; // format: 'png' or 'pdf'

    try {
        if (!layout) {
            return res.status(400).json({ message: 'Layout data is required' });
        }

        if (req.user && !req.user.isPaid) {
            // High-DPI reduction and watermark for non-paid users
            const previewCanvas = drawBlueprintCanvas(layout); // Draw at normal DPI
            addPreviewWatermark(previewCanvas);
            const buffer = format === 'pdf' ? previewCanvas.toBuffer('application/pdf') : previewCanvas.toBuffer('image/png');
            const fileName = `Preview_${Date.now()}.${format}`;
            res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'image/png');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            return res.send(buffer);
        }

        const buffer = drawBlueprintBuffer(layout, format);
        const fileName = `Blueprint_${Date.now()}.${format}`;

        res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Download failed' });
    }
});

const downloadAllAssets = asyncHandler(async (req, res) => {
    const { layout, renders, floorRenders, interiorRenders } = req.body;

    try {
        if (!req.user || !req.user.isPaid) {
            return res.status(403).json({ message: 'Upgrade to PRO to access Bulk Design Portfolios' });
        }
        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=AI_Architect_Portfolio_${Date.now()}.zip`);
        archive.pipe(res);

        // 1. Blueprint PDF
        const pdfBuffer = drawBlueprintBuffer(layout, 'pdf');
        archive.append(pdfBuffer, { name: 'Blueprint/Layout_Design.pdf' });

        // Helper to fetch image and add to zip
        const addRemoteImage = async (url, folder, name) => {
            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                archive.append(Buffer.from(response.data), { name: `${folder}/${name}.png` });
            } catch (err) {
                console.error(`Failed to download image ${url}:`, err);
            }
        };

        const imagePromises = [];

        // 2. Full House Renders
        if (renders) {
            renders.forEach((r, i) => {
                imagePromises.push(addRemoteImage(r.imageUrl, 'Full_House', r.view.replace(/\s+/g, '_')));
            });
        }

        // 3. Floor Renders
        if (floorRenders) {
            floorRenders.forEach((r, i) => {
                imagePromises.push(addRemoteImage(r.imageUrl, 'Floors', r.floor.replace(/\s+/g, '_')));
            });
        }

        // 4. Interior Renders
        if (interiorRenders) {
            interiorRenders.forEach((r, i) => {
                imagePromises.push(addRemoteImage(r.imageUrl, 'Rooms', r.room.replace(/\s+/g, '_')));
            });
        }

        await Promise.all(imagePromises);
        archive.finalize();
    } catch (error) {
        console.error('Bulk download failed:', error);
        res.status(500).json({ message: 'Bulk download failed' });
    }
});

module.exports = {
    generateBlueprintStep,
    synthesizeBlueprintLayout,
    generateHouseImage,
    generateMultiViewRenders,
    generateFloorRenders,
    generateInteriorRenders,
    generateColorPalette,
    downloadBlueprint,
    downloadAllAssets,
    saveHistory
};
