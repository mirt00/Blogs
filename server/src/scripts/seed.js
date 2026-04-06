import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import Category from '../models/Category.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/itblog';

const categories = [
  { name: 'DevOps', slug: 'devops', desc: 'Container orchestration, CI/CD, and infrastructure', color: '#3b82f6' },
  { name: 'Backend', slug: 'backend', desc: 'Server-side development and APIs', color: '#10b981' },
  { name: 'Frontend', slug: 'frontend', desc: 'UI/UX, frameworks, and web technologies', color: '#f59e0b' },
  { name: 'Security', slug: 'security', desc: 'Application security and best practices', color: '#ef4444' },
];

const samplePosts = [
  {
    title: 'Understanding Docker Networking: A Deep Dive into CNI Plugins',
    excerpt: 'Explore how Docker handles networking and the role of Container Network Interface (CNI) plugins in orchestrating complex network topologies.',
    content: `# Understanding Docker Networking

Docker networking is a fundamental concept that every developer and DevOps engineer should master. In this article, we'll explore the internals of Docker's networking stack.

## The CNI Specification

The Container Network Interface (CNI) is a specification and library for configuring network interfaces in Linux containers. It was originally developed by CoreOS and is now maintained by the CNCF.

\`\`\`json
{
  "cniVersion": "0.4.0",
  "name": "mynet",
  "type": "bridge",
  "bridge": "cnibr0",
  "isGateway": true,
  "ipMasq": true,
  "ipam": {
    "type": "host-local",
    "subnet": "10.22.30.0/24"
  }
}
\`\`\`

## Key Concepts

### Network Namespaces
Each container gets its own network namespace, providing isolation from the host and other containers.

### Veth Pairs
Virtual Ethernet pairs connect the container's namespace to the host's bridge.

## Conclusion

Understanding these concepts helps when debugging network issues in containerized environments.`,
    tags: ['docker', 'networking', 'cni', 'containers'],
    status: 'published',
    isFeatured: true,
    metaTitle: 'Docker Networking Deep Dive - CNI Plugins Explained',
    metaDesc: 'Learn how Docker handles networking with CNI plugins. Deep dive into network namespaces and veth pairs.',
  },
  {
    title: 'Building REST APIs with Node.js and Express',
    excerpt: 'A comprehensive guide to creating production-ready REST APIs using Node.js, Express, and modern best practices.',
    content: `# Building REST APIs with Node.js

REST APIs are the backbone of modern web applications. This guide covers everything you need to build robust APIs.

## Project Setup

\`\`\`javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
\`\`\`

## Route Handling

Express makes it easy to define routes and handle HTTP methods:

\`\`\`javascript
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

app.post('/api/posts', async (req, res) => {
  const post = await Post.create(req.body);
  res.status(201).json(post);
});
\`\`\`

## Error Handling

Always implement proper error handling:

\`\`\`javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
\`\`\`

## Best Practices

1. Use proper status codes
2. Validate input data
3. Implement rate limiting
4. Add pagination to list endpoints`,
    tags: ['nodejs', 'express', 'api', 'javascript'],
    status: 'published',
    isFeatured: true,
    metaTitle: 'Build REST APIs with Node.js and Express',
    metaDesc: 'Complete guide to building REST APIs with Node.js, Express, validation, and error handling.',
  },
  {
    title: 'React Server Components: The Future of Frontend Development',
    excerpt: 'Explore how React Server Components are changing the way we think about building modern web applications.',
    content: `# React Server Components

Server Components represent a paradigm shift in how we build React applications. They allow components to render on the server, reducing client-side JavaScript.

## Benefits

- **Reduced Bundle Size**: Less JavaScript shipped to the client
- **Direct Database Access**: Query databases directly from components
- **Improved SEO**: Content is rendered server-side

## Example

\`\`\`jsx
// ServerComponent.jsx (runs on server)
async function PostList() {
  const posts = await db.posts.findMany();
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
\`\`\`

## When to Use Server vs Client Components

| Use Case | Component Type |
|----------|---------------|
| Data fetching | Server |
| Interactive UI | Client |
| Database access | Server |
| Event handlers | Client |`,
    tags: ['react', 'frontend', 'rsc', 'javascript'],
    status: 'published',
    isFeatured: false,
  },
  {
    title: 'Implementing Zero-Trust Security in Microservices',
    excerpt: 'Learn how to implement a zero-trust security model in your microservices architecture.',
    content: `# Zero-Trust Security

Zero-trust is a security model that assumes no implicit trust, even within your network perimeter.

## Core Principles

1. **Never Trust, Always Verify**
2. **Least Privilege Access**
3. **Assume Breach Mentality**

## Implementation

### Service Mesh

A service mesh like Istio provides mutual TLS between services:

\`\`\`yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
spec:
  mtls:
    mode: STRICT
\`\`\`

### JWT Validation

Every request should validate tokens:

\`\`\`javascript
import jwt from 'jsonwebtoken';

function validateToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['RS256'],
  });
}
\`\`\`

## Conclusion

Zero-trust requires a cultural shift but significantly improves your security posture.`,
    tags: ['security', 'microservices', 'zero-trust'],
    status: 'published',
    isFeatured: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Post.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing data');

    const savedCategories = await Category.insertMany(categories);
    console.log(`Created ${savedCategories.length} categories`);

    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      email: 'admin@itblog.dev',
      username: 'admin',
      displayName: 'Admin User',
      passwordHash: adminPassword,
      role: 'admin',
      bio: 'Tech enthusiast and full-stack developer',
    });

    const readerPassword = await bcrypt.hash('reader123', 12);
    const reader = await User.create({
      email: 'reader@example.com',
      username: 'techreader',
      displayName: 'Tech Reader',
      passwordHash: readerPassword,
      role: 'reader',
    });

    console.log(`Created users: admin and techreader`);

    const postsWithRefs = samplePosts.map((post, index) => ({
      ...post,
      author: admin._id,
      categories: [savedCategories[index % savedCategories.length]._id],
      publishedAt: new Date(Date.now() - (index * 86400000)),
    }));

    const savedPosts = await Post.insertMany(postsWithRefs);
    console.log(`Created ${savedPosts.length} posts`);

    console.log('\n=== Seed Complete ===');
    console.log('Admin: admin@itblog.dev / admin123');
    console.log('Reader: reader@example.com / reader123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
