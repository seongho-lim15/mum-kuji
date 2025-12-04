"use client";

import { useState, useEffect, useRef } from "react";
import { createWorker } from "tesseract.js";

interface ScanResult {
  id: number;
  extractedCode: string | null;
  imageUrl: string;
}

export default function OcrScanner() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [results, setResults] = useState<ScanResult[]>([]);

  // Tesseract Worker 인스턴스 관리
  const workerRef = useRef<Tesseract.Worker | null>(null);

  // 컴포넌트 마운트 시 Worker 미리 로드 (성능 최적화)
  useEffect(() => {
    const initWorker = async () => {
      // [변경점] v5에서는 createWorker에 언어를 바로 넣습니다.
      // createWorker('언어', OEM(엔진모드), 로거옵션)
      const worker = await createWorker("eng", 1, {
        logger: (m) => console.log(m),
      });

      // loadLanguage, initialize는 이제 필요 없습니다. (자동 수행됨)

      // ★ 화이트리스트 설정은 그대로 유지
      await worker.setParameters({
        tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-",
      });

      workerRef.current = worker;
    };

    initWorker();

    return () => {
      // 언마운트 시 정리
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // 이미지 전처리: 확대(Upscale) + 회색조(Grayscale)
  const preprocessImage = (imageFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // ★ 핵심: 이미지 크기를 2배로 뻥튀기 (작은 글씨 인식률 비약적 상승)
        const scaleFactor = 2;
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        // 이미지를 캔버스에 그리기
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 픽셀 데이터 조작 (회색조 변환)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // 회색조 공식
          const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

          data[i] = gray; // R
          data[i + 1] = gray; // G
          data[i + 2] = gray; // B
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 1.0)); // 품질 100%
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !workerRef.current) return;

    setIsLoading(true);
    setStatusText("이미지 다듬는 중...");

    try {
      // 1. 전처리 (확대 + 흑백)
      const processedImageUrl = await preprocessImage(file);

      setStatusText("글자 읽는 중...");

      // 2. 미리 설정된 Worker로 인식 실행
      const {
        data: { text },
      } = await workerRef.current.recognize(processedImageUrl);

      console.log("Raw OCR Text:", text); // 디버깅용 로그

      let finalCode = "";

      // [전략 1] 엄격한 패턴 매칭 (가장 정확함)
      // 공백을 제거하기 '전' 원본 텍스트에서 "4글자-4글자-4글자-4글자" 패턴을 먼저 찾습니다.
      // 이렇게 하면 상단의 바코드 숫자가 다른 글자와 합쳐지는 것을 방지할 수 있습니다.
      const strictRegex = /([A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})/;
      const strictMatch = text.match(strictRegex);

      if (strictMatch) {
        // 하이픈이 포함된 완벽한 코드를 찾은 경우 바로 채택
        finalCode = strictMatch[0];
        console.log("엄격 모드에서 찾음:", finalCode);
      } else {
        // [전략 2] 느슨한 패턴 매칭 (전략 1 실패 시 백업)
        // OCR이 하이픈(-)을 놓쳤을 수 있으므로, 공백과 하이픈을 다 지우고 16글자를 찾습니다.
        const cleanText = text
          .replace(/\s/g, "")
          .replace(/-/g, "")
          .toUpperCase();

        // 16자리 연속된 영문/숫자 찾기
        const looseMatch = cleanText.match(/([A-Z0-9]{16})/);

        if (looseMatch) {
          const raw = looseMatch[0];

          // ★ 중요: 바코드 필터링
          // 찾은 16글자가 '모두 숫자'라면 상품 바코드일 확률이 높으므로 무시합니다.
          // (보통 더블찬스 코드는 영어가 섞여 있습니다)
          const isAllNumber = /^[0-9]+$/.test(raw);

          if (!isAllNumber) {
            // 숫자가 아닌 것이 섞여 있다면 코드로 인정하고 하이픈을 넣어줍니다.
            finalCode = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
            console.log("느슨 모드에서 찾음 (포맷팅 적용):", finalCode);
          } else {
            finalCode = "인식 실패 (바코드 숫자만 인식됨)";
            console.log("바코드로 의심되어 무시함:", raw);
          }
        } else {
          finalCode = "인식 실패 (다시 찍어주세요)";
        }
      }

      setResults((prev) => [
        {
          id: Date.now(),
          extractedCode: finalCode,
          imageUrl: processedImageUrl,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setStatusText("");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">쿠지 더블찬스 스캐너</h1>

      <label
        className={`block w-full p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isLoading ? "bg-gray-100 border-gray-300" : "bg-blue-50 border-blue-400 hover:bg-blue-100"}`}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">📸</span>
          <span className="font-bold text-gray-700">
            {isLoading ? statusText : "여기를 눌러 사진 찍기"}
          </span>
          {!isLoading && (
            <span className="text-xs text-gray-500">
              코드 부분이 잘 보이게 가까이 찍어주세요
            </span>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          // capture="environment"
          onChange={handleImageUpload}
          className="hidden"
          disabled={isLoading}
        />
      </label>

      <div className="mt-6 space-y-4">
        {results.map((res) => (
          <div
            key={res.id}
            className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm"
          >
            <p className="text-xs text-gray-400 mb-1">인식 결과</p>

            {/* 결과 수정 가능하도록 input으로 제공 (중요 UX) */}
            <input
              type="text"
              defaultValue={res.extractedCode || ""}
              className="w-full text-xl font-mono font-bold text-center text-gray-800 border-b-2 border-green-500 focus:outline-none focus:border-green-700 bg-transparent mb-3 pb-1"
            />

            <details>
              <summary className="text-xs text-gray-400 cursor-pointer">
                원본 이미지 보기
              </summary>
              <img
                src={res.imageUrl}
                alt="processed"
                className="mt-2 w-full rounded border"
              />
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
