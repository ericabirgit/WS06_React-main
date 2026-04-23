import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

function PostPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/posts/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load post')
        }

        setPost(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete post')
      }

      navigate('/blog')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <p className="status-msg">Loading…</p>
  if (error && !post) return <p className="status-msg error">{error}</p>
  if (!post) return <p className="status-msg">Post not found.</p>

  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('fi-FI', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Date missing'

  return (
    <article className="post-detail">
      <div className="post-detail-meta">
        <span className="author">{post.author}</span>
        <time>{date}</time>
      </div>

      <h1 className="post-detail-title">{post.title}</h1>

      <p className="post-detail-content">{post.content}</p>

      <div className="post-detail-actions">
        <Link to={`/posts/${id}/edit`} className="btn btn-secondary">
          Edit
        </Link>
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </article>
  )
}

export default PostPage
