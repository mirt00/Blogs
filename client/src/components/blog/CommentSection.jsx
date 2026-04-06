import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComments, useCreateComment } from '../../hooks/useComments';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { formatRelativeDate } from '../../utils/formatDate';

function CommentItem({ comment, postSlug, onDelete, onReply, depth = 0 }) {
  const { user } = useAuthStore();

  return (
    <div className={`${depth > 0 ? 'ml-8 pl-4 border-l-2 border-bg-border' : ''}`}>
      <div className="py-4">
        <div className="flex items-start gap-3">
          <Avatar src={comment.author?.avatar} name={comment.author?.displayName} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-txt-primary text-sm">
                {comment.author?.displayName || 'Anonymous'}
              </span>
              <span className="text-xs text-txt-muted">
                {formatRelativeDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-txt-secondary text-sm whitespace-pre-wrap break-words">
              {comment.content}
            </p>
            <div className="flex items-center gap-4 mt-2">
              {user && depth < 3 && (
                <button
                  onClick={() => onReply(comment)}
                  className="text-xs text-txt-muted hover:text-accent transition-colors"
                >
                  Reply
                </button>
              )}
              {(user?.id === comment.author?._id || user?.role === 'admin') && (
                <button
                  onClick={() => onDelete(comment._id)}
                  className="text-xs text-txt-muted hover:text-status-danger transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply._id}
          comment={reply}
          postSlug={postSlug}
          onDelete={onDelete}
          onReply={onReply}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function CommentSection({ postSlug }) {
  const { data: comments, isLoading } = useComments(postSlug);
  const { user } = useAuthStore();
  const createComment = useCreateComment();
  const [newComment, setNewComment] = useState('');
  const [parentId, setParentId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({
        slug: postSlug,
        content: newComment,
        parentId,
      });
      setNewComment('');
      setParentId(null);
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setParentId(comment._id);
    document.getElementById('comment-input')?.focus();
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    const { useDeleteComment } = await import('../../hooks/useComments');
  };

  const cancelReply = () => {
    setParentId(null);
    setReplyingTo(null);
  };

  if (!user) {
    return (
      <div className="card p-6 text-center">
        <p className="text-txt-secondary mb-4">
          Sign in to join the discussion
        </p>
        <Link to="/login" className="btn-primary inline-block">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-semibold text-txt-primary">
        Comments {comments?.length > 0 && `(${comments.length})`}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {replyingTo && (
          <div className="flex items-center gap-2 text-sm text-txt-muted">
            <span>Replying to {replyingTo.author?.displayName}</span>
            <button type="button" onClick={cancelReply} className="text-accent hover:underline">
              Cancel
            </button>
          </div>
        )}
        <textarea
          id="comment-input"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="input min-h-[100px] resize-y"
          maxLength={2000}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-txt-muted">
            {newComment.length}/2000
          </span>
          <Button type="submit" disabled={createComment.isPending || !newComment.trim()}>
            {createComment.isPending ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-4 bg-bg-hover rounded w-1/4" />
              <div className="h-20 bg-bg-hover rounded" />
            </div>
          ))}
        </div>
      ) : comments?.length > 0 ? (
        <div className="divide-y divide-bg-border">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postSlug={postSlug}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-txt-muted py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
}
