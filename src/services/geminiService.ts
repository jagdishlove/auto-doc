import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedDoc, AstAnalysisResult } from "../types";

const initGemini = () => {
  const apiKey = process.env.API_KEY;
  // We allow initialization even with a dummy key to prevent immediate crashes,
  // but we catch the API error later.
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });
};

const getMockResponse = (fileName: string, astData: AstAnalysisResult, errorMode = false): GeneratedDoc => {
  return {
    fileName,
    overview: errorMode 
      ? "⚠️ SIMULATED RESPONSE: The Gemini API Key was invalid or missing. This is a placeholder analysis." 
      : "This is a simulated documentation response.",
    endpoints: [
      {
        method: "GET",
        path: "/api/simulated/endpoint",
        summary: "This endpoint is a placeholder because real AI generation failed.",
        parameters: [
          { name: "id", type: "string", required: true, description: "Simulation ID" }
        ],
        response: { type: "Object", description: "Mock data response" }
      },
      ...astData.routesFound.map(r => ({
          method: r.method,
          path: r.path,
          summary: "Auto-detected by AST",
          parameters: [],
          response: { type: "Unknown", description: "Pending analysis" }
      }))
    ],
    astMetrics: {
      functionsFound: astData.functions.length,
      classesFound: astData.classes.length,
      importsFound: astData.imports.length
    },
    isMock: true
  };
};

export const generateApiDocs = async (
  code: string,
  fileName: string,
  astData: AstAnalysisResult
): Promise<GeneratedDoc> => {
  
  const apiKey = process.env.API_KEY;

  // 1. Fail-fast if key is obviously missing or invalid (heuristic check)
  if (!apiKey || apiKey === 'dummy-key-to-prevent-crash' || !apiKey.startsWith('AIza')) {
    console.warn("Invalid or missing API_KEY. Falling back to Mock Mode.");
    await new Promise(r => setTimeout(r, 1500));
    return getMockResponse(fileName, astData, true);
  }

  const ai = initGemini();
  const model = "gemini-2.5-flash";

  // Format AST routes for the prompt
  const detectedRoutesStr = astData.routesFound.length > 0 
    ? `IMPORTANT HINT: The AST analysis found the following definite endpoints in the code: ${JSON.stringify(astData.routesFound)}. Ensure these are documented.` 
    : "AST found no explicit route definitions (like app.get/router.post). Look for implicit ones or class-based controllers.";

  const systemPrompt = `
    You are an expert API Documentation Generator. 
    You are provided with source code and pre-analyzed AST metadata.
    
    Your task is to:
    1. Analyze the code deeply to understand what the public API surface is.
    2. Extract HTTP endpoints (method, path) if it is a backend file.
    3. Document parameters (query, body, params) and response types.
    4. If it's a utility library, document the public functions.
    5. Be concise but professional.
    
    ${detectedRoutesStr}
  `;

  const userPrompt = `
    File Name: ${fileName}
    AST Metadata: 
      - Functions: [${astData.functions.join(', ')}]
      - Classes: [${astData.classes.join(', ')}]
      - Imports: ${astData.imports.length} found
    
    Source Code:
    \`\`\`
    ${code.slice(0, 30000)} 
    \`\`\`
    (Code truncated if too long)
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + "\n" + userPrompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fileName: { type: Type.STRING },
            overview: { type: Type.STRING },
            endpoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  method: { type: Type.STRING },
                  path: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  parameters: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING },
                        required: { type: Type.BOOLEAN },
                        description: { type: Type.STRING },
                      }
                    }
                  },
                  response: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      description: { type: Type.STRING },
                    }
                  }
                }
              }
            },
            astMetrics: {
              type: Type.OBJECT,
              properties: {
                functionsFound: { type: Type.INTEGER },
                classesFound: { type: Type.INTEGER },
                importsFound: { type: Type.INTEGER },
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text) as GeneratedDoc;

  } catch (error) {
    console.error("Gemini API Failed:", error);
    
    const errString = String(error);
    if (errString.includes("400") || errString.includes("API key not valid") || errString.includes("API_KEY_INVALID")) {
      console.warn("Caught Invalid API Key error. Switching to mock.");
      return getMockResponse(fileName, astData, true);
    }
    
    throw error;
  }
};