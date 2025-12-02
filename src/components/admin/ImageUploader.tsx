/**
 * 이미지 업로더 컴포넌트
 * - 드래그 앤 드롭 지원
 * - 파일 선택 버튼
 * - 미리보기
 * - Supabase Storage 업로드
 * - 🆕 자동 이미지 최적화 (압축 + 리사이징)
 */

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import imageCompression from "browser-image-compression";

interface ImageUploaderProps {
  pageId?: string;
  stepNumber?: number;
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export function ImageUploader({
  pageId,
  stepNumber,
  currentImageUrl,
  onUploadSuccess,
  label = "이미지 업로드",
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false); // 🆕 압축 중 상태
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null); // 🆕 압축 정보
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // 파일 검증
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("파일 크기는 5MB 이하만 가능합니다.");
      return;
    }

    setError(null);
    setIsUploading(true);
    setIsCompressing(true); // 🆕 압축 중 상태 설정

    try {
      // 🆕 원본 파일 크기 저장
      const originalSize = file.size;

      // 🆕 이미지 최적화 (압축 + 리사이징)
      let compressedFile = file; // 기본값: 원본 파일
      let compressionSucceeded = false;
      
      try {
        const options = {
          maxSizeMB: 0.5,          // 최대 500KB
          maxWidthOrHeight: 1920,  // 최대 1920px (매뉴얼 이미지에 적합)
          useWebWorker: true,      // 백그라운드에서 처리 (UI 블로킹 방지)
        };
        compressedFile = await imageCompression(file, options);
        compressionSucceeded = true;
      } catch (compressionError) {
        console.warn('[ImageUploader] Compression failed, using original file:', compressionError);
        // 압축 실패 시 원본 파일 사용 (에러 발생 안 함)
        compressedFile = file;
      }

      setIsCompressing(false); // 🆕 압축 완료

      // 🆕 압축 정보 계산 및 표시
      if (compressionSucceeded && compressedFile.size < originalSize) {
        const originalMB = (originalSize / 1024 / 1024).toFixed(2);
        const compressedMB = (compressedFile.size / 1024 / 1024).toFixed(2);
        const reduction = Math.round((1 - compressedFile.size / originalSize) * 100);
        
        setCompressionInfo(
          `✅ 최적화 완료: ${originalMB}MB → ${compressedMB}MB (${reduction}% 감소)`
        );
      } else if (compressionSucceeded) {
        // 압축했지만 크기가 같거나 더 큰 경우 (이미 최적화된 이미지)
        setCompressionInfo(
          `ℹ️ 이미 최적화된 이미지입니다 (${(originalSize / 1024 / 1024).toFixed(2)}MB)`
        );
      }

      // 로컬 미리보기
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);

      // Supabase Storage에 업로드
      const formData = new FormData();
      formData.append("file", compressedFile);
      
      // 페이지ID를 기반으로 경로 생성
      const timestamp = Date.now();
      const fileName = stepNumber 
        ? `step${stepNumber}_${timestamp}.${file.name.split('.').pop()}`
        : `header_${timestamp}.${file.name.split('.').pop()}`;
      
      formData.append("pageId", pageId || "general");
      formData.append("fileName", fileName);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8aea8ee5/admin/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      // ✅ 응답 텍스트 먼저 확인
      const responseText = await response.text();
      console.log('[ImageUploader] Response status:', response.status);
      console.log('[ImageUploader] Response text:', responseText);

      // JSON 파싱 시도
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[ImageUploader] JSON parse error:', parseError);
        throw new Error(`서버 응답 파싱 실패: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || `업로드 실패 (${response.status})`);
      }

      // 업로드 성공
      const uploadedUrl = result.data.publicUrl;
      setPreview(uploadedUrl);
      onUploadSuccess(uploadedUrl);
    } catch (err) {
      console.error("Image upload error:", err);
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      setIsCompressing(false); // 🆕 압축 중 상태 해제
    }
  };

  const handleRemove = () => {
    // ⚠️ Storage 삭제는 하지 않음 (저장 버튼 클릭 시 일괄 삭제)
    // UI에서만 제거 표시
    setPreview(null);
    onUploadSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* 미리보기 */}
      {preview && !isUploading && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-2xl rounded-lg border border-border"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 업로드 영역 */}
      {!preview && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-brand bg-accent"
              : "border-border hover:border-brand hover:bg-accent"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
              <p className="text-sm text-muted-foreground">
                {isCompressing ? "이미지 최적화 중..." : "업로드 중..."}
              </p>
            </div>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-foreground mb-2">
                이미지를 드래그하여 업로드하거나
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                파일 선택
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                PNG, JPG, WEBP (최대 5MB)
              </p>
            </>
          )}
        </div>
      )}

      {/* 파일 input (숨김) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 압축 정보 */}
      {compressionInfo && (
        <div className={`border rounded-lg p-3 ${
          compressionInfo.startsWith('✅') 
            ? 'bg-green-50 border-green-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <p className={`text-sm ${
            compressionInfo.startsWith('✅') 
              ? 'text-green-600' 
              : 'text-blue-600'
          }`}>
            {compressionInfo}
          </p>
        </div>
      )}
    </div>
  );
}