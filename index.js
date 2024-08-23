const express = require('express');
const cors = require('cors');
const { createPool } = require('mysql2/promise');
const { get } = require('axios');
const { CronJob } = require('cron');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require ('swagger-ui-express');




const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 2020;

const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'TweetAI API',
        version: '1.0.0',
        description: 'API documentation for the TweetAI project'
      },
      servers: [
        {
        url: 'https://tweetai-backend.vercel.app/',
        description: 'Production server'
        //   url: `http://localhost:${port}`,
        //   description: 'Local server'
        }
      ]
    },
    apis: ['./api/index.js'] 
  };
  
  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  



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

// Scheduled background task to create Autobots, Posts, and Comments every hour
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
/**
 * @swagger
 * components:
 *   schemas:
 *     Autobot:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the Autobot.
 *         name:
 *           type: string
 *           description: The name of the Autobot.
 *         username:
 *           type: string
 *           description: The username of the Autobot.
 *         email:
 *           type: string
 *           description: The email of the Autobot.
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the Post.
 *         autobot_id:
 *           type: integer
 *           description: The ID of the Autobot that created the Post.
 *         title:
 *           type: string
 *           description: The title of the Post.
 *         body:
 *           type: string
 *           description: The body of the Post.
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the Comment.
 *         post_id:
 *           type: integer
 *           description: The ID of the Post the Comment belongs to.
 *         name:
 *           type: string
 *           description: The name of the person who made the Comment.
 *         email:
 *           type: string
 *           description: The email of the person who made the Comment.
 *         body:
 *           type: string
 *           description: The body of the Comment.
 * 
 * /autobots:
 *   get:
 *     summary: Retrieve a list of Autobots
 *     responses:
 *       200:
 *         description: A list of Autobots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Autobot'
 * 
 * /autobots/{id}/posts:
 *   get:
 *     summary: Retrieve a list of Posts for a specific Autobot
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the Autobot
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Number of posts to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of Posts for the specified Autobot
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 * 
 * /posts/{id}/comments:
 *   get:
 *     summary: Retrieve a list of Comments for a specific Post
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the Post
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Number of comments to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of Comments for the specified Post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 * 
 * /autobot-count:
 *   get:
 *     summary: Retrieve the count of Autobots
 *     responses:
 *       200:
 *         description: The count of Autobots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: The total count of Autobots
 * 
 *     500:
 *       description: Internal server error
 */

app.get('/', (req, res) => {
    res.send('Hello from the API!');
});

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
  
  module.exports = app;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

