const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
router.get('/', auth, async (req, res) => res.json(await Project.find()));
router.post('/', auth, async (req, res) => { if (req.user.rola==='guest') return res.status(403).json({message:'Read-only'}); res.status(201).json(await new Project(req.body).save()); });
router.put('/:id', auth, async (req, res) => { if (req.user.rola==='guest') return res.status(403).json({message:'Read-only'}); res.json(await Project.findByIdAndUpdate(req.params.id, req.body, {new:true})); });
router.delete('/:id', auth, async (req, res) => { if (req.user.rola==='guest') return res.status(403).json({message:'Read-only'}); await Project.findByIdAndDelete(req.params.id); res.status(204).end(); });
module.exports = router;