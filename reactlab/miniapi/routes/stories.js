const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');
router.get('/', auth, async (req, res) => { const f={}; if(req.query.projekt)f.projekt=req.query.projekt; res.json(await Story.find(f)); });
router.post('/', auth, async (req, res) => { if(req.user.rola==='guest')return res.status(403).json({message:'Read-only'}); res.status(201).json(await new Story(req.body).save()); });
router.put('/:id', auth, async (req, res) => { if(req.user.rola==='guest')return res.status(403).json({message:'Read-only'}); res.json(await Story.findByIdAndUpdate(req.params.id, req.body, {new:true})); });
router.delete('/:id', auth, async (req, res) => { if(req.user.rola==='guest')return res.status(403).json({message:'Read-only'}); await Story.findByIdAndDelete(req.params.id); res.status(204).end(); });
module.exports = router;