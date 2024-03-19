const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const Post = require('../models/Post');
const User = require('../models/User');
const Job = require('../models/Job');
const Comment = require('../models/Comment');
const Book = require('../models/Book');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin'
const jwtSecret = process.env.JWT_SECRET 
const authMiddleware = require('../helpers/authMiddleware');

//JOB | GET
router.get('/jobs', async (req, res) => {
    try {
        const locals = {
            title: "Jobs",
        }
        
        const user = req.session.user
        const users = await User.find()
        const jobs = await Job.find()
        res.render('jobs', {locals, jobs, user, users, layout: adminLayout})
    } catch (error) {
        console.log(error)
    }   
});

//JOB CREATE | GET
router.get('/add-job', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add New Job",
        }
        const user = req.session.user
        const users = await User.find()
        
        res.render('jobs/add-job', {locals, user, users, layout: adminLayout})
    } catch (error) {
        console.log(error)
    }   
});

//JOB CREATE | POST
router.post('/add-job', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Job",
            user: req.user, 
        };
        try {
            const newJob = new Job({
                title: req.body.title,
                body: req.body.body,        
            });
            console.log(newJob);
            await newJob.save();
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
});

//JOB EDIT | PUT
router.put('/edit-job', authMiddleware, async (req, res) => {
    try {
        const jobId = req.body.jobId;
        const title = req.body.title; 
        const body = req.body.body;
        console.log(req.body)
        const existingJob = await Job.findById(jobId);
        console.log(existingJob)
        if (!existingJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        existingJob.title = title
        existingJob.body = body
   
        await existingJob.save();

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//BOOK DELETE | DELETE
router.delete('/delete-job', authMiddleware, async (req, res) => {
    try {
        const jobId = req.body.jobId;
        await Job.deleteOne({ _id: jobId });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error)
    }   
});

router.post('/apply-to-job/:jobId', authMiddleware, async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const user = req.session.user;

        // Check if the user has already applied to this job
        const job = await Job.findById(jobId);
        if (job.applications.includes(user._id)) {
            return res.status(400).json({ message: 'You have already applied to this job.' });
        }

        // Add user to the job's applications array
        job.applications.push({
            userId: user._id,
            username: user.username,
        });
        await job.save();

        res.redirect('/jobs'); // Redirect to the jobs page or any other page
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;