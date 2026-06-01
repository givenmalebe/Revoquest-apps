# API Setup Instructions

To enable real AI course generation instead of mock data, you need to set up API keys.

## Required API Keys

### 1. Gemini API Key (Required for AI Course Generation)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. YouTube API Key (Optional, for Video Content)
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Copy the generated API key

## Setup Instructions

1. Create a `.env` file in the project root directory
2. Add your API keys:

```env
# AI Course Builder API Keys
VITE_GEMINI_API_KEY=your-actual-gemini-api-key-here
VITE_YOUTUBE_API_KEY=your-actual-youtube-api-key-here
```

3. Replace the placeholder values with your actual API keys
4. Restart the development server

## Current Status

- **Without API Keys**: The system uses mock data for demonstration
- **With API Keys**: The system generates real AI content using Gemini API

## Features

### With Gemini API Key:
- ✅ Real AI-generated course content
- ✅ Intelligent lesson planning
- ✅ Topic-specific content generation
- ✅ 5-paragraph reading materials
- ✅ Comprehensive learning outcomes

### With YouTube API Key (in addition to Gemini):
- ✅ Real YouTube video suggestions
- ✅ Relevant video content for lessons
- ✅ Automatic video embedding

## Troubleshooting

- Make sure your `.env` file is in the project root
- Restart the development server after adding API keys
- Check the browser console for API key validation messages
- Ensure API keys are valid and have proper permissions
