/**
 * 이미지 업로더 컴포넌트
 * - 드래그 앤 드롭 지원
 * - 파일 선택 버튼
 * - 미리보기
 * - Supabase Storage 업로드
 */

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

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
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
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

    try {
      // 로컬 미리보기
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Supabase Storage에 업로드
      const formData = new FormData();
      formData.append("file", file);
      
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
    }
  };

  const handleRemove = () => {
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
              <p className="text-sm text-muted-foreground">업로드 중...</p>
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
    </div>
  );
}