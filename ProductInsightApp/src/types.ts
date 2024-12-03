export type RootStackParamList = {
    History: undefined; // History screen has no parameters
    Result: { recognizedText: string | null }; // Result screen now accepts a `recognizedText` parameter
  };
  
  