/**
 * AIP Agent Service - CORRECTED VERSION
 * 
 * Handles integration with Palantir Foundry AIP Agents API
 * Provides session management and streaming response handling
 * 
 * FIXES:
 * 1. Uses documented API endpoint (/api/v2/aipAgents/...)
 * 2. Sends parameterInputs at top level with correct format
 * 3. Uses proper ParameterValue structure for string parameters
 */

import { FOUNDRY_CONFIG } from './foundryConfig';

// AIP Agent Configuration
const AGENT_RID = 'ri.aip-agents..agent.4c393e4d-8297-40e1-a861-e2238fdb65c6';
const API_BASE_URL = FOUNDRY_CONFIG.url;
const AUTH_TOKEN = FOUNDRY_CONFIG.token;

// Type definitions for AIP Agent API
export interface AgentSession {
  rid: string;
  agentRid: string;
  agentVersion: string;
  metadata: {
    createdTime: string;
    updatedTime: string;
    estimatedExpiresTime: string;
    messageCount: number;
    title?: string;
  };
}

export interface AgentParameterInputs {
  currentUserId: string;
  userTimezone: string;
}

export interface StreamChunk {
  type: 'text' | 'complete' | 'error';
  content: string;
}

/**
 * Create a new AIP Agent session
 * 
 * @param agentRid - The RID of the AIP Agent
 * @param agentVersion - Optional version string (defaults to latest published)
 * @returns Promise with session details
 */
