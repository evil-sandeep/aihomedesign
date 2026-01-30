const express = require('express');
const router = express.Router();
const { generateBlueprintStep, synthesizeBlueprintLayout, generateHouseImage, generateMultiViewRenders, generateFloorRenders, generateInteriorRenders, generateColorPalette, downloadBlueprint, downloadAllAssets } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, generateBlueprintStep);
router.post('/synthesize', protect, synthesizeBlueprintLayout);
router.post('/visualize', protect, generateHouseImage);
router.post('/multi-visualize', protect, generateMultiViewRenders);
router.post('/floor-visualize', protect, generateFloorRenders);
router.post('/interior-visualize', protect, generateInteriorRenders);
router.post('/colors', protect, generateColorPalette);
router.post('/download', protect, downloadBlueprint);
router.post('/download-all', protect, downloadAllAssets);

module.exports = router;
