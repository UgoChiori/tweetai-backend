const express = require('express');
const cors = require('cors');
const { createPool } = require('mysql2/promise');
const { get } = require('axios');
const { CronJob } = require('cron');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());



const port = process.env.PORT || 2000;

const db = createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tweetai'
});


// Rate limiter
app.use(rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5 ,// Limit each IP to 5 requests per windowMs
    message: 'Too many requests from this IP, please try again after a minute'
}));

// Schedule background task to create Autobots, Posts, and Comments every hour
const job = new CronJob('0 * * * *', async () => {
    console.log('Background job started...');
    try {
        for (let i = 0; i < 500; i++) {
            // Fetch user data from the API
            const { data: users } = await get('https://jsonplaceholder.typicode.com/users');
            if (!users || users.length === 0) {
                console.error('No users found in the response');
                continue;
            }
      
            // Randomly select a user
            const userData = users[Math.floor(Math.random() * users.length)];
            console.log('Selected user:', userData);
      
            // Insert the Autobot into the database
            const [result] = await db.query(
                'INSERT INTO autobots (name, username, email) VALUES (?, ?, ?)',
                [userData.name, userData.username, userData.email]
            );
            const autobotId = result.insertId;
            console.log(`Autobot created: ${userData.name} with ID ${autobotId}`);
      
            // Create Posts
            const { data: posts } = await get('https://jsonplaceholder.typicode.com/posts');
            console.log('Fetched posts:', posts);
      
            for (let j = 0; j < 10; j++) {
                const postData = posts[Math.floor(Math.random() * posts.length)];
                console.log('Selected post:', postData);
      
                // Insert the Post into the database
                const [postResult] = await db.query(
                    'INSERT INTO posts (autobot_id, title, body) VALUES (?, ?, ?)',
                    [autobotId, postData.title, postData.body]
                );
                const postId = postResult.insertId;
                console.log(`Post created: ${postData.title} for Autobot ID ${autobotId} with Post ID ${postId}`);
      
                // Create Comments for the Post
                const { data: comments } = await get('https://jsonplaceholder.typicode.com/comments');
                const postComments = comments.filter(comment => comment.postId === postData.id);
                console.log('Fetched comments for post:', postComments);
      
                for (let k = 0; k < 10; k++) {
                    const commentData = postComments[Math.floor(Math.random() * postComments.length)];
                    console.log('Selected comment:', commentData);
      
                    // Insert comments into the database
                    await db.query(
                        'INSERT INTO comments (post_id, name, email, body) VALUES (?, ?, ?, ?)',
                        [postId, commentData.name, commentData.email, commentData.body]
                    );
                    console.log(`Comment created for Post ID ${postId}`);
                }
            }
        }
    } catch (error) {
        console.error('Error while creating Autobots, posts, and comments:', error);
    }
});

job.start();

// API ENDPOINTS
app.get('/autobots', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query('SELECT * FROM autobots LIMIT ?', [limit]);
    res.json(rows);
});

app.get('/autobots/:id/posts', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10
    const [rows] = await db.query('SELECT * FROM posts WHERE autobot_id = ? LIMIT ?', [req.params.id, limit]);
    res.json(rows);
});

app.get('/posts/:id/comments', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query('SELECT * FROM comments WHERE post_id = ? LIMIT ?', [req.params.id, limit]);
    res.json(rows);
});

app.get('/autobot-count', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT COUNT(*) AS count FROM autobots');
      res.json({ count: rows[0].count });
    } catch (error) {
      console.error('Error fetching Autobot count:', error);
      res.status(500).json({ error: 'Failed to fetch Autobot count' });
    }
  });
  

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

