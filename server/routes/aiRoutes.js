const express = require('express');
const router = express.Router();
const { generateBlueprintStep, synthesizeBlueprintLayout, generateHouseImage, generateMultiViewRenders, generateFloorRenders, generateInteriorRenders, generateColorPalette, downloadBlueprint, downloadAllAssets, saveHistory } = require('../controllers/aiController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.post('/chat', optionalProtect, generateBlueprintStep);
router.post('/synthesize', optionalProtect, synthesizeBlueprintLayout);
router.post('/visualize', optionalProtect, generateHouseImage);
router.post('/multi-visualize', optionalProtect, generateMultiViewRenders);
router.post('/floor-visualize', optionalProtect, generateFloorRenders);
router.post('/interior-visualize', optionalProtect, generateInteriorRenders);
router.post('/colors', optionalProtect, generateColorPalette);
router.post('/download', optionalProtect, downloadBlueprint);
router.post('/download-all', optionalProtect, downloadAllAssets);
router.post('/history', protect, saveHistory);

module.exports = router;
