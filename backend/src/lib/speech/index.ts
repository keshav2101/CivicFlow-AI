export interface ISpeechProvider {
  transcribeAudioUrl(url: string): Promise<string>;
}

export class OpenAISpeechProvider implements ISpeechProvider {
  async transcribeAudioUrl(url: string): Promise<string> {
    console.log(`[SpeechProvider] Transcribing audio from URL: ${url}`);
    // Whisper API implementation
    return "Transcribed speech text mock.";
  }
}

export const speechProvider: ISpeechProvider = new OpenAISpeechProvider();
