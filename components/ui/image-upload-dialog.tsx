"use client";

import { useState, useRef } from "react";
import {
	MorphingDialog,
	MorphingDialogTrigger,
	MorphingDialogContent,
	MorphingDialogTitle,
	MorphingDialogSubtitle,
	MorphingDialogClose,
	MorphingDialogContainer,
	useMorphingDialog,
} from "@/components/motion-primitives/morphing-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImageUploadDialogProps {
	onImageUploaded: (formData: FormData) => void;
}

function ImageUploadDialogContent({ onImageUploaded }: ImageUploadDialogProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { setIsOpen } = useMorphingDialog();

	const handleFileSelect = (file: File) => {
		if (file && file.type.startsWith("image/")) {
			setSelectedFile(file);
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(false);
		const file = e.dataTransfer.files[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(false);
	};

	const handleUpload = async () => {
		if (!selectedFile) return;

		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", selectedFile);
			formData.append("positionX", "100"); // Default position
			formData.append("positionY", "100"); // Default position

			onImageUploaded(formData);
			setIsOpen(false);
		} catch (error) {
			console.error("Error uploading image:", error);
			alert("Failed to upload image. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemoveFile = () => {
		setSelectedFile(null);
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<MorphingDialogContainer>
			<MorphingDialogContent
				style={{
					borderRadius: "12px",
				}}
				className="relative h-auto w-[500px] border border-gray-100 bg-white rounded-md shadow-xl"
			>
				<div className="relative p-6 h-full">
					<div className="h-[500px]">
						<MorphingDialogTitle className="text-main-dark mb-2 text-xl">
							<div className="font-medium text-gray-800 flex items-center gap-2">
								📷 Upload Image
							</div>
						</MorphingDialogTitle>
						<MorphingDialogSubtitle className="font-light text-gray-400">
							Add a photo to your fridge board
						</MorphingDialogSubtitle>

						<div className="py-4 flex flex-col gap-y-4 w-full h-full grow">
							{!selectedFile ? (
								<div
									className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
										dragActive
											? "border-blue-400 bg-blue-50"
											: "border-gray-300 hover:border-gray-400"
									}`}
									onDrop={handleDrop}
									onDragOver={handleDragOver}
									onDragLeave={handleDragLeave}
								>
									<div className="space-y-4">
										<div className="text-4xl">📷</div>
										<div>
											<p className="text-lg font-medium text-gray-700 font-jersey">
												Drop an image here
											</p>
											<p className="text-sm text-gray-500 font-jersey">
												or click to browse
											</p>
										</div>
										<input
											ref={fileInputRef}
											type="file"
											accept="image/*"
											onChange={handleFileChange}
											className="hidden"
										/>
										<Button
											onClick={() => fileInputRef.current?.click()}
											className="bg-main-purple text-white hover:bg-main-purple/50 font-jersey text-lg"
										>
											Choose File
										</Button>
									</div>
								</div>
							) : (
								<div className="space-y-4">
									<div className="relative">
										<img
											src={previewUrl!}
											alt="Preview"
											className="w-full h-48 object-cover rounded-lg"
										/>
										<Button
											onClick={handleRemoveFile}
											className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 p-0"
										>
											×
										</Button>
									</div>
									<div className="text-sm text-gray-600">
										<p className="font-medium">{selectedFile.name}</p>
										<p className="text-gray-500">
											{(selectedFile.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
								</div>
							)}

							<Button
								onClick={handleUpload}
								disabled={!selectedFile || isUploading}
								className="w-full bg-main-purple text-white font-jersey text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{isUploading && (
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								)}
								{isUploading ? "Uploading..." : "Upload Image"}
							</Button>
						</div>
					</div>
				</div>
				<MorphingDialogClose className="text-zinc-500" />
			</MorphingDialogContent>
		</MorphingDialogContainer>
	);
}

export default function ImageUploadDialog({
	onImageUploaded,
}: ImageUploadDialogProps) {
	return (
		<MorphingDialog
			transition={{
				type: "spring",
				stiffness: 200,
				damping: 24,
			}}
		>
			<MorphingDialogTrigger>
				<Image
					src="/icons/image.svg"
					alt="Upload Image"
					width={24}
					height={24}
				/>
			</MorphingDialogTrigger>
			<ImageUploadDialogContent onImageUploaded={onImageUploaded} />
		</MorphingDialog>
	);
}
