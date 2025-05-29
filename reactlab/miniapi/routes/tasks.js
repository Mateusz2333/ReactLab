const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
router.get('/', auth, async (req, res) => { const f={}; if(req.query.projekt)f.projekt=req.query.projekt; if(req.query.historyjka)f.historyjka=req.query.historyjka; res.json(await Task.find(f)); });
router.post('/', auth, async (req, res) => { if(req.user.rola==='guest')return res.status(403).json({message:'Read-only'}); res.status(201).json(await new Task(req.body).save()); });
router.put('/:id', auth, async (req, res) => { if(req.user.rola==='guest')return res.status(403).json({message:'Read-only'}); res.json(await Task.findByIdAndUpdate(req.params.id, req.body, {new:true})); });
router.delete('/:id', auth, async (req, res) => { if(req.user.rola==='guest')return res.status(403).json({message:'Read-only'}); await Task.findByIdAndDelete(req.params.id); res.status(204).end(); });
module.exports = router;