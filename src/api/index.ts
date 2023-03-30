import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post } from '@/utils/request'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

export async function fetchChatAPIProcess<T = any>(
    params: {
      prompt: string
      options?: { conversationId?: string; parentMessageId?: string }
      signal?: AbortSignal
      onDownloadProgress?: (progressEvent: ProgressEvent) => void
      model: string
      stream: boolean
      messages:any[]
      myProp: any[]
    }
) {

  const base = {
    baseUrl: import.meta.env.VITE_GLOB_OPENAI_API_URL, apiKey: import.meta.env.VITE_GLOB_OPENAI_API_KEY,
    model: import.meta.env.VITE_GLOB_API_MODEL
  }
  params.stream = true;

  const response = await fetch(
      `${base.baseUrl}/v1/chat/completions`, {
        method: "POST",
        body: JSON.stringify({
          max_tokens: 1000,
          model: base.model,
          temperature:0.8,
          top_p: 1,
          presence_penalty: 1,
          messages: params.myProp,
          stream: params.stream
        }),
        headers: {
          Authorization: 'Bearer ' + base.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: params.signal,
      }
  )

  if (params.onDownloadProgress) {

    const reader = response.body.getReader()
    console.log(reader)

    const readStream = async (reader) => {
      let partialData = '';
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }

        partialData += new TextDecoder("utf-8").decode(value);
        const lines = partialData.split('data: ');

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          console.log(line)
          if (line === "[DONE]") {
            return;
          } else if (line !== "") {

            // 将解析后的JSON对象赋值给data变量
            const data = JSON.parse(line);

            // 检查 data.choices[0].delta 是否存在，以及 content 字段是否存在
            if (data.choices[0].delta && data.choices[0].delta.hasOwnProperty('content')) {
              const content = data.choices[0].delta.content || '';
              if (content) {
                let progressEvent = {
                  id: data.id,
                  text: content,
                  role: 'assistant',
                  conversationId: undefined
                };
                params.onDownloadProgress({ event: progressEvent });
              }
            }
          }
        }
        partialData = lines[lines.length - 1];
      }
    }

    await readStream(reader);

  }

  return response;
}

export function fetchSession<T>() {
  return post<T>({
    url: '/session',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verify',
    data: { token },
  })
}
