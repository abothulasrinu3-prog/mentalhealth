import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, Heart, Send, Shield, Eye, ThumbsUp, Reply, Flag, Search, Filter, TrendingUp, Calendar } from 'lucide-react';
import PageExperience3D from '../components/PageExperience3D';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general', anonymous: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [expandedPost, setExpandedPost] = useState(null);

  const categories = [
    { id: 'all', label: 'All Posts', color: 'bg-gray-500' },
    { id: 'anxiety', label: 'Anxiety', color: 'bg-amber-500' },
    { id: 'depression', label: 'Depression', color: 'bg-blue-500' },
    { id: 'stress', label: 'Stress Management', color: 'bg-red-500' },
    { id: 'relationships', label: 'Relationships', color: 'bg-pink-500' },
    { id: 'self-care', label: 'Self-Care', color: 'bg-green-500' },
    { id: 'recovery', label: 'Recovery', color: 'bg-purple-500' },
    { id: 'victories', label: 'Small Victories', color: 'bg-yellow-500' }
  ];

  // Generate mock community posts
  useEffect(() => {
    generateMockPosts();
  }, []);

  const generateMockPosts = () => {
    const mockPosts = [
      {
        id: 1,
        title: 'Finally managed to go outside today',
        content: 'After weeks of struggling with anxiety, I finally made it to the park. It was just for 15 minutes, but it felt like a huge achievement. The fresh air and sunshine really helped. Sometimes the smallest steps are the biggest victories.',
        category: 'anxiety',
        author: 'Anonymous User',
        avatar: '🌱',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 24,
        replies: [
          { id: 1, author: 'Anonymous', content: 'This is so inspiring! 🌟', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), likes: 5 },
          { id: 2, author: 'Anonymous', content: 'Proud of you! Every step counts.', timestamp: new Date(Date.now() - 30 * 60 * 1000), likes: 3 }
        ],
        tags: ['anxiety', 'outdoor', 'achievement'],
        isPinned: true
      },
      {
        id: 2,
        title: 'Does anyone else feel this way?',
        content: 'Sometimes I feel like I\'m wearing a mask all day, pretending everything is okay when inside I\'m struggling. It\'s exhausting to keep up the facade. Does anyone else experience this?',
        category: 'depression',
        author: 'Anonymous User',
        avatar: '🌙',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        likes: 18,
        replies: [
          { id: 1, author: 'Anonymous', content: 'You\'re not alone. I feel this every single day.', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), likes: 8 },
          { id: 2, author: 'Anonymous', content: 'Sending you a virtual hug. It\'s okay to not be okay.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), likes: 6 }
        ],
        tags: ['depression', 'mask', 'exhaustion']
      },
      {
        id: 3,
        title: 'My grounding technique that actually works',
        content: 'When I feel overwhelmed, I use the 5-4-3-2-1 method but with a twist. I take a photo of 5 things I see, touch 4 different textures, record 3 sounds, smell 2 things (safely!), and taste 1 thing. Looking back at the photos later helps me remember I can get through tough moments.',
        category: 'self-care',
        author: 'Anonymous User',
        avatar: '🌸',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        likes: 32,
        replies: [
          { id: 1, author: 'Anonymous', content: 'This is brilliant! Never thought of taking photos.', timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000), likes: 4 }
        ],
        tags: ['grounding', 'technique', 'self-care']
      },
      {
        id: 4,
        title: 'One month sober and feeling clearer',
        content: 'Today marks one month without alcohol. My anxiety has decreased significantly, and I\'m sleeping better. The first two weeks were tough, but it\'s getting easier. If you\'re considering reducing or quitting, you\'ve got this!',
        category: 'recovery',
        author: 'Anonymous User',
        avatar: '⭐',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        likes: 45,
        replies: [
          { id: 1, author: 'Anonymous', content: 'Congratulations! 🎉 One day at a time.', timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000), likes: 7 },
          { id: 2, author: 'Anonymous', content: 'This gives me hope. Thank you for sharing.', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), likes: 5 }
        ],
        tags: ['recovery', 'sober', 'milestone']
      },
      {
        id: 5,
        title: 'Therapy homework actually helped',
        content: 'My therapist asked me to write down 3 good things that happened each day, no matter how small. At first I struggled, but now I look forward to it. Today: 1) My coffee tasted perfect, 2) A stranger smiled at me, 3) I finished a book chapter. Small joys matter.',
        category: 'victories',
        author: 'Anonymous User',
        avatar: '🌻',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        likes: 28,
        replies: [
          { id: 1, author: 'Anonymous', content: 'Love this! I\'m going to try this too.', timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000), likes: 6 }
        ],
        tags: ['therapy', 'gratitude', 'progress']
      }
    ];
    setPosts(mockPosts);
    setLoading(false);
  };

  const handleCreatePost = () => {
    const post = {
      id: posts.length + 1,
      ...newPost,
      author: 'Anonymous User',
      avatar: '🌟',
      timestamp: new Date(),
      likes: 0,
      replies: [],
      tags: newPost.content.split(' ').filter(word => word.startsWith('#')).map(tag => tag.slice(1))
    };
    setPosts([post, ...posts]);
    setShowCreatePost(false);
    setNewPost({ title: '', content: '', category: 'general', anonymous: true });
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleReply = (postId, replyContent) => {
    const reply = {
      id: Date.now(),
      author: 'Anonymous',
      content: replyContent,
      timestamp: new Date(),
      likes: 0
    };
    
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, replies: [...post.replies, reply] }
        : post
    ));
  };

  const filteredPosts = posts
    .filter(post => 
      (selectedCategory === 'all' || post.category === selectedCategory) &&
      (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
       post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortBy === 'recent') return b.timestamp - a.timestamp;
      if (sortBy === 'popular') return b.likes - a.likes;
      return 0;
    });

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <PageExperience3D
          variant="community"
          eyebrow="Support circles"
          title="Community"
          description="A more welcoming 3D social space for sharing stories, support, victories, and grounded peer connection."
          metrics={['Anonymous', 'Moderated', 'Supportive']}
        />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-8 h-8 text-purple-500" />
              Anonymous Community
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Share, support, and heal together in a safe space
            </p>
          </div>
          <motion.button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="w-5 h-5" />
            Share Your Story
          </motion.button>
        </div>

        {/* Safety Notice */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">Safe Space Guidelines</h3>
              <ul className="text-sm text-purple-700 dark:text-purple-300 mt-1 space-y-1">
                <li>• Be kind and supportive to everyone</li>
                <li>• No judgment or unsolicited advice</li>
                <li>• Respect privacy - we\'re all anonymous here</li>
                <li>• Trigger warnings for sensitive content</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Create Post Form */}
        <AnimatePresence>
          {showCreatePost && (
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-lg font-semibold mb-4">Share Your Thoughts</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Give your post a title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="input-field text-lg font-semibold"
                />
                <textarea
                  placeholder="Share what\'s on your mind... Remember, you\'re anonymous here 💜"
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  rows={6}
                  className="input-field resize-none"
                />
                <div className="flex flex-wrap gap-4">
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className="input-field flex-1 min-w-[200px]"
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Posting as Anonymous</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleCreatePost}
                    disabled={!newPost.title.trim() || !newPost.content.trim()}
                    className="btn-primary disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-4 h-4" />
                    Share Post
                  </motion.button>
                  <motion.button
                    onClick={() => setShowCreatePost(false)}
                    className="btn-secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts, tags, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{posts.length}</div>
            <div className="text-sm text-gray-600">Posts Today</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{posts.reduce((sum, post) => sum + post.likes, 0)}</div>
            <div className="text-sm text-gray-600">Support Given</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{posts.reduce((sum, post) => sum + post.replies.length, 0)}</div>
            <div className="text-sm text-gray-600">Conversations</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">24/7</div>
            <div className="text-sm text-gray-600">Safe Space</div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{post.avatar}</div>
                  <div>
                    <div className="font-semibold">{post.author}</div>
                    <div className="text-sm text-gray-500">{formatTimestamp(post.timestamp)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                    categories.find(c => c.id === post.category)?.color || 'bg-gray-500'
                  }`}>
                    {categories.find(c => c.id === post.category)?.label || post.category}
                  </span>
                  {post.isPinned && (
                    <div className="text-yellow-500">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {post.content}
                </p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Reply className="w-4 h-4" />
                    <span className="text-sm">{post.replies.length}</span>
                  </motion.button>
                  <motion.button
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Flag className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Replies */}
              <AnimatePresence>
                {expandedPost === post.id && (
                  <motion.div 
                    className="mt-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {/* Reply Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Share your support..."
                        className="input-field flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            handleReply(post.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <motion.button
                        onClick={(e) => {
                          const input = e.target.parentElement.querySelector('input');
                          if (input.value.trim()) {
                            handleReply(post.id, input.value);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Reply
                      </motion.button>
                    </div>

                    {/* Existing Replies */}
                    {post.replies.map(reply => (
                      <motion.div
                        key={reply.id}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{reply.author}</span>
                          <span className="text-xs text-gray-500">{formatTimestamp(reply.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No posts found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or be the first to share in this category!
            </p>
          </div>
        )}

        {/* Community Guidelines Reminder */}
        <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remember: You are not alone. We're here to support each other. 💜
          </p>
          <p className="text-xs text-gray-500 mt-2">
            If you're in crisis, please reach out to emergency services or our Emergency page.
          </p>
        </div>
    </div>
  );
};

export default Community;
