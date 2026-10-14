import React, { useState } from 'react';
import './uplodeblog.css'; // Import the CSS file

const BlogUpload = () => {
  const [title, setTitle] = useState('');
  const [heading, setHeading] = useState('');
  const [categories, setCategories] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to handle file upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Function to handle form submission (for saving draft or posting)
  const handleSubmit = async (e, action) => {
    e.preventDefault();
    
    if (!title || !heading || !categories || !blogContent) {
      alert('Please fill all required fields!');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('heading', heading);
    formData.append('categories', categories);
    formData.append('blogContent', blogContent);
    formData.append('file', file);

    try {
      // Example API request to backend (replace with your actual API)
      const response = await fetch('/api/blogs', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${action === 'post' ? 'Blog posted' : 'Draft saved'} successfully!`);
        resetForm(); // Reset the form after successful submission
      } else {
        throw new Error('Failed to submit the form');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to reset form fields after submission
  const resetForm = () => {
    setTitle('');
    setHeading('');
    setCategories('');
    setBlogContent('');
    setFile(null);
  };

  return (
    <div className="blog-upload-container">
      <form onSubmit={(e) => handleSubmit(e, 'post')}>
        <div className="file-upload">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            id="fileInput"
          />
          <label htmlFor="fileInput">
            Drag & drop or <span>Choose file</span> to upload
          </label>
        </div>

        <div className="input-container">
          <label>Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Enter title" 
          />
        </div>

        <div className="input-container">
          <label>Heading</label>
          <input 
            type="text" 
            value={heading} 
            onChange={(e) => setHeading(e.target.value)} 
            placeholder="Enter heading" 
          />
        </div>

        <div className="input-container">
          <label>Categories</label>
          <select 
            value={categories} 
            onChange={(e) => setCategories(e.target.value)}>
            <option value="">Select category</option>
            <option value="tech">Tech</option>
            <option value="health">Health</option>
            <option value="lifestyle">Lifestyle</option>
          </select>
        </div>

        <div className="input-container">
          <label>Create your blogs</label>
          <textarea 
            value={blogContent} 
            onChange={(e) => setBlogContent(e.target.value)} 
            placeholder="Write your blog here..." 
          />
        </div>

        <div className="button-container">
          <button 
            type="button" 
            className="save-draft-btn" 
            onClick={(e) => handleSubmit(e, 'draft')} 
            disabled={loading}>
            {loading ? 'Saving...' : 'Save draft'}
          </button>
          <button 
            type="submit" 
            className="post-btn" 
            disabled={loading}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogUpload;
