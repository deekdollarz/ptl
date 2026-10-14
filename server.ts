import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to safely get initialized GoogleGenAI client with secrets validation
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'undefined' || apiKey === 'null') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint (safe: verifies secrets presence without exposing values)
app.get('/api/health', (_req, res) => {
  const client = getGeminiClient();
  res.json({
    status: 'healthy',
    geminiConfigured: Boolean(client),
  });
});

// Chat API endpoint supporting multi-turn and model routing
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured. You can see your app's attached API key in the Settings > Secrets panel.",
      });
    }

    const { messages, model = 'gemini-3.8-flash', systemInstruction, timelineContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const validModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-3.1-pro-preview'];
    const primaryModel = validModels.includes(model) ? model : 'gemini-3.8-flash';

    let sysInstruction = systemInstruction || 
      'You are Phone Timeline AI, an intelligent personal digital well-being assistant and timeline analyst. You help the user understand their phone usage, analyze texts, track scroll sessions, identify doomscrolling vs productive habits, and answer questions about their phone activities.';

    if (timelineContext) {
      sysInstruction += `\n\nCURRENT TIMELINE DATA & CONTEXT:\n${timelineContext}\n\nUse this data to give exact, accurate insights, timestamps, scroll durations, and statistics.`;
    }

    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    // Try primary model, with fallback models if 503 or transient overload happens
    const modelsToTry = [primaryModel, 'gemini-3.8-flash', 'gemini-3.1-flash-lite'].filter(
      (m, idx, arr) => arr.indexOf(m) === idx
    );

    let lastError = null;
    let reply = '';
    let usedModel = primaryModel;

    for (const currentModel of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents,
          config: {
            systemInstruction: sysInstruction,
            temperature: 0.7,
          },
        });
        reply = response.text || '';
        usedModel = currentModel;
        if (reply) break;
      } catch (err: any) {
        console.warn(`Model ${currentModel} encountered error, trying next fallback:`, err?.message || err);
        lastError = err;
      }
    }

    if (!reply && lastError) {
      throw lastError;
    }

    return res.json({ reply: reply || 'I analyzed your timeline, but could not produce a response.', modelUsed: usedModel });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate response from Gemini API',
    });
  }
});

// High-quality image generation using gemini-3-pro-image with 1K, 2K, 4K size options
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured. You can see your app's attached API key in the Settings > Secrets panel.",
      });
    }

    const { prompt, imageSize = '1K', aspectRatio = '1:1' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Supported sizes: 1K, 2K, 4K
    const validSizes = ['1K', '2K', '4K'];
    const chosenSize = validSizes.includes(imageSize) ? imageSize : '1K';

    const validAspectRatios = ['1:1', '9:16', '16:9', '4:3', '3:4', '1:4', '1:8', '4:1', '8:1'];
    const chosenAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    // Attempt high quality image models
    const imageModels = ['gemini-3-pro-image', 'gemini-nano-banana-2.1', 'gemini-3.1-flash-lite-image'];

    let imageUrl = '';
    let description = '';
    let lastError = null;

    for (const imgModel of imageModels) {
      try {
        const response = await ai.models.generateContent({
          model: imgModel,
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              imageSize: chosenSize,
              aspectRatio: chosenAspectRatio,
            },
          },
        });

        const candidates = response.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            } else if (part.text) {
              description += part.text;
            }
          }
        }

        if (imageUrl) break;
      } catch (err: any) {
        console.warn(`Image model ${imgModel} error:`, err?.message || err);
        lastError = err;
      }
    }

    if (!imageUrl) {
      if (lastError) throw lastError;
      return res.status(500).json({
        error: 'No image data returned from model.',
        textResponse: description,
      });
    }

    return res.json({
      imageUrl,
      imageSize: chosenSize,
      aspectRatio: chosenAspectRatio,
      description,
    });
  } catch (error: any) {
    console.error('Image Generation API Error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate image',
    });
  }
});

// Setup Vite middleware in dev or serve dist in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Phone Timeline server running on port ${port}`);
  });
}

startServer();
