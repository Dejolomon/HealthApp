# AI Features Setup Guide

This health app now includes AI-powered features to enhance your health tracking experience. Follow these steps to enable AI functionality.

## Features

1. **AI Meal Recommendations** - Get personalized meal suggestions based on your goals and remaining calories
2. **AI Health Insights** - Receive intelligent analysis of your health data with actionable recommendations
3. **AI Workout Generator** - Create personalized workout plans tailored to your preferences
4. **AI Health Assistant** - Chat with an AI assistant for health and wellness questions

## Setup Instructions

### 1. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (you'll need it in the next step)

### 2. Configure the API Key

#### Option A: Environment Variable (Recommended)

Create a `.env` file in the root of your project:

```env
EXPO_PUBLIC_OPENAI_API_KEY=your-api-key-here
```

Then install `expo-constants` if not already installed (it should be in your dependencies).

#### Option B: Direct Configuration

Edit `utils/ai-service.ts` and replace the empty string with your API key:

```typescript
const AI_API_KEY = 'your-api-key-here';
```

**⚠️ Warning:** Never commit your API key to version control. Use environment variables or secure storage.

### 3. Install Dependencies

The AI features use the built-in `fetch` API, so no additional packages are required. However, make sure you have:

- `expo` (already installed)
- `react-native` (already installed)

### 4. Test the Features

1. **AI Meal Recommendations:**
   - Go to the "Plan" tab
   - Click the "🤖 AI Suggestions" button
   - Wait for AI recommendations to appear

2. **AI Health Insights:**
   - Go to the "Insights" tab
   - AI insights will automatically load
   - Click "🔄 Refresh AI" to get updated insights

3. **AI Workout Generator:**
   - Go to the "Resources" tab
   - Click "🤖 AI Workout"
   - Fill in your preferences and generate a workout plan

4. **AI Health Assistant:**
   - Go to the "Resources" tab
   - Click "💬 AI Assistant"
   - Start chatting with the AI assistant

## Cost Considerations

The AI features use OpenAI's API, which has usage-based pricing:

- **Model Used:** `gpt-4o-mini` (cost-effective option)
- **Approximate Cost:** ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **Typical Usage:** 
  - Meal recommendations: ~500-1000 tokens per request
  - Health insights: ~800-1500 tokens per request
  - Workout plan: ~600-1200 tokens per request
  - Chat messages: ~200-500 tokens per message

**Estimated cost:** Less than $0.01 per typical interaction

## Troubleshooting

### "AI Not Configured" Error

- Make sure you've set the `EXPO_PUBLIC_OPENAI_API_KEY` environment variable
- Restart your Expo development server after setting the environment variable
- Check that the API key is valid and has credits in your OpenAI account

### API Errors

- Check your OpenAI account balance
- Verify your API key has the necessary permissions
- Check your internet connection
- Review the console logs for detailed error messages

### Fallback Behavior

If AI is not configured or fails, the app will:
- Show fallback meal recommendations (pre-defined meals)
- Display basic health insights (rule-based)
- Provide default workout plans
- Show a helpful error message in the chat

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for API keys
3. **Rotate API keys** regularly
4. **Monitor API usage** in your OpenAI dashboard
5. **Set usage limits** in OpenAI to prevent unexpected charges

## Alternative AI Providers

To use a different AI provider (e.g., Anthropic Claude, Google Gemini), modify `utils/ai-service.ts`:

1. Update the `AI_API_URL` constant
2. Adjust the request format in the `callAI` function
3. Update headers and authentication as needed

## Support

For issues or questions:
- Check the OpenAI API documentation: https://platform.openai.com/docs
- Review the app's console logs for detailed error messages
- Ensure your API key has sufficient credits

