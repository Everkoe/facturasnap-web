import React, { useState, useRef } from 'react';

export const Scanner = ({ onDocumentFound }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [debugText, setDebugText] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const fileInputRef = useRef(null);

  const processImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Verificar si Tesseract está cargado desde el CDN
    if (typeof Tesseract === 'undefined') {
      alert('El motor de escaneo aún se está cargando o no está disponible.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setDebugText('');

    try {
      const result = await Tesseract.recognize(file, 'spa', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.floor(m.progress * 100));
          }
        },
      });

      const text = result.data.text;
      setDebugText(text);

      // Regex para RUC (11 dígitos empezando por 10, 20, 15, 17)
      const rucMatch = text.match(/\b(10|20|15|17)\d{9}\b/);
      // Regex para DNI (8 dígitos exactos)
      const dniMatch = text.match(/\b\d{8}\b/);

      if (rucMatch) {
        onDocumentFound({ type: '6', number: rucMatch[0] });
      } else if (dniMatch) {
        onDocumentFound({ type: '1', number: dniMatch[0] });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Error al procesar la imagen. Asegúrate de estar conectado a internet.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-dashed border-blue-200 mb-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-700">Escanear Documento</h3>
              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-tighter">Extraer RUC/DNI con IA</p>
            </div>
          </div>
          
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={loading}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              loading ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white shadow-md shadow-blue-100 active:scale-95'
            }`}
          >
            {loading ? 'PROCESANDO...' : 'TOMAR FOTO'}
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={processImage}
        />

        {loading && (
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-1.5 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {debugText && (
          <div className="mt-2">
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="text-[10px] text-blue-500 font-bold uppercase hover:underline"
            >
              {showDebug ? '↑ Ocultar texto' : '↓ Ver texto detectado'}
            </button>
            {showDebug && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-[10px] text-gray-500 font-mono whitespace-pre-wrap border border-gray-100 max-h-32 overflow-y-auto">
                {debugText}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