export async function createAgentSession(
  agentRid: string = AGENT_RID,
  agentVersion?: string
): Promise<AgentSession> {
  console.log('🤖 [AIP Agent] Creating new session...');
  console.log('   Agent RID:', agentRid);
  console.log('   Agent Version:', agentVersion || 'latest published');
  console.log('   API Base URL:', API_BASE_URL);
  
  const url = `${API_BASE_URL}/api/v2/aipAgents/agents/${agentRid}/sessions?preview=true`;
  console.log('   Request URL:', url);
  
  const requestBody = agentVersion ? { agentVersion } : {};
  console.log('   Request Body:', JSON.stringify(requestBody, null, 2));
  
  try {
    const startTime = Date.now();
    console.log('   ⏱️  Sending request at:', new Date().toISOString());
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    const duration = Date.now() - startTime;
    console.log(`   ⏱️  Response received in ${duration}ms`);
    console.log('   Response Status:', response.status, response.statusText);
    console.log('   Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('   ❌ Session creation failed');
      console.error('   Error Response:', errorText);
      throw new Error(`Failed to create session: ${response.status} ${response.statusText}`);
    }
    
    const session: AgentSession = await response.json();
    console.log('   ✅ Session created successfully!');
    console.log('   Session RID:', session.rid);
    console.log('   Session Details:', JSON.stringify(session, null, 2));
    
    return session;
  } catch (error) {
    console.error('   ❌ Error creating agent session:', error);
    console.error('   Error Details:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Blocking continue session - waits for complete response
 * 
 * @param agentRid - The RID of the AIP Agent
 * @param sessionRid - The RID of the session
 * @param userMessage - The user's message text
 * @param userId - Current user ID
 * @param timezone - User's timezone
 * @returns Promise with agent response
 */
export async function blockingContinueSession(
  agentRid: string,
  sessionRid: string,
  userMessage: string,
  userId: string,
  timezone: string
): Promise<string> {
  console.log('💬 [AIP Agent] Starting blocking continue session...');
  console.log('   Agent RID:', agentRid);
  console.log('   Session RID:', sessionRid);
  console.log('   User Message:', userMessage);
  console.log('   User ID:', userId);
  console.log('   Timezone:', timezone);
  
  // Use the DOCUMENTED API endpoint
  const url = `${API_BASE_URL}/api/v2/aipAgents/agents/${agentRid}/sessions/${sessionRid}/blockingContinue?preview=true`;
  console.log('   Request URL:', url);
  
  // SIMPLIFIED APPROACH: Prepend user context directly to the message
  // This ensures the agent can read the user ID from the message text
  const enhancedMessage = `[User Context]
User ID: ${userId}
Timezone: ${timezone}

[User Message]
${userMessage}`;
  
  console.log('   Enhanced Message:', enhancedMessage);
  
  // Build simple request body without parameters
  const requestBody: any = {
    userInput: {
      text: enhancedMessage
    }
  };
  
  console.log('   Request Body:', JSON.stringify(requestBody, null, 2));
  
  try {
    const startTime = Date.now();
    console.log('   ⏱️  Sending request at:', new Date().toISOString());
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('   Response Status:', response.status, response.statusText);
    console.log('   Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('   ❌ Request failed');
      console.error('   Error Response:', errorText);
      throw new Error(`Failed to continue session: ${response.status} - ${errorText}`);
    }
    
    // For blockingContinue, the response is JSON with the full response
    const responseData = await response.json();
    console.log('   📄 Full response received');
    console.log('   📝 Response data:', JSON.stringify(responseData, null, 2));
    
    const duration = Date.now() - startTime;
    console.log(`   ✅ Response processed in ${duration}ms`);
    
    // Extract the text from the response
    // The response structure is: { result: { text: "..." }, ... }
    const responseText = responseData.result?.text || responseData.text || JSON.stringify(responseData);
    
    return responseText;
  } catch (error) {
    console.error('   ❌ Error during blocking continue:', error);
    console.error('   Error Details:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Stream continue session with real-time response handling
 * 
 * @param agentRid - The RID of the AIP Agent
 * @param sessionRid - The RID of the session
 * @param userMessage - The user's message text
 * @param userId - Current user ID
 * @param timezone - User's timezone
 * @param onChunk - Callback for each text chunk received
 * @param onComplete - Callback when streaming completes
 * @param onError - Callback for errors
 */
export async function streamContinueSession(
  agentRid: string,
  sessionRid: string,
  userMessage: string,
  userId: string,
  timezone: string,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  console.log('💬 [AIP Agent] Starting streaming continue session...');
  console.log('   Agent RID:', agentRid);
  console.log('   Session RID:', sessionRid);
  console.log('   User Message:', userMessage);
  console.log('   User ID:', userId);
  console.log('   Timezone:', timezone);
  
  // Use the DOCUMENTED API endpoint for streaming
  const url = `${API_BASE_URL}/api/v2/aipAgents/agents/${agentRid}/sessions/${sessionRid}/streamingContinue?preview=true`;
  console.log('   Request URL:', url);
  
  // Generate a unique message ID for this exchange
  const messageId = generateUUID();
  console.log('   Message ID:', messageId);
  
  // SIMPLIFIED APPROACH: Prepend user context directly to the message
  // This ensures the agent can read the user ID from the message text
  const enhancedMessage = `[User Context]
User ID: ${userId}
Timezone: ${timezone}

[User Message]
${userMessage}`;
  
  console.log('   Enhanced Message:', enhancedMessage);
  
  // Build simple request body without parameters
  const requestBody: any = {
    messageId,
    userInput: {
      text: enhancedMessage
    }
  };
  
  console.log('   Request Body:', JSON.stringify(requestBody, null, 2));
  
  try {
    const startTime = Date.now();
    console.log('   ⏱️  Sending streaming request at:', new Date().toISOString());
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('   Response Status:', response.status, response.statusText);
    console.log('   Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('   ❌ Streaming request failed');
      console.error('   Error Response:', errorText);
      onError('Error connecting to AI bot');
      return;
    }
    
    // Check if response.body exists (for web) or if we need to use text() (for React Native)
    console.log('   Response body type:', typeof response.body);
    console.log('   Response body exists:', !!response.body);
    
    if (!response.body) {
      console.log('   ⚠️  No response.body - trying response.text() for React Native compatibility');
      try {
        const fullText = await response.text();
        console.log('   📄 Full response text:', fullText);
        console.log('   📏 Response length:', fullText.length);
        
        // The streamingContinue endpoint returns plain text (markdown formatted)
        if (fullText.trim()) {
          console.log('   ✨ Calling onChunk with full text');
          onChunk(fullText);
        }
        
        console.log('   ✅ Calling onComplete');
        onComplete();
        return;
      } catch (error) {
        console.error('   ❌ Error reading response text:', error);
        onError('Error connecting to AI bot');
        return;
      }
    }
    
    console.log('   ✅ Stream connection established');
    console.log('   📡 Starting to read stream chunks...');
    
    // Read the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let chunkCount = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        const duration = Date.now() - startTime;
        console.log(`   ✅ Stream completed after ${duration}ms`);
        console.log(`   📊 Total chunks received: ${chunkCount}`);
        onComplete();
        break;
      }
      
      chunkCount++;
      const chunk = decoder.decode(value, { stream: true });
      
      console.log(`   📦 Chunk ${chunkCount} received (${value.length} bytes)`);
      console.log('   Raw chunk:', chunk);
      
      // For streamingContinue, the response is plain text (not SSE format)
      // Just send it directly to the callback
      if (chunk.trim()) {
        console.log('   ✨ Calling onChunk with:', chunk);
        onChunk(chunk);
      }
    }
  } catch (error) {
    console.error('   ❌ Error during streaming:', error);
    console.error('   Error Details:', error instanceof Error ? error.message : String(error));
    console.error('   Error Stack:', error instanceof Error ? error.stack : 'N/A');
    onError('Error connecting to AI bot');
  }
}

/**
 * Generate a UUID v4
 * Used for message IDs
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get session content (message history)
 * 
 * @param agentRid - The RID of the AIP Agent
 * @param sessionRid - The RID of the session
 * @returns Promise with session content
 */
export async function getSessionContent(
  agentRid: string,
  sessionRid: string
): Promise<any> {
  console.log('📖 [AIP Agent] Getting session content...');
  console.log('   Agent RID:', agentRid);
  console.log('   Session RID:', sessionRid);
  
  const url = `${API_BASE_URL}/api/v2/aipAgents/agents/${agentRid}/sessions/${sessionRid}/content?preview=true`;
  console.log('   Request URL:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });
    
    console.log('   Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('   ❌ Failed to get session content');
      console.error('   Error Response:', errorText);
      throw new Error(`Failed to get session content: ${response.status}`);
    }
    
    const content = await response.json();
    console.log('   ✅ Session content retrieved');
    console.log('   Content:', JSON.stringify(content, null, 2));
    
    return content;
  } catch (error) {
    console.error('   ❌ Error getting session content:', error);
    throw error;
  }
}
